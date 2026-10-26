// src/pages/Dashboard.tsx
import { PageWrapper } from '../components/layout/PageWrapper';
import { useDashboardStats } from '../api/history';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Activity, ArrowRight } from 'lucide-react';

export function Dashboard() {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) return <PageWrapper showGlow={false}><div className="text-center mt-32 text-gray-500 animate-pulse">Loading dashboard...</div></PageWrapper>;
  if (error || !data) return <PageWrapper showGlow={false}><div className="text-center mt-32 text-red-400">Failed to load statistics.</div></PageWrapper>;

  return (
    <PageWrapper showGlow={false}>
      <div className="max-w-5xl mx-auto mt-8">
        <h1 className="text-2xl font-semibold mb-6">Overview</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-[#0A0A0A] p-6 rounded-2xl flex flex-col items-center justify-center">
            <Activity className="w-6 h-6 text-blue-500 mb-3" />
            <span className="text-3xl font-bold text-white mb-1">{data.totalInvestigations}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Total Lookups</span>
          </div>
          
          <div className="bg-[#0A0A0A] p-6 rounded-2xl flex flex-col items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-500 mb-3" />
            <span className="text-3xl font-bold text-white mb-1">{data.threatsDetected}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Threats Found</span>
          </div>

          <div className="bg-[#0A0A0A] p-6 rounded-2xl flex flex-col items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-green-500 mb-3" />
            <span className="text-3xl font-bold text-white mb-1">{data.safeInvestigations}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Safe Results</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex items-center justify-between mb-4 mt-8">
          <h2 className="text-base font-medium text-gray-300">Recent Investigations</h2>
          <Link to="/history" className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        
        <div className="flex flex-col border-t border-[#222]">
          {data.recentInvestigations.length === 0 ? (
            <p className="text-gray-500 py-8 text-sm">No recent investigations found.</p>
          ) : (
            data.recentInvestigations.map((inv) => (
              <Link 
                to={`/report/${inv.id}`} 
                key={inv.id} 
                className="flex items-center justify-between py-4 border-b border-[#222] hover:bg-[#0A0A0A] px-2 -mx-2 transition-colors group"
              >
                <span className="font-mono text-sm text-gray-300 group-hover:text-white transition-colors">
                  {inv.indicator.normalizedValue}
                </span>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-gray-600">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`text-xs font-bold w-16 text-right ${
                    inv.riskLevel === 'CRITICAL' || inv.riskLevel === 'HIGH' ? 'text-red-500' : 
                    inv.riskLevel === 'MEDIUM' ? 'text-yellow-500' : 
                    inv.riskLevel === 'LOW' ? 'text-green-500' : 'text-gray-500'
                  }`}>
                    {inv.riskLevel}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}