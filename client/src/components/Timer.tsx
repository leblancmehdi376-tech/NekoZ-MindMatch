import { useEffect, useState } from 'react';

export default function Timer({ deadline }: { deadline: number | null }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
  }, []);

  if (!deadline) return null;
  const remainingMs = Math.max(0, deadline - now);
  const seconds = Math.ceil(remainingMs / 1000);
  const urgent = seconds <= 5;

  return (
    <div
      className={`text-3xl font-black tabular-nums transition-colors ${
        urgent ? 'text-red-400 animate-pulse' : 'text-white'
      }`}
    >
      {seconds}s
    </div>
  );
}
