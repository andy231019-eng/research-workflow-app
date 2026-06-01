'use client'

interface Props {
  message: string;
  subMessage?: string;
  elapsedSeconds?: number;
  statusHint?: string;
  progress?: number;
  progressLabel?: string;
}

export default function LoadingState({
  message,
  subMessage,
  elapsedSeconds,
  statusHint,
  progress,
  progressLabel,
}: Props) {
  const boundedProgress =
    typeof progress === "number" ? Math.max(0, Math.min(100, progress)) : undefined;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-gray-800 font-medium">{message}</p>
      {subMessage && (
        <p className="text-sm text-gray-500">{subMessage}</p>
      )}
      {boundedProgress !== undefined && (
        <div className="max-w-md mx-auto space-y-2">
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gray-900 transition-all duration-500 ease-out"
              style={{ width: `${boundedProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{progressLabel ?? "處理中"}</span>
            <span className="font-medium text-gray-700">{Math.round(boundedProgress)}%</span>
          </div>
        </div>
      )}
      {(elapsedSeconds !== undefined || statusHint) && (
        <div className="space-y-1">
          {elapsedSeconds !== undefined && (
            <p className="text-xs font-medium text-gray-500">
              已等待 {elapsedSeconds} 秒
            </p>
          )}
          {statusHint && (
            <p className="text-xs text-gray-500">{statusHint}</p>
          )}
        </div>
      )}
    </div>
  );
}
