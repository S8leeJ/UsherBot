import type * as ROSLIB from 'roslib';

let roslibPromise: Promise<typeof ROSLIB> | null = null;

async function getROSLIB() {
  if (!roslibPromise) {
    roslibPromise = import('roslib') as Promise<typeof ROSLIB>;
  }
  return roslibPromise;
}

export type NavResult = 'succeeded' | 'aborted' | 'rejected' | 'canceled';

export async function sendNavGoal(
  x: number,
  y: number,
  onResult: (result: NavResult) => void,
): Promise<() => void> {
  const R = await getROSLIB();
  const url = process.env.NEXT_PUBLIC_ROSBRIDGE_URL || 'ws://localhost:9090';
  const ros = new R.Ros({ url });

  await new Promise<void>((resolve, reject) => {
    ros.once('connection', () => resolve());
    ros.once('error', (e: unknown) => reject(e));
  });

  const actionClient = new R.ActionClient({
    ros,
    serverName: '/navigate_to_pose',
    actionName: 'nav2_msgs/action/NavigateToPose',
  });

  const goal = new R.Goal({
    actionClient,
    goalMessage: {
      pose: {
        header: { frame_id: 'map', stamp: { secs: 0, nsecs: 0 } },
        pose: {
          position: { x, y, z: 0 },
          orientation: { x: 0, y: 0, z: 0, w: 1 },
        },
      },
    },
  });

  let done = false;
  goal.on('status', (status: { status: number }) => {
    if (done) return;
    // GoalStatus: 4=SUCCEEDED, 5=ABORTED, 6=REJECTED, 2=CANCELED
    if (status.status === 4) {
      done = true;
      onResult('succeeded');
      ros.close();
    } else if (status.status === 5) {
      done = true;
      onResult('aborted');
      ros.close();
    } else if (status.status === 6) {
      done = true;
      onResult('rejected');
      ros.close();
    } else if (status.status === 2) {
      done = true;
      onResult('canceled');
      ros.close();
    }
  });

  goal.send();

  return () => {
    if (!done) goal.cancel();
    ros.close();
  };
}
