import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-3" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
