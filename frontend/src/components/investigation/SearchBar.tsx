// src/components/investigation/SearchBar.tsx
import { useState, FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (indicator: string) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group">
      {/* Subtle glow effect on focus */}
      <div className="absolute -inset-0.5 bg-blue-500/20 rounded-full blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
      
      <div className="relative flex items-center bg-[#111111] rounded-full p-2">
        <Search className="w-6 h-6 text-gray-500 ml-4" />
        <input 
          type="text" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a URL, domain, or IP address..." 
          className="flex-1 bg-transparent text-white px-4 py-3 text-lg outline-none placeholder-gray-600"
          disabled={isLoading}
        />
        <Button type="submit" isLoading={isLoading} className="mr-1">
          Analyze
        </Button>
      </div>
    </form>
  );
}