// src/components/investigation/ProviderCard.tsx
import type { ProviderResult } from '../../types';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';

export function ProviderCard({ result }: { result: ProviderResult }) {
  // Map status to icon and color
  const StatusIcon = {
    SUCCESS: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    FAILED: <XCircle className="w-5 h-5 text-red-500" />,
    TIMEOUT: <Clock className="w-5 h-5 text-orange-500" />,
    RATE_LIMITED: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
    SKIPPED: <XCircle className="w-5 h-5 text-gray-500" />,
  }[result.status] || <AlertTriangle className="w-5 h-5 text-gray-500" />;

  return (
    <div className="flex items-center justify-between py-6 px-8 bg-[#0A0A0A] hover:bg-[#111111] transition-colors">
      
      {/* Provider Info */}
      <div className="flex items-center gap-4 min-w-[200px]">
        {StatusIcon}
        <span className="font-semibold text-lg">{result.provider}</span>
      </div>

      {/* Detection Details */}
      <div className="flex-1 px-8">
        {result.status === 'SUCCESS' ? (
          result.detectionCount !== null && result.totalEngines ? (
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm mb-1 text-gray-400">
                <span>Detections</span>
                <span>{result.detectionCount} / {result.totalEngines}</span>
              </div>
              {/* Progress Bar (Borderless) */}
              <div className="h-1.5 w-full bg-[#222222] rounded-full overflow-hidden">
                <div 
                  className={`h-full ${result.detectionCount > 0 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${(result.detectionCount / result.totalEngines) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <span className="text-sm text-green-500">No threats detected</span>
          )
        ) : (
          <span className="text-sm text-gray-500 italic">
            {result.errorMessage || 'Provider unavailable'}
          </span>
        )}
      </div>

      {/* Cache Indicator */}
      <div className="text-xs text-gray-600 uppercase tracking-widest">
        {result.cacheHit ? 'Cached' : 'Live API'}
      </div>
      
    </div>
  );
}