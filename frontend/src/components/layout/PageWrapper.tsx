// src/components/layout/PageWrapper.tsx
import type { ReactNode } from 'react'; // <-- Changed to "import type"
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PageWrapperProps {
  children: ReactNode;
  showGlow?: boolean;
}

export function PageWrapper({ children, showGlow = true }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative flex flex-col">
      
      {/* Background Glow */}
      {showGlow && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-900/15 blur-[120px] rounded-full pointer-events-none" />
      )}
      
      <Navbar />
      
      {/* Main Content Area */}
      <main className="relative z-10 pt-24 px-6 pb-12 max-w-6xl mx-auto w-full flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}