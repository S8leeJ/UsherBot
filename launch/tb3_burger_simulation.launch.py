"""TurtleBot3 Burger + Nav2 Gazebo simulation (nav2_bringup tb3_simulation)."""

from launch import LaunchDescription
from launch.actions import IncludeLaunchDescription, SetEnvironmentVariable
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import PathJoinSubstitution
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    return LaunchDescription(
        [
            SetEnvironmentVariable('TURTLEBOT3_MODEL', 'burger'),
            IncludeLaunchDescription(
                PythonLaunchDescriptionSource(
                    [
                        PathJoinSubstitution(
                            [
                                FindPackageShare('nav2_bringup'),
                                'launch',
                                'tb3_simulation_launch.py',
                            ]
                        )
                    ]
                ),
                launch_arguments={
                    'headless': 'False'
                    }.items(),
            ),
        ]
    )
