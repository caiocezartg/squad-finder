interface ConnectionStatusProps {
  isConnected: boolean;
  isSubscribed?: boolean;
  showLabel?: boolean;
}

export function ConnectionStatus({
  isConnected,
  isSubscribed,
  showLabel = true,
}: ConnectionStatusProps) {
  if (!isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-danger">
        <span className="size-1.5 rounded-full bg-danger" />
        {showLabel && "Disconnected"}
      </span>
    );
  }

  if (isSubscribed !== undefined && !isSubscribed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-yellow-400">
        <span className="size-1.5 rounded-full bg-yellow-400 animate-pulse" />
        {showLabel && "Connecting..."}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-accent">
      <span className="size-1.5 rounded-full bg-accent" />
      {showLabel && "Live"}
    </span>
  );
}
