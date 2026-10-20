// src/pages/History.tsx
import { PageWrapper } from '../components/layout/PageWrapper';

export function History() {
  return (
    <PageWrapper showGlow={false}>
      <div className="max-w-4xl mx-auto mt-12">
        <h1 className="text-3xl font-semibold mb-8">Investigation History</h1>
        <div className="text-gray-500 text-center py-20 border border-dashed border-gray-800 rounded-lg">
          Authentication required to view history. (Backend connection pending)
        </div>
      </div>
    </PageWrapper>
  );
}