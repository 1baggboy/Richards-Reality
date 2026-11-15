import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onBookClick: () => void;
  onApplyClick?: () => void;
  onSearchClick?: () => void;
  settings?: WebsiteSettings;
}

export default function Header({ currentTab, setTab, onBookClick, onApplyClick, settings }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'services', label: 'Services' },
    { id: 'mission', label: 'Mission & Vision' },
    { id: 'team', label: 'Team' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'blog', label: 'Blog' },
    { id: 'careers', label: 'Careers' },
    { id: 'faq', label: 'FAQs' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setTab(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHome = currentTab === 'home';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-slate-800 py-3.5'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 lg:gap-8">
          
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group text-left shrink-0"
          >
            <div className="w-10 h-10 bg-[#0A1D37] flex items-center justify-center rotate-45 shrink-0 group-hover:scale-105 transition-transform duration-200 border border-[#C5A02E]/40 shadow-sm">
              <span className="text-[#C5A02E] -rotate-45 font-serif text-2xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-xl font-bold tracking-tight uppercase text-[#0A1D37] dark:text-white whitespace-nowrap">
                {settings?.general?.companyName || "Howard Homes"}
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A02E] font-semibold whitespace-nowrap">
                Consultancy & Excellence
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-8 2xl:gap-10 text-xs font-semibold uppercase tracking-widest font-sans shrink-0">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors cursor-pointer whitespace-nowrap py-1 relative ${
                  currentTab === item.id
                    ? 'text-[#C5A02E] font-bold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C5A02E]'
                    : 'text-[#0A1D37] dark:text-slate-200 hover:text-[#C5A02E]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-5 shrink-0">
            <button
              onClick={() => handleNavClick('track')}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer font-sans whitespace-nowrap ${
                currentTab === 'track'
                  ? 'text-[#C5A02E]'
                  : 'text-[#0A1D37] dark:text-slate-200 hover:text-[#C5A02E]'
              }`}
              title="Track Application Status"
            >
              Track Status
            </button>

            <button
              onClick={onApplyClick || (() => handleNavClick('apply'))}
              className="bg-[#0A1D37] hover:bg-slate-800 text-[#C5A02E] border border-[#C5A02E]/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer font-sans whitespace-nowrap"
            >
              Apply Now
            </button>

            <button
              onClick={onBookClick}
              className="bg-[#C5A02E] hover:bg-[#a88824] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer font-sans whitespace-nowrap"
            >
              Book Consultation
            </button>
          </div>

          {/* Mobile / Tablet Drawer Toggle */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#0A1D37] dark:text-white hover:text-[#0A1D37] transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1 max-h-[80vh] overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-2.5 text-sm font-sans font-medium rounded-none transition-colors ${
                  currentTab === item.id
                    ? 'bg-gray-100 dark:bg-slate-800 text-[#C5A02E] border-l-2 border-[#C5A02E] pl-3 font-bold'
                    : 'text-[#0A1D37] dark:text-slate-200 hover:bg-[#F4F7F9] dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 px-4 flex flex-col gap-3 border-t border-gray-200 dark:border-slate-800 mt-2">
              <a
                href={`tel:${settings?.general?.phone?.replace(/\s+/g, '') || "+18005550190"}`}
                className="flex items-center justify-center gap-2 text-xs text-[#0A1D37] dark:text-slate-200 py-2.5 border border-gray-300 dark:border-slate-700 rounded-none font-sans font-bold"
              >
                <Phone className="h-4 w-4 text-[#C5A02E]" />
                {settings?.general?.phone || "+1 (800) 555-0190"}
              </a>
              <button
                onClick={() => {
                  handleNavClick('track');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 text-[#0A1D37] dark:text-white border border-gray-300 dark:border-slate-700 font-sans font-bold text-center py-2.5 rounded-none text-xs tracking-wider"
              >
                TRACK APPLICATION STATUS
              </button>
              <button
                onClick={() => {
                  if (onApplyClick) onApplyClick();
                  else handleNavClick('apply');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#0A1D37] text-[#C5A02E] border border-[#C5A02E]/40 font-sans font-bold text-center py-3 rounded-none text-xs tracking-wider shadow-md"
              >
                APPLY NOW
              </button>
              <button
                onClick={() => {
                  onBookClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#C5A02E] hover:bg-[#A68625] text-white font-sans font-bold text-center py-3 rounded-none text-xs tracking-wider shadow-md"
              >
                BOOK CONSULTATION
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
