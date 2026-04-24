export type NavResult = 'succeeded' | 'aborted' | 'rejected' | 'canceled' | 'failed';

const TERMINAL: ReadonlySet<string> = new Set([
  'succeeded',
  'aborted',
  'rejected',
  'canceled',
  'failed',
]);

function bridgeBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_ROSBRIDGE_URL || 'http://localhost:9090';
  return raw.replace(/^ws/, 'http');
}

export async function sendNavGoal(
  x: number,
  y: number,
  onResult: (result: NavResult) => void,
): Promise<() => void> {
  const base = bridgeBaseUrl();

  const res = await fetch(`${base}/goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y }),
  });
  if (!res.ok) {
    throw new Error(`Bridge returned ${res.status}`);
  }
  const { goal_id } = (await res.json()) as { goal_id: string };

  let cancelled = false;
  const poll = async () => {
    while (!cancelled) {
      await new Promise((r) => setTimeout(r, 1000));
      if (cancelled) return;
      try {
        const sres = await fetch(`${base}/status/${goal_id}`);
        if (!sres.ok) continue;
        const data = (await sres.json()) as { status: string; reason?: string };
        if (TERMINAL.has(data.status)) {
          onResult(data.status as NavResult);
          return;
        }
      } catch {
        // network blip — keep polling
      }
    }
  };
  void poll();

  return () => {
    cancelled = true;
    void fetch(`${base}/cancel/${goal_id}`, { method: 'POST' }).catch(() => {});
  };
}
