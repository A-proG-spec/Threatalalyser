import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface PageWrapperProps {
  children: ReactNode;
  /** 
   * Set to true if you don't want the giant blue glow (e.g., for the History page)
   * Default is true to match the homepage hero look.
   */
  showGlow?: boolean;
}

export function PageWrapper({ children, showGlow = true }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-hidden">
      
      {/* The Background Glow (only shows if showGlow is true) */}
      {showGlow && (
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />
      )}
      
      <Navbar />
      
      {/* Main Content Area - pt-32 pushes content below the fixed Navbar */}
      <main className="relative z-10 pt-32 px-6 pb-20 max-w-7xl mx-auto">
        {children}
      </main>
      
    </div>
  );
}