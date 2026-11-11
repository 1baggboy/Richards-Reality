import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Users, Briefcase, ChevronRight, Command } from 'lucide-react';
import { BlogPost, TeamMember, WebsiteSettings } from '../types';

interface SearchResult {
  id: string;
  type: 'blog' | 'service' | 'team';
  title: string;
  description: string;
  tab: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (tab: string, id?: string) => void;
  blogs: BlogPost[];
  team: TeamMember[];
  settings: WebsiteSettings;
}

export default function GlobalSearch({ isOpen, onClose, onSelect, blogs, team, settings }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const searchResults: SearchResult[] = [];
  if (query.trim()) {
    const q = query.toLowerCase();

    // Search Blogs
    blogs.forEach(blog => {
      if (blog.title.toLowerCase().includes(q) || blog.shortDesc.toLowerCase().includes(q)) {
        searchResults.push({
          id: blog.id,
          type: 'blog',
          title: blog.title,
          description: blog.shortDesc,
          tab: 'blog'
        });
      }
    });

    // Search Team
    team.forEach(member => {
      if (member.name.toLowerCase().includes(q) || member.position.toLowerCase().includes(q) || member.bio.toLowerCase().includes(q)) {
        searchResults.push({
          id: member.id,
          type: 'team',
          title: member.name,
          description: member.position,
          tab: 'team'
        });
      }
    });

    const services = [
      { name: 'Real Estate Consultancy', desc: 'Lease audits, portfolio restructuring, workplace optimization.' },
      { name: 'Property Valuation Services', desc: 'RICS Red Book compliant certified evaluations.' },
      { name: 'Investment Advisory', desc: 'Macroeconomic modeling, risk indices, and acquisition advisory.' },
      { name: 'Facility Management Advice', desc: 'Operational risk management audits and energy compliance.' },
      { name: 'Property Documentation Assistance', desc: 'Municipal zoning validation and title audits.' },
      { name: 'Development Advisory', desc: 'Architectural envelope modeling and feasibility studies.' },
      { name: 'Project Management Advisory', desc: 'Technical developer representation and cost estimation.' },
      { name: 'Legal Consultation', desc: 'Eminent domain consultation and technical legal diagnostics.' }
    ];

    services.forEach(svc => {
      if (svc.name.toLowerCase().includes(q) || svc.desc.toLowerCase().includes(q)) {
        searchResults.push({
          id: svc.name,
          type: 'service',
          title: svc.name,
          description: svc.desc,
          tab: 'services'
        });
      }
    });

    if (q.includes('track') || q.includes('status') || q.includes('app') || q.includes('ref') || q.includes('rr-') || q.includes('req-')) {
      searchResults.unshift({
        id: 'track-application',
        type: 'service',
        title: 'Track Application Status',
        description: 'Check real-time processing status of your submitted rental application or application using your Reference ID.',
        tab: 'track'
      });
    }
  }

  const groupedResults = searchResults.reduce((acc, res) => {
    if (!acc[res.type]) acc[res.type] = [];
    acc[res.type].push(res);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const flatGroupedResults = Object.values(groupedResults).flat();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex(prev => (prev + 1) % Math.max(flatGroupedResults.length, 1));
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex(prev => (prev - 1 + flatGroupedResults.length) % Math.max(flatGroupedResults.length, 1));
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (flatGroupedResults[selectedIndex]) {
        const res = flatGroupedResults[selectedIndex];
        onSelect(res.tab, res.id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-40 px-4">
      <div 
        className="absolute inset-0 bg-[#0A1D37]/80 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 slide-in-from-top-4 duration-200 rounded-none overflow-hidden flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-slate-800">
          <Search className="h-5 w-5 text-[#C5A02E] shrink-0" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search advisory services, insights, or team members..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none px-4 py-1 text-sm text-[#0A1D37] dark:text-white focus:outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center gap-2">
            {query && (
              <button 
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                className="p-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[10px] text-gray-500 font-bold uppercase tracking-widest rounded-none">
              ESC
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-[#0A1D37] dark:hover:text-white transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {query && flatGroupedResults.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-slate-400 font-sans">No results found for "<span className="font-bold text-[#0A1D37] dark:text-white">{query}</span>"</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-2 font-bold">Try searching for "Valuation", "Zoning", or "Audit"</p>
            </div>
          ) : query ? (
            <div className="p-2 space-y-4">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className="space-y-1">
                  <div className="px-3 py-1 bg-gray-50 dark:bg-slate-800/50 border-y border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-[#C5A02E] uppercase tracking-[0.2em]">{type}s</span>
                    <span className="text-[8px] text-gray-400 uppercase font-sans font-bold">{items.length} hit{items.length > 1 ? 's' : ''}</span>
                  </div>
                  {items.map((res) => {
                    const idx = flatGroupedResults.findIndex(f => f.id === res.id && f.type === res.type);
                    const isActive = selectedIndex === idx;
                    return (
                      <button
                        key={`${res.type}-${res.id}`}
                        onClick={() => {
                          onSelect(res.tab, res.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full text-left p-3 flex items-start gap-4 transition-all border ${isActive ? 'bg-[#F4F7F9] dark:bg-slate-800 border-[#C5A02E]' : 'bg-transparent border-transparent'}`}
                      >
                        <div className={`p-2 shrink-0 ${isActive ? 'bg-[#C5A02E] text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400'}`}>
                          {res.type === 'blog' && <FileText className="h-4 w-4" />}
                          {res.type === 'team' && <Users className="h-4 w-4" />}
                          {res.type === 'service' && <Briefcase className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-xs font-bold uppercase tracking-tight truncate ${isActive ? 'text-[#0A1D37] dark:text-white' : 'text-[#0A1D37]/70 dark:text-slate-300'}`}>{res.title}</span>
                          </div>
                          <p className={`text-[11px] line-clamp-1 ${isActive ? 'text-gray-600 dark:text-slate-400' : 'text-gray-400 dark:text-slate-500'}`}>{res.description}</p>
                        </div>
                        <ChevronRight className={`h-4 w-4 self-center transition-transform ${isActive ? 'text-[#C5A02E] translate-x-0' : 'text-transparent'}`} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Command className="h-4 w-4 text-[#C5A02E]" />
                <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Recent Searches & Tools</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => { onSelect('services'); onClose(); }} className="text-left p-4 bg-[#F4F7F9] dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border-l-4 border-l-[#C5A02E] group">
                  <h4 className="text-xs font-bold text-[#0A1D37] dark:text-white mb-1 uppercase tracking-tight group-hover:text-[#C5A02E] transition-colors">Services Directory</h4>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Explore our core advisory domains</p>
                </button>
                <button onClick={() => { onSelect('blog'); onClose(); }} className="text-left p-4 bg-[#F4F7F9] dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors border-l-4 border-l-[#0A1D37] group">
                  <h4 className="text-xs font-bold text-[#0A1D37] dark:text-white mb-1 uppercase tracking-tight group-hover:text-[#C5A02E] transition-colors">Market Insights</h4>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">Read our latest macroeconomic analysis</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[9px] font-bold text-[#0A1D37] dark:text-white">↑</span>
                <span className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[9px] font-bold text-[#0A1D37] dark:text-white">↓</span>
              </div>
              <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Navigate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[9px] font-bold text-[#0A1D37] dark:text-white">ENTER</span>
              <span className="text-[9px] text-gray-400 dark:text-slate-500 uppercase font-bold tracking-widest">Select</span>
            </div>
          </div>
          <p className="text-[10px] text-[#C5A02E] font-bold italic tracking-tighter">Richards Realty Global Index</p>
        </div>
      </div>
    </div>
  );
}
