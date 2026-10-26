// src/pages/Investigate.tsx
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/investigation/SearchBar';
import { useInvestigate, useGlobalStats } from '../api/investigation';
import { 
  Activity, Users, Database, ShieldCheck, 
  Zap, BrainCircuit, Server, CheckCircle2 
} from 'lucide-react';
import { AxiosError } from 'axios';

export function Investigate() {
  const navigate = useNavigate();
  const { mutate: runInvestigation, isPending, error } = useInvestigate();
  const { data: stats } = useGlobalStats();

  const handleSearch = (indicator: string) => {
    runInvestigation(indicator, {
      onSuccess: (data) => navigate(`/report/${data.investigation.id}`),
    });
  };

  const errorMessage = (error as AxiosError<{ error: { message: string } }>)?.response?.data?.error?.message;

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center mt-8 md:mt-12 pb-12">
        
        {/* ── 1. HERO SECTION ── */}
        <span className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Threat Intelligence Engine
        </span>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-5 leading-tight text-center">
          Investigate your assets.<br />
          Secure your perimeter.
        </h1>

        <p className="max-w-2xl text-sm md:text-base text-gray-400 mb-8 leading-relaxed text-center">
          Enter any URL, domain, or IP address to generate a comprehensive risk assessment 
          with AI-driven analysis and MITRE ATT&CK mapping.
        </p>

        <div className="w-full max-w-2xl z-20 mb-6">
          <SearchBar onSearch={handleSearch} isLoading={isPending} />
        </div>

        {errorMessage && (
          <div className="mb-6 text-red-400 bg-red-400/10 px-6 py-3 rounded-lg text-sm">
            {errorMessage}
          </div>
        )}

        {/* ── 2. SYSTEM STATUS BAR ── */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-16 text-xs text-gray-500 font-mono bg-[#0A0A0A] px-6 py-3 rounded-full border border-[#1A1A1A]">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            API Gateway: Online
          </span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            VirusTotal: Operational
          </span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            URLhaus & AbuseIPDB: Operational
          </span>
        </div>

        {/* ── 3. GLOBAL STATISTICS ── */}
        {stats && (
          <div className="w-full max-w-4xl mt-4 bg-[#0A0A0A] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#1A1A1A]">
            <div className="flex flex-col items-center flex-1">
              <Users className="w-5 h-5 text-gray-500 mb-2" />
              <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Registered Users</span>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-[#1A1A1A]" />

            <div className="flex flex-col items-center flex-1">
              <Activity className="w-5 h-5 text-gray-500 mb-2" />
              <span className="text-2xl font-bold text-white">{stats.totalInvestigations}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total Scans</span>
            </div>
            
            <div className="hidden md:block w-px h-12 bg-[#1A1A1A]" />

            <div className="flex flex-col items-center flex-1">
              <Database className="w-5 h-5 text-red-500 mb-2" />
              <span className="text-2xl font-bold text-white">{stats.threatsDetected}</span>
              <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Threats Identified</span>
            </div>
          </div>
        )}

        {/* ── 4. DESCRIPTION SECTION (How it works) ── */}
        <div className="w-full max-w-4xl mt-20">
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold text-white mb-2">How ThreatLens Works</h2>
            <p className="text-sm text-gray-500">Harnessing the power of multi-source intelligence to keep you safe.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#1A1A1A]">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <Server className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-medium text-white mb-2">Multi-Source Aggregation</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                We concurrently query VirusTotal, URLhaus, and AbuseIPDB, normalizing data from multiple independent security vendors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#1A1A1A]">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-medium text-white mb-2">AI Threat Analysis</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Our backend uses Google Gemini to interpret raw JSON reports and provide a human-readable, actionable summary.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-[#1A1A1A]">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-base font-medium text-white mb-2">MITRE ATT&CK Mapping</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Indicators are mapped against the MITRE ATT&CK framework, helping you understand the specific adversary tactics in play.
              </p>
            </div>
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}