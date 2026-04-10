import rclpy  # Import the ROS 2 Python client library
from rclpy.node import Node  # Import the Node class for creating nodes

def main():
    rclpy.init()  # Initialize the ROS 2 client library
    node = Node("my_node")  # Create a new node
    rclpy.spin(node)  # Keep the node running
    rclpy.shutdown()  # Shutdown the ROS 2 client library