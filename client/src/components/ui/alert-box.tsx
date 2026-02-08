interface AlertBoxProps {
  type: "error" | "success" | "warning";
  message: string;
  onClose?: () => void;
}

const styles = {
  error: "bg-red-100 border-red-400 text-red-700",
  success: "bg-green-100 border-green-400 text-green-700",
  warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
};

export function AlertBox({ type, message, onClose }: AlertBoxProps) {
  return (
    <div className={`border px-4 py-3 rounded mb-4 ${styles[type]}`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-lg font-bold hover:opacity-70"
            aria-label="Close"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
