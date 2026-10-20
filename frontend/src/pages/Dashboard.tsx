// src/pages/Dashboard.tsx
import { PageWrapper } from '../components/layout/PageWrapper';

export function Dashboard() {
  return (
    <PageWrapper showGlow={false}>
      <h1 className="text-3xl font-semibold mb-8">Dashboard</h1>
      <p className="text-gray-400">Statistics and recent activity will go here.</p>
    </PageWrapper>
  );
}