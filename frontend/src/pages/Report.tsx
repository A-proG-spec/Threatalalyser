// src/pages/Report.tsx
import { useParams, Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { RiskScore } from '../components/investigation/RiskScore';
import { ProviderCard } from '../components/investigation/ProviderCard';
import { useGetInvestigation } from '../api/investigation';
import { ArrowLeft, Clock, Database, Sparkles, Target } from 'lucide-react';

export function Report() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useGetInvestigation(id || '');

  if (isLoading) return <PageWrapper><div className="text-center mt-32 text-gray-500 animate-pulse">Loading report...</div></PageWrapper>;
  if (error || !data) return <PageWrapper><div className="text-center mt-32 text-red-400">Report not found.</div></PageWrapper>;

  const { indicator, investigation, providerResults, assessment } = data;
  const mitre = assessment.explanation?.mitreTechniques || [];

  return (
    <PageWrapper showGlow={false}>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> New Investigation
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#222]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 bg-[#222] text-xs font-mono rounded text-gray-400">
              {indicator.type}
            </span>
            <h1 className="text-xl font-semibold text-white">
              {indicator.normalizedValue}
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 font-mono">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(investigation.createdAt).toLocaleString()}</span>
            <span className="flex items-center gap-1"><Database className="w-3 h-3" /> {investigation.id.slice(0, 8)}</span>
          </div>
        </div>
      </div>

      {/* Top Section: Score & AI Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-1 bg-[#0A0A0A] rounded-2xl p-6 flex flex-col justify-center">
          <RiskScore score={assessment.score} level={assessment.level} summary={null} />
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* AI Summary Box */}
          {assessment.aiSummary && (
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4" /> AI Analyst Summary
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed relative z-10">
                {assessment.aiSummary}
              </p>
            </div>
          )}

          {/* MITRE ATT&CK Tags */}
          {mitre.length > 0 && (
            <div className="bg-[#0A0A0A] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2 mb-4">
                <Target className="w-4 h-4" /> MITRE ATT&CK Techniques
              </h3>
              <div className="flex flex-wrap gap-2">
                {mitre.map((tech) => (
                  <span key={tech.id} className="px-3 py-1 bg-[#222] text-gray-300 text-xs rounded-full border border-[#333]">
                    <strong className="text-white">{tech.id}</strong> - {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Provider Results */}
      <div className="max-w-4xl">
        <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">
          Source Intelligence
        </h3>
        <div className="flex flex-col border-t border-[#222]">
          {providerResults.map((result) => (
            <ProviderCard key={result.id} result={result} />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}