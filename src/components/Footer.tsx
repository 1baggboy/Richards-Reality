import React, { useState, useEffect, useRef } from 'react';
import { Building2, Mail, Phone, MapPin, Clock, Send, CheckCircle2, Linkedin, Twitter, Facebook, Lock, Instagram } from 'lucide-react';
import { useToast } from './ui/Toast';
import { WebsiteSettings } from '../types';
import { logAnalyticsEvent } from '../lib/analytics';
import FooterGoogleMap from './FooterGoogleMap';

interface FooterProps {
  setTab: (tab: string) => void;
  onBookClick: () => void;
  googleMapIframe?: string;
  settings?: WebsiteSettings;
}

export default function Footer({ setTab, onBookClick, googleMapIframe, settings }: FooterProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const newsletterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          logAnalyticsEvent('impression');
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (newsletterRef.current) {
      observer.observe(newsletterRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      const msg = 'Please provide a valid corporate email address.';
      setError(msg);
      toastWarning(msg, 'Invalid Email');
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
        logAnalyticsEvent('signup');
        toastSuccess("You have successfully subscribed to the company's newsletter!", 'Subscription Confirmed');
        setEmail('');
      } else {
        const data = await response.json();
        const msg = data.error || 'Subscription failed. Please try again.';
        setError(msg);
        toastError(msg, 'Subscription Error');
      }
    } catch (err) {
      const msg = 'Could not establish connection to the server.';
      setError(msg);
      toastError(msg, 'Connection Failure');
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
    { name: 'Apply Now', tab: 'apply' },
    { name: 'Track Application', tab: 'track' },
    { name: 'Mission & Vision', tab: 'mission' },
    { name: 'Our Elite Team', tab: 'team' },
    { name: 'Media Gallery', tab: 'gallery' },
    { name: 'Corporate Blog', tab: 'blog' },
    { name: 'Frequently Asked Questions', tab: 'faq' },
    { name: 'Contact Corporate', tab: 'contact' },
  ];

  const handleLinkClick = (tab: string) => {
    setTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0A1D37] text-gray-300 font-sans border-t border-gray-800">
      {/* Newsletter Header Section */}
      <div ref={newsletterRef} className="bg-[#F4F7F9]/5 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center lg:text-left space-y-2">
              <h3 className="font-serif font-bold text-xl text-white uppercase tracking-tight">Market Insights & Advisory Dispatch</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Join our exclusive network of institutional investors and corporate real estate professionals. Receive monthly macroeconomic modeling, zoning audits, and premium market analysis.
              </p>
            </div>
            <div className="w-full lg:w-auto min-w-[320px] sm:min-w-[400px]">
              {isSubscribed ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-none text-emerald-400 text-xs animate-in zoom-in-95 duration-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span className="font-bold">You have successfully subscribed to the company's newsletter!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex bg-white rounded-none border border-gray-300 focus-within:border-[#C5A02E] transition-all shadow-xl">
                    <div className="flex items-center pl-4 text-gray-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter corporate email address..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="bg-transparent px-3 py-3.5 text-xs text-[#0A1D37] focus:outline-none w-full font-sans placeholder:text-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-slate-800 text-white px-8 font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer"
                    >
                      {isLoading ? 'Processing...' : 'Subscribe'}
                    </button>
                  </div>
                  {error && <p className="text-[10px] text-rose-500 font-sans pl-1">{error}</p>}
                  <p className="text-[9px] text-gray-500 italic px-1">
                    By subscribing, you agree to our privacy policy and data governance standards.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

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
                <span className="font-sans font-semibold text-base tracking-wider text-white block leading-none uppercase">
                  {settings?.general?.companyName || "HOWARD HOMES"}
                </span>
                <span className="text-[9px] uppercase font-sans tracking-[0.2em] text-[#C5A02E]">
                  LLC • Consultancy
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {settings?.seo?.metaDescription || "Howard Homes LLC is a premier corporate advisory and valuation firm. We deliver RICS-compliant valuations, commercial transaction consulting, facility management advice, and zoning-document compliance with strict integrity."}
            </p>
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
                <span className="text-gray-400">{settings?.general?.address || "1995 Woodlake Dr, Orange Park, FL 32003, USA"}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#C5A02E] shrink-0" />
                <a href={`tel:${settings?.general?.phone?.replace(/\s+/g, '') || "+18005550190"}`} className="text-gray-400 hover:text-white font-sans">
                  {settings?.general?.phone || "+1 (800) 555-0190"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#C5A02E] shrink-0" />
                <a href={`mailto:${settings?.general?.email || "consultation.howardhomes@hotmail.com"}`} className="text-gray-400 hover:text-white font-sans">
                  {settings?.general?.email || "consultation.howardhomes@hotmail.com"}
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-1.5 border-t border-gray-800">
                <Clock className="h-4 w-4 text-[#C5A02E] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Office Hours:</p>
                  <p className="text-gray-400">{settings?.general?.workingHours || "Mon - Fri: 8:00 AM - 6:00 PM (PST), Sat: By Appointment"}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Google Map & Footnote Map Split */}
        <div className="mt-12 pt-12 border-t border-gray-800 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-none overflow-hidden h-[220px] bg-slate-900 border border-slate-700 shadow-xl">
            <FooterGoogleMap 
              address={settings?.general?.address} 
              companyName={settings?.general?.companyName}
              phone={settings?.general?.phone}
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-1">
              <span className="text-xs text-white font-semibold uppercase block">Regulatory Audited Firm</span>
              <p className="text-[11px] text-gray-400 leading-normal">
                {settings?.content?.footerText || `${settings?.general?.companyName || "Howard Homes LLC"} operates as an accredited commercial advisory firm. All client engagement agreements are subjected to standard California municipal oversight and financial disclosure procedures. This website serves purely as a corporate informational directory.`}
              </p>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a id="footer-linkedin" href={settings?.social?.linkedin || "https://linkedin.com/company/howardhomes"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="LinkedIn" title="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a id="footer-twitter" href={settings?.social?.twitter || "https://twitter.com/howardhomes"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="Twitter" title="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a id="footer-facebook" href={settings?.social?.facebook || "https://facebook.com/howardhomes"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="Facebook" title="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a id="footer-instagram" href={settings?.social?.instagram || "https://instagram.com/howardhomes"} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="Instagram" title="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              {settings?.general?.whatsappNumber && (
                <a id="footer-whatsapp" href={`https://wa.me/${settings.general.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white text-[#0A1D37] hover:bg-slate-800 hover:text-[#C5A02E] rounded-none transition-colors flex items-center justify-center" aria-label="WhatsApp" title="WhatsApp">
                  <Phone className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-white border-t border-gray-200 py-6 text-[11px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} {settings?.general?.companyName || "Howard Homes LLC"}. All Rights Reserved. Accredited Corporate Real Estate Advisors.</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-slate-500">
            <button onClick={() => handleLinkClick('privacy')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Privacy Policy</button>
            <button onClick={() => handleLinkClick('terms')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Terms of Service</button>
            <button onClick={() => handleLinkClick('cookies')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Cookie Policy</button>
            <button onClick={() => handleLinkClick('disclaimer')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Disclaimer</button>
            <button onClick={() => handleLinkClick('sitemap')} className="hover:text-[#C5A02E] transition-colors cursor-pointer">Sitemap</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
