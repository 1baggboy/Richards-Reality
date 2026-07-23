import { useState, useEffect } from 'react';
import { Menu, X, Building2, Phone } from 'lucide-react';
import { WebsiteSettings } from '../types';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onBookClick: () => void;
  settings?: WebsiteSettings;
}

export default function Header({ currentTab, setTab, onBookClick, settings }: HeaderProps) {
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
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group text-left"
          >
            <div className="w-10 h-10 bg-[#0A1D37] flex items-center justify-center rotate-45 shrink-0 group-hover:scale-105 transition-transform duration-200">
              <span className="text-[#C5A02E] -rotate-45 font-serif text-2xl font-bold">R</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight uppercase text-[#0A1D37]">
                {settings?.general?.companyName || "Richards Realty"}
              </span>
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#C5A02E] font-semibold">
                Consultancy & Excellence
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-widest font-sans">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors cursor-pointer ${
                  currentTab === item.id
                    ? 'text-[#C5A02E]'
                    : 'text-[#0A1D37] hover:text-[#C5A02E]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Consultation Button */}
          <div className="hidden lg:flex items-center">
            <button
              onClick={onBookClick}
              className="bg-[#C5A02E] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#A68625] transition-all cursor-pointer font-sans"
            >
              Book Consultation
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#0A1D37] hover:text-[#0A1D37] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 text-sm font-sans font-medium rounded-none transition-colors ${
                  currentTab === item.id
                    ? 'bg-gray-100 text-[#C5A02E] border-l-2 border-[#C5A02E] pl-3'
                    : 'text-[#0A1D37] hover:bg-[#F4F7F9] hover:text-[#0A1D37]'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 px-4 flex flex-col gap-3">
              <a
                href={`tel:${settings?.general?.phone?.replace(/\s+/g, '') || "+18005550190"}`}
                className="flex items-center justify-center gap-2 text-sm text-[#0A1D37] py-2 border border-gray-300 rounded-none font-sans"
              >
                <Phone className="h-4 w-4 text-[#C5A02E]" />
                {settings?.general?.phone || "+1 (800) 555-0190"}
              </a>
              <button
                onClick={() => {
                  onBookClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-[#C5A02E] hover:bg-[#A68625] text-white font-sans font-semibold text-center py-3 rounded-none text-xs tracking-wide shadow-md"
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
