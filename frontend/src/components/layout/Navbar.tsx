// src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  // Helper to highlight the active link
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md">
      {/* Logo Area */}
      <Link to="/" className="flex items-center gap-2 text-white font-semibold text-lg tracking-wide hover:opacity-80 transition-opacity">
        <Shield className="w-6 h-6 text-white" />
        ThreatLens 
        <span className="text-xs font-normal text-gray-500 ml-2 border border-gray-700 px-2 py-0.5 rounded-full">
          Preview
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link 
          to="/" 
          className={`transition-colors ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Investigate
        </Link>
        <Link 
          to="/history" 
          className={`transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        >
          History
        </Link>
        <Link 
          to="/dashboard" 
          className={`transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Dashboard
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <Link 
          to="/login" 
          className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-gray-200 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </nav>
  );
}