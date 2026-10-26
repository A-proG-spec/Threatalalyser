// src/pages/History.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useHistoryList } from '../api/history';
import { ArrowRight, ChevronLeft, ChevronRight, Activity } from 'lucide-react';

export function History() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useHistoryList(page);

  if (isLoading) return <PageWrapper showGlow={false}><div className="text-center mt-32 text-gray-500 animate-pulse">Loading history...</div></PageWrapper>;
  if (error || !data) return <PageWrapper showGlow={false}><div className="text-center mt-32 text-red-400">Failed to load history.</div></PageWrapper>;

  return (
    <PageWrapper showGlow={false}>
      <div className="max-w-5xl mx-auto mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Investigation History</h1>
            <p className="text-sm text-gray-500">Review your past threat intelligence lookups.</p>
          </div>
          <Link to="/" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors">
            New Scan
          </Link>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-[#0A0A0A] rounded-t-xl text-xs font-bold text-gray-500 uppercase tracking-widest">
          <div className="col-span-5">Indicator</div>
          <div className="col-span-3">Date</div>
          <div className="col-span-2 text-center">Risk Score</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="flex flex-col border-x border-b border-[#1A1A1A] rounded-b-xl overflow-hidden">
          {data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Activity className="w-8 h-8 mb-4 opacity-50" />
              <p>No investigations found. Start by searching for an IP or URL.</p>
            </div>
          ) : (
            data.items.map((item) => (
              <Link 
                to={`/report/${item.id}`} 
                key={item.id} 
                className="grid grid-cols-12 gap-4 px-4 py-4 items-center hover:bg-[#0A0A0A] transition-colors border-b border-[#1A1A1A] last:border-0 group"
              >
                <div className="col-span-5 flex flex-col truncate">
                  <span className="font-mono text-sm text-gray-200 group-hover:text-white transition-colors truncate">
                    {item.indicator.normalizedValue}
                  </span>
                  <span className="text-xs text-gray-600 mt-0.5">{item.indicator.type}</span>
                </div>
                
                <div className="col-span-3 text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()} <br/>
                  <span className="text-gray-600">{new Date(item.createdAt).toLocaleTimeString()}</span>
                </div>

                <div className="col-span-2 flex justify-center">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    item.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                    item.riskLevel === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                    item.riskLevel === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-500' :
                    item.riskLevel === 'LOW' ? 'bg-green-500/10 text-green-500' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {item.riskScore !== null ? item.riskScore : '-'} {item.riskLevel}
                  </span>
                </div>

                <div className="col-span-2 flex justify-end">
                  <span className="text-gray-500 group-hover:text-white flex items-center gap-1 text-sm transition-colors">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-500">
              Showing page {data.page} of {data.totalPages} ({data.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-[#111] text-gray-400 rounded-lg hover:text-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="p-2 bg-[#111] text-gray-400 rounded-lg hover:text-white disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}