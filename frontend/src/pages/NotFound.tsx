// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';

export function NotFound() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center mt-32 text-center">
        <h1 className="text-9xl font-bold text-[#222]">404</h1>
        <p className="text-2xl text-white mt-4 mb-8">Page not found</p>
        <Link to="/" className="text-gray-400 hover:text-white underline">
          Return to Investigate
        </Link>
      </div>
    </PageWrapper>
  );
}