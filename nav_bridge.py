#!/usr/bin/env python3
"""HTTP bridge: POST /goal {x, y} -> Nav2 /navigate_to_pose, GET /status/<id>."""

import json
import threading
import uuid
from http.server import BaseHTTPRequestHandler, HTTPServer

import rclpy
from action_msgs.msg import GoalStatus
from nav2_msgs.action import NavigateToPose
from rclpy.action import ActionClient
from rclpy.executors import MultiThreadedExecutor
from rclpy.node import Node


class NavBridge(Node):
    def __init__(self):
        super().__init__('nav_bridge')
        self._client = ActionClient(self, NavigateToPose, 'navigate_to_pose')
        self._goals = {}
        self._lock = threading.Lock()

    def send(self, goal_id: str, x: float, y: float) -> None:
        with self._lock:
            self._goals[goal_id] = {'status': 'connecting', 'handle': None}

        if not self._client.wait_for_server(timeout_sec=5.0):
            with self._lock:
                self._goals[goal_id] = {'status': 'failed',
                                         'reason': 'navigate_to_pose action server not available'}
            return

        msg = NavigateToPose.Goal()
        msg.pose.header.frame_id = 'map'
        msg.pose.header.stamp = self.get_clock().now().to_msg()
        msg.pose.pose.position.x = float(x)
        msg.pose.pose.position.y = float(y)
        msg.pose.pose.orientation.w = 1.0

        with self._lock:
            self._goals[goal_id]['status'] = 'navigating'

        self.get_logger().info(f'Sending goal {goal_id}: ({x}, {y})')
        future = self._client.send_goal_async(msg)
        future.add_done_callback(lambda f: self._on_accepted(goal_id, f))

    def _on_accepted(self, goal_id: str, future) -> None:
        handle = future.result()
        if not handle.accepted:
            self.get_logger().warn(f'Goal {goal_id} rejected')
            with self._lock:
                self._goals[goal_id] = {'status': 'rejected'}
            return
        with self._lock:
            self._goals[goal_id]['handle'] = handle
        result_future = handle.get_result_async()
        result_future.add_done_callback(lambda f: self._on_result(goal_id, f))

    def _on_result(self, goal_id: str, future) -> None:
        status = future.result().status
        mapping = {
            GoalStatus.STATUS_SUCCEEDED: 'succeeded',
            GoalStatus.STATUS_ABORTED: 'aborted',
            GoalStatus.STATUS_CANCELED: 'canceled',
        }
        label = mapping.get(status, 'failed')
        self.get_logger().info(f'Goal {goal_id} -> {label} (status={status})')
        with self._lock:
            self._goals[goal_id] = {'status': label}

    def status(self, goal_id: str) -> dict:
        with self._lock:
            info = self._goals.get(goal_id)
            if info is None:
                return {'status': 'unknown'}
            return {k: v for k, v in info.items() if k != 'handle'}

    def cancel(self, goal_id: str) -> bool:
        with self._lock:
            info = self._goals.get(goal_id)
            handle = info.get('handle') if info else None
        if handle is None:
            return False
        handle.cancel_goal_async()
        return True


class Handler(BaseHTTPRequestHandler):
    bridge: NavBridge = None

    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _json(self, code: int, payload: dict):
        self.send_response(code)
        self._cors()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        if self.path == '/goal':
            length = int(self.headers.get('Content-Length', 0))
            try:
                body = json.loads(self.rfile.read(length))
                x = float(body['x'])
                y = float(body['y'])
            except (ValueError, KeyError, json.JSONDecodeError) as e:
                self._json(400, {'error': f'bad request: {e}'})
                return
            goal_id = uuid.uuid4().hex
            threading.Thread(target=self.bridge.send,
                             args=(goal_id, x, y), daemon=True).start()
            self._json(200, {'goal_id': goal_id})
            return

        if self.path.startswith('/cancel/'):
            goal_id = self.path.rsplit('/', 1)[-1]
            ok = self.bridge.cancel(goal_id)
            self._json(200, {'canceled': ok})
            return

        self._json(404, {'error': 'not found'})

    def do_GET(self):
        if self.path.startswith('/status/'):
            goal_id = self.path.rsplit('/', 1)[-1]
            self._json(200, self.bridge.status(goal_id))
            return
        if self.path == '/health':
            self._json(200, {'ok': True})
            return
        self._json(404, {'error': 'not found'})

    def log_message(self, fmt, *args):
        return


def main():
    rclpy.init()
    bridge = NavBridge()
    Handler.bridge = bridge

    server = HTTPServer(('0.0.0.0', 9090), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    bridge.get_logger().info('nav_bridge listening on http://0.0.0.0:9090')

    executor = MultiThreadedExecutor()
    executor.add_node(bridge)
    try:
        executor.spin()
    except KeyboardInterrupt:
        pass
    finally:
        server.shutdown()
        bridge.destroy_node()
        rclpy.shutdown()


if __name__ == '__main__':
    main()
