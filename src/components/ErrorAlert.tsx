'use client'

interface Props {
  error: string;
  onRetry?: () => void;
  onReset: () => void;
}

export default function ErrorAlert({ error, onRetry, onReset }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-red-700 mb-2">發生錯誤</h2>
        <p className="text-sm text-red-600 font-mono whitespace-pre-wrap">{error}</p>
      </div>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            重試
          </button>
        )}
        <button
          onClick={onReset}
          className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
        >
          重新開始
        </button>
      </div>
    </div>
  );
}
