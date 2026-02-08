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
      <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Disconnected
      </div>
    );
  }

  if (isSubscribed === undefined) {
    return (
      <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        {showLabel ? "Connected" : null}
      </div>
    );
  }

  if (isSubscribed) {
    return (
      <span className="text-xs text-green-600 font-normal">(live)</span>
    );
  }

  return (
    <span className="text-xs text-yellow-600 font-normal">(connecting...)</span>
  );
}
