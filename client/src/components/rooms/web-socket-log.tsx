interface WebSocketLogProps {
  messages: string[];
  maxHeight?: string;
}

export function WebSocketLog({ messages, maxHeight = "h-64" }: WebSocketLogProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">WebSocket Log</h2>
      <div
        className={`bg-gray-900 text-green-400 p-4 rounded font-mono text-sm ${maxHeight} overflow-y-auto`}
      >
        {messages.length === 0 ? (
          <p className="text-gray-500">Waiting for events...</p>
        ) : (
          messages.map((msg, i) => <div key={i}>{msg}</div>)
        )}
      </div>
    </div>
  );
}
