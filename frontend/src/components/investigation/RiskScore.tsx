// src/components/investigation/RiskScore.tsx
import type { RiskLevel } from '../../types';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  summary: string | null;
}

export function RiskScore({ score, level, summary }: RiskScoreProps) {
  // Map risk levels to colors
  const colors: Record<RiskLevel, string> = {
    UNKNOWN: 'text-gray-400',
    LOW: 'text-green-500',
    MEDIUM: 'text-yellow-500',
    HIGH: 'text-orange-500',
    CRITICAL: 'text-red-500',
  };

  const bgColors: Record<RiskLevel, string> = {
    UNKNOWN: 'bg-gray-400/10',
    LOW: 'bg-green-500/10',
    MEDIUM: 'bg-yellow-500/10',
    HIGH: 'bg-orange-500/10',
    CRITICAL: 'bg-red-500/10',
  };

  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <span className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">
        Overall Risk Assessment
      </span>
      
      <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${bgColors[level]} mb-6`}>
        <span className={`text-5xl font-bold ${colors[level]}`}>
          {score}
        </span>
      </div>

      <h2 className={`text-3xl font-semibold mb-2 ${colors[level]}`}>
        {level} RISK
      </h2>
      
      {summary && (
        <p className="max-w-xl text-gray-400">
          {summary}
        </p>
      )}
    </div>
  );
}