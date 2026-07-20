import React, { useState } from 'react';
import { Building2, Mail, Phone, MapPin, Clock, Send, CheckCircle2, Linkedin, Twitter, Facebook, Lock } from 'lucide-react';

interface FooterProps {
  setTab: (tab: string) => void;
  onBookClick: () => void;
  onAdminClick: () => void;
}

export default function Footer({ setTab, onBookClick, onAdminClick }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubscribed(true);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.error || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      setError('Could not establish connection to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const services = [
    { name: 'Real Estate Consultancy', tab: 'services' },
    { name: 'Property Valuation Services', tab: 'services' },
    { name: 'Investment Advisory', tab: 'services' },
    { name: 'Facility Management', tab: 'services' },
    { name: 'Land Documentation', tab: 'services' },
    { name: 'Legal Consultation', tab: 'services' },
  ];

  const quickLinks = [
    { name: 'About Company', tab: 'about' },
    { name: 'Mission & Vision', tab: 'mission' },
    { name: 'Our Elite Team', tab: 'team' },
    { name: 'Media Gallery', tab: 'gallery' },
    { name: 'Corporate Blog', tab: 'blog' },
    { name: 'Career Vacancies', tab: 'careers' },
    { name: 'Frequently Asked Questions', tab: 'faq' },
    { name: 'Contact Corporate', tab: 'contact' },
  ];

  const handleLinkClick = (tab: string) => {
    setTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A1D37] text-gray-300 font-sans border-t border-gray-800">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Brief & Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-left">
              <div className="p-2 bg-[#C5A02E] rounded-none">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-sans font-semibold text-base tracking-wider text-white block leading-none">
                  RICHARDS REALTY
                </span>
                <span className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#C5A02E]">
                  LLC • Consultancy
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Richards Realty LLC is a premier corporate advisory and valuation firm. We deliver RICS-compliant valuations, commercial transaction consulting, facility management advice, and zoning-document compliance with strict integrity.
            </p>
            {/* Newsletter */}
            <div className="space-y-3 pt-2">
              <span className="text-xs text-white uppercase font-semibold tracking-wider block">
                Corporate Insights
              </span>
              {isSubscribed ? (
                <div className="flex items-center gap-2 bg-white border border-gray-300 p-3 rounded-none text-[#C5A02E] text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Subscribed! Welcome to our advisory network.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <div className="flex bg-white rounded-none border border-gray-300 focus-within:border-[#C5A02E] transition-colors">
                    <input
                      type="email"
                      placeholder="business@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="bg-transparent px-3 py-2 text-xs text-[#0A1D37] focus:outline-none w-full font-sans placeholder:text-slate-600"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-slate-800 text-white px-3.5 transition-all flex items-center justify-center cursor-pointer"
                      aria-label="Subscribe"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {error && <p className="text-[10px] text-rose-500 font-sans">{error}</p>}
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <span className="text-sm font-sans font-bold text-white tracking-wider uppercase block border-l-2 border-[#C5A02E] pl-3">
              Corporate Links
            </span>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => handleLinkClick(link.tab)}
                    className="text-gray-400 hover:text-[#C5A02E] transition-colors text-left cursor-pointer"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Services */}
          <div className="space-y-6">
            <span className="text-sm font-sans font-bold text-white tracking-wider uppercase block border-l-2 border-[#C5A02E] pl-3">
              Advisory Services
            </span>
            <ul className="space-y-2.5 text-xs">
              {services.map((svc) => (
                <li key={svc.name}>
                  <button
                    onClick={() => handleLinkClick(svc.tab)}
                    className="text-gray-400 hover:text-[#C5A02E] transition-colors text-left cursor-pointer"
                  >
                    {svc.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={onBookClick}
              className="text-xs font-semibold text-[#C5A02E] hover:text-[#A68625] hover:underline cursor-pointer flex items-center gap-1"
            >
              Request Advisory Briefing →
            </button>
          </div>

          {/* Contact Details & Hours */}
          <div className="space-y-6">
            <span className="text-sm font-sans font-bold text-white tracking-wider uppercase block border-l-2 border-[#C5A02E] pl-3">
              HQ Contact
            </span>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#C5A02E] shrink-0 mt-0.5" />
                <span className="text-gray-400">600 Montgomery St, 41st Floor,<br />San Francisco, CA 94111</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#C5A02E] shrink-0" />
                <a href="tel:+18005550190" className="text-gray-400 hover:text-white font-sans">+1 (800) 555-0190</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#C5A02E] shrink-0" />
                <a href="mailto:consulting@richardsrealty.com" className="text-gray-400 hover:text-white font-sans">consulting@richardsrealty.com</a>
              </li>
              <li className="flex items-start gap-2.5 pt-1.5 border-t border-gray-800">
                <Clock className="h-4 w-4 text-[#C5A02E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Office Hours:</p>
                  <p className="text-gray-400">Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p className="text-gray-400">Saturday: By Appointment</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Google Map & Footnote Map Split */}
        <div className="mt-12 pt-12 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-none overflow-hidden h-[180px] bg-white border border-gray-300">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.7853689405024!2d-122.40487002422204!3d37.79517597198124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808580f49d8c3667%3A0x7d87f73cfeb88ec3!2sTransamerica%20Pyramid!5e0!3m2!1sen!2sus!4v1710000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Richards Realty HQ Location"
            ></iframe>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-white font-semibold uppercase block">Regulatory Audited Firm</span>
              <p className="text-[11px] text-gray-400 leading-normal">
                Richards Realty LLC operates as an accredited commercial advisory firm. All client engagement agreements are subjected to standard California municipal oversight and financial disclosure procedures. This website serves purely as a corporate informational directory.
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a id="footer-linkedin" href="https://linkedin.com/company/richardsrealty" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="LinkedIn" title="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a id="footer-twitter" href="https://twitter.com/richardsrealty" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="Twitter" title="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a id="footer-facebook" href="https://facebook.com/richardsrealty" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="Facebook" title="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 py-6 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} Richards Realty LLC. All Rights Reserved. Accredited Corporate Real Estate Advisors.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-slate-500">
            <button onClick={() => handleLinkClick('privacy')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => handleLinkClick('terms')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => handleLinkClick('cookies')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Cookie Policy</button>
            <button onClick={() => handleLinkClick('disclaimer')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Disclaimer</button>
            <button onClick={() => handleLinkClick('sitemap')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Sitemap</button>
            <button id="footer-admin-btn" onClick={onAdminClick} className="hover:text-[#C5A02E] text-[#0A1D37] font-semibold transition-colors cursor-pointer flex items-center gap-1">
              <Lock className="h-3 w-3 text-[#C5A02E]" /> Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
