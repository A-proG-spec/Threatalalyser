import { PageWrapper } from '../components/layout/PageWrapper';
import { useDashboardStats } from '../api/history';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Activity, ArrowRight } from 'lucide-react';

export function Dashboard() {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <PageWrapper showGlow={false}>
        <div className="text-center mt-32 text-gray-500 animate-pulse">Loading dashboard...</div>
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <PageWrapper showGlow={false}>
        <div className="text-center mt-32 text-red-400">Failed to load statistics. Please sign in again.</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper showGlow={false}>
      <div className="max-w-5xl mx-auto mt-12">
        <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#0A0A0A] p-8 rounded-2xl flex flex-col items-center justify-center hover:bg-[#111] transition-colors">
            <Activity className="w-8 h-8 text-blue-500 mb-4" />
            <span className="text-4xl font-bold text-white mb-2">{data.totalInvestigations}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Total Lookups</span>
          </div>
          
          <div className="bg-[#0A0A0A] p-8 rounded-2xl flex flex-col items-center justify-center hover:bg-[#111] transition-colors">
            <ShieldAlert className="w-8 h-8 text-red-500 mb-4" />
            <span className="text-4xl font-bold text-white mb-2">{data.threatsDetected}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Threats Found</span>
          </div>

          <div className="bg-[#0A0A0A] p-8 rounded-2xl flex flex-col items-center justify-center hover:bg-[#111] transition-colors">
            <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
            <span className="text-4xl font-bold text-white mb-2">{data.safeInvestigations}</span>
            <span className="text-xs text-gray-500 uppercase tracking-widest">Safe Results</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium">Recent Activity</h2>
          <Link to="/history" className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex flex-col">
          {data.recentInvestigations.length === 0 ? (
            <p className="text-gray-500 py-8">No recent investigations found.</p>
          ) : (
            data.recentInvestigations.map((inv) => (
              <Link 
                to={`/report/${inv.id}`} 
                key={inv.id} 
                className="flex items-center justify-between py-5 border-b border-[#1A1A1A] hover:bg-[#0A0A0A] px-4 -mx-4 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-gray-300 group-hover:text-white transition-colors">
                    {inv.indicator.normalizedValue}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-gray-600">
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`text-sm font-bold w-20 text-right ${
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