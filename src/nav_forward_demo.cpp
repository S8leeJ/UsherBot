#include <chrono>
#include <iomanip>
#include <memory>

#include <geometry_msgs/msg/point.hpp>
#include <geometry_msgs/msg/pose_stamped.hpp>
#include <geometry_msgs/msg/transform_stamped.hpp>
#include <nav2_msgs/action/navigate_to_pose.hpp>
#include <rclcpp/rclcpp.hpp>
#include <rclcpp_action/rclcpp_action.hpp>
#include <tf2_ros/transform_broadcaster.hpp>

using namespace std::chrono_literals;

using NavigateToPose = nav2_msgs::action::NavigateToPose;
using GoalHandleNavigateToPose = rclcpp_action::ClientGoalHandle<NavigateToPose>;

void publish_navigation_goal_tf(
  rclcpp::Node & node,
  tf2_ros::TransformBroadcaster & broadcaster,
  const geometry_msgs::msg::PoseStamped & goal_pose);

class NavDemo : public rclcpp::Node
{
public:
  NavDemo() : Node("nav_demo")
  {
    client_ = rclcpp_action::create_client<NavigateToPose>(this, "navigate_to_pose");
  }

  bool wait_for_server() {
    while (rclcpp::ok() && !client_->wait_for_action_server(1s)) {
      RCLCPP_INFO_STREAM(get_logger(), "Waiting for navigate_to_pose action server...");
    }

    if(rclcpp::ok()) {
      RCLCPP_INFO_STREAM(get_logger(), "Connected to navigate_to_pose action server");
      return true;
    } else {
      RCLCPP_ERROR_STREAM(get_logger(), "Interrupted while waiting for action server");
      return false;
    }
  }

  void send_goal() {
    NavigateToPose::Goal goal_msg;
    goal_msg.pose.header.frame_id = "base_link";
    goal_msg.pose.header.stamp = rclcpp::Time(0);

    goal_msg.pose.pose.position.x = 1.0;
    goal_msg.pose.pose.position.y = 0.0;
    goal_msg.pose.pose.position.z = 0.0;
    goal_msg.pose.pose.orientation.x = 0.0;
    goal_msg.pose.pose.orientation.y = 0.0;
    goal_msg.pose.pose.orientation.z = 0.0;
    goal_msg.pose.pose.orientation.w = 1.0;

    RCLCPP_INFO_STREAM(get_logger(), "Sending goal");

    publish_navigation_goal_tf(*this, tf_broadcaster_, goal_msg.pose);

    rclcpp_action::Client<NavigateToPose>::SendGoalOptions options;
    options.goal_response_callback =
      std::bind(&NavDemo::goal_response_callback, this, std::placeholders::_1);
    options.feedback_callback =
      std::bind(&NavDemo::feedback_callback, this, std::placeholders::_1, std::placeholders::_2);
    options.result_callback =
      std::bind(&NavDemo::result_callback, this, std::placeholders::_1);

    client_->async_send_goal(goal_msg, options);
  }

  private:
  void goal_response_callback(const GoalHandleNavigateToPose::SharedPtr & goal_handle)
  {
    if (!goal_handle) {
      RCLCPP_ERROR(get_logger(), "Goal was rejected by server");
      rclcpp::shutdown();
      return;
    }

    RCLCPP_INFO_STREAM(get_logger(), "Goal accepted");
  }

  void feedback_callback(
    GoalHandleNavigateToPose::SharedPtr,
    const std::shared_ptr<const NavigateToPose::Feedback> feedback)
  {
    const geometry_msgs::msg::Point & p = feedback->current_pose.pose.position;
    RCLCPP_INFO_STREAM(
      get_logger(),
      "Current pose: x=" << p.x << " y=" << p.y);
  }

  void result_callback(const GoalHandleNavigateToPose::WrappedResult & result)
  {
    switch (result.code) {
      case rclcpp_action::ResultCode::SUCCEEDED:
        RCLCPP_INFO_STREAM(get_logger(), "Navigation succeeded");
        break;
      case rclcpp_action::ResultCode::ABORTED:
        RCLCPP_ERROR(get_logger(), "Navigation aborted");
        break;
      case rclcpp_action::ResultCode::CANCELED:
        RCLCPP_WARN(get_logger(), "Navigation canceled");
        break;
      default:
        RCLCPP_ERROR(get_logger(), "Unknown result code");
        break;
    }

    rclcpp::shutdown();
  }

  rclcpp_action::Client<NavigateToPose>::SharedPtr client_;
  tf2_ros::TransformBroadcaster tf_broadcaster_{this};
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  std::shared_ptr<NavDemo> node = std::make_shared<NavDemo>();
  if(node->wait_for_server()) {
    node->send_goal();
    rclcpp::spin(node);
  }
  return 0;
}


//Hide the code down here from the class! Don't forget!!



















void publish_navigation_goal_tf(
  rclcpp::Node & node,
  tf2_ros::TransformBroadcaster & broadcaster,
  const geometry_msgs::msg::PoseStamped & goal_pose)
{
  geometry_msgs::msg::TransformStamped t;
  t.header.stamp = node.now();
  t.header.frame_id = goal_pose.header.frame_id;
  t.child_frame_id = "navigation_goal";
  t.transform.translation.x = goal_pose.pose.position.x;
  t.transform.translation.y = goal_pose.pose.position.y;
  t.transform.translation.z = goal_pose.pose.position.z;
  t.transform.rotation = goal_pose.pose.orientation;
  broadcaster.sendTransform(t);
}