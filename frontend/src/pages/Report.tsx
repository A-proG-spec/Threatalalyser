// src/pages/Report.tsx
import { useParams, Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RiskScore } from '../components/investigation/RiskScore';
import { ProviderCard } from '../components/investigation/ProviderCard';
import { useGetInvestigation } from '../api/investigation';
import { ArrowLeft, Clock, Database } from 'lucide-react';

export function Report() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetInvestigation(id || '');

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center mt-32 text-gray-500 animate-pulse">
          Loading report data...
        </div>
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center mt-32">
          <p className="text-red-400 mb-4">Failed to load investigation report.</p>
          <Link to="/" className="text-white hover:underline flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const { indicator, investigation, providerResults, assessment } = data;

  return (
    <PageWrapper showGlow={false}>
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> New Investigation
      </Link>

      {/* Indicator Header */}
      <div className="flex items-center justify-between mb-12 border-b border-[#222] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-1 bg-[#222] text-xs font-medium rounded text-gray-300">
              {indicator.type}
            </span>
            <h1 className="text-2xl font-semibold text-white">
              {indicator.normalizedValue}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(investigation.createdAt).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              ID: {investigation.id.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Risk Score Hero */}
      <RiskScore 
        score={assessment.score} 
        level={assessment.level} 
        summary={investigation.summary} 
      />

      {/* Explanation (from the backend risk engine) */}
      {assessment.explanation && (
        <div className="mt-12 text-center max-w-3xl mx-auto">
          <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4">
            Assessment Details
          </h3>
          <p className="text-gray-300 text-lg">
            {assessment.explanation.humanReadableSummary}
          </p>
        </div>
      )}

      {/* Provider Results List (No Cards, Just Rows) */}
      <div className="mt-20 max-w-4xl mx-auto">
        <h3 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-6 px-2">
          Source Intelligence
        </h3>
        <div className="flex flex-col">
          {providerResults.map((result) => (
            <ProviderCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}