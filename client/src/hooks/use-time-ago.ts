import { useState, useEffect } from "react";

function getTimeAgo(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

export function useTimeAgo(date: Date | string | undefined): string {
  const [timeAgo, setTimeAgo] = useState(() =>
    date ? getTimeAgo(new Date(date)) : "",
  );

  useEffect(() => {
    if (!date) return;
    const parsed = new Date(date);
    setTimeAgo(getTimeAgo(parsed));

    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(parsed));
    }, 30_000);

    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
}
