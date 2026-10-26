// src/components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import { Shield, Code, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#000000] border-t border-[#1A1A1A] pt-16 pb-8 px-8 mt-auto z-10 relative">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        
        {/* Column 1: Brand */}
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2 text-white font-semibold text-lg tracking-wide">
            <Shield className="w-5 h-5" />
            ThreatLens
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed">
            Multi-source cyber threat intelligence platform. Aggregate, analyze, and act on threat data in real-time.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <Code className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Column 2: Product */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-medium text-sm mb-2">Product</h4>
          <Link to="/" className="text-gray-500 text-sm hover:text-white transition-colors">Investigations</Link>
          <Link to="/dashboard" className="text-gray-500 text-sm hover:text-white transition-colors">Dashboard</Link>
          <Link to="/history" className="text-gray-500 text-sm hover:text-white transition-colors">History</Link>
          <Link to="/profile" className="text-gray-500 text-sm hover:text-white transition-colors">Account Settings</Link>
        </div>

        {/* Column 3: Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-medium text-sm mb-2">Resources</h4>
          <a href="https://www.virustotal.com" target="_blank" rel="noreferrer" className="text-gray-500 text-sm hover:text-white transition-colors">VirusTotal API</a>
          <a href="https://urlhaus.abuse.ch" target="_blank" rel="noreferrer" className="text-gray-500 text-sm hover:text-white transition-colors">URLhaus API</a>
          <a href="https://www.abuseipdb.com" target="_blank" rel="noreferrer" className="text-gray-500 text-sm hover:text-white transition-colors">AbuseIPDB API</a>
          <a href="https://attack.mitre.org" target="_blank" rel="noreferrer" className="text-gray-500 text-sm hover:text-white transition-colors">MITRE ATT&CK</a>
        </div>

        {/* Column 4: Legal */}
        <div className="flex flex-col gap-3">
          <h4 className="text-white font-medium text-sm mb-2">Legal</h4>
          <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="text-gray-500 text-sm hover:text-white transition-colors">API Terms</a>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
        <p>© {new Date().getFullYear()} ThreatLens. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>Built for INSA Cyber Talent Summer Camp</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>
    </footer>
  );
}