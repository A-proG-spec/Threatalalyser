// src/components/layout/Navbar.tsx
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth to show/hide links

export function Navbar() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2 text-white font-semibold text-lg tracking-wide hover:opacity-80 transition-opacity">
        <Shield className="w-6 h-6 text-white" />
        ThreatLens 
        <span className="text-xs font-normal text-gray-500 ml-2 border border-gray-700 px-2 py-0.5 rounded-full">
          Preview
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <Link 
          to="/" 
          className={`transition-colors ${isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Investigate
        </Link>
        
        {user && (
          <>
            <Link 
              to="/dashboard" 
              className={`transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/history" 
              className={`transition-colors ${isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
              History
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Link 
            to="/profile" 
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
              isActive('/profile') ? 'bg-gray-200 text-black' : 'bg-white text-black hover:bg-gray-200'
            }`}
          >
            Profile
          </Link>
        ) : (
          <Link 
            to="/login" 
            className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-gray-200 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}