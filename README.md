# nav2_demo

## TurtleBot3 Burger simulation launch

`tb3_burger_simulation.launch.py` wraps Nav2’s `tb3_simulation_launch.py`: it sets `TURTLEBOT3_MODEL=burger` and runs with Gazebo **not** headless (`headless:=False`).

**Build & run**

```bash
colcon build --packages-select nav2_demo
source install/setup.bash
ros2 launch nav2_demo tb3_burger_simulation.launch.py
```

Requires `nav2_bringup` (and its sim deps) on your ROS distro.

## Nav goal demo (`nav_forward_demo`)

Small C++ example: waits for the `navigate_to_pose` action and TF `map` → `base_footprint`, then sends a pose **1 m straight ahead** of the robot (in the base frame, expressed in `map`).

With the sim running and localization ready:

```bash
ros2 run nav2_demo nav_forward_demo
```
