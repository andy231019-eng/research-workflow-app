'use client'

interface Props {
  message: string;
  subMessage?: string;
  elapsedSeconds?: number;
  statusHint?: string;
}

export default function LoadingState({ message, subMessage, elapsedSeconds, statusHint }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-gray-800 font-medium">{message}</p>
      {subMessage && (
        <p className="text-sm text-gray-500">{subMessage}</p>
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
