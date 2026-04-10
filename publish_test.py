import rclpy
from nav2_simple_commander.robot_navigator import BasicNavigator, TaskResult
from geometry_msgs.msg import PoseStamped

def main():
    rclpy.init()
    nav = BasicNavigator()

    # 1. Wait for Navigation to be ready
    # This ensures the map, costmaps, and planners are all alive
    nav.waitUntilNav2Active()

    # 2. Define your goal location
    goal_pose = PoseStamped()
    goal_pose.header.frame_id = 'map'  # Move relative to the room map
    goal_pose.header.stamp = nav.get_clock().now().to_msg()

    # Set coordinates (in meters)
    goal_pose.pose.position.x = 1.0  # 1 meter forward on the map
    goal_pose.pose.position.y = 0.0
    goal_pose.pose.orientation.w = 1.0 # Facing "Forward"

    # 3. Send the goal
    print("Sending goal to Nav2...")
    nav.goToPose(goal_pose)

    # 4. Monitor the status
    while not nav.isTaskComplete():
        feedback = nav.getFeedback()
        if feedback:
            print(f"Distance remaining: {feedback.distance_remaining:.2f} m")

    # 5. Handle the final result
    result = nav.getResult()
    if result == TaskResult.SUCCEEDED:
        print("Success! Arrived at destination.")
    elif result == TaskResult.CANCELED:
        print("Goal was canceled.")
    elif result == TaskResult.FAILED:
        print("Navigation failed. Check for obstacles.")

    rclpy.shutdown()

if __name__ == '__main__':
    main()


