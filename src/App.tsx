import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, Phone, Mail, MapPin, Clock, Lock, ShieldCheck, ChevronDown, 
  ChevronRight, Award, Users, CheckCircle2, Star, ArrowUpRight, Search, 
  ChevronLeft, ArrowUp, Send, FileText, Calendar, Plus, Link as LinkIcon, HelpCircle, X, RefreshCw
} from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import BookingForm from './components/BookingForm';
import ApplyNowForm from './components/ApplyNowForm';
import ContactForm from './components/ContactForm';
import BlogGrid from './components/BlogGrid';
import AdminPanel from './components/AdminPanel';
import SupportWidget from './components/SupportWidget';
import GlobalSearch from './components/GlobalSearch';
import TrackApplication from './components/TrackApplication';
import { PrintHeader, PrintFooter, handleImmediatePrint } from './components/PrintHeaderFooter';
import { BlogPost, TeamMember, GalleryItem, JobListing, WebsiteSettings, Testimonial } from './types';
import { useToast } from './components/ui/Toast';

export default function App() {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [currentTab, setTab] = useState('home');
  const [trackQuery, setTrackQuery] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isReadingBlog, setIsReadingBlog] = useState(false);
  const [blogScrollProgress, setBlogScrollProgress] = useState(0);
  const [isPrintingPortfolio, setIsPrintingPortfolio] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleGmpQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleGmpQuota);
    
    // Check standalone admin URL trigger (e.g. ?admin=true or #admin or /admin)
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true' || window.location.hash === '#admin' || window.location.pathname.includes('/admin')) {
      setIsAdminOpen(true);
    }

    return () => window.removeEventListener('gmp-quota-exceeded', handleGmpQuota);
  }, []);

  const handleTrackApplication = (refNumber?: string) => {
    if (refNumber) setTrackQuery(refNumber);
    setTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Global Search Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dynamic state loaded from the backend APIs
  const [settings, setSettings] = useState<WebsiteSettings>({
    general: {
      companyName: "Howard Homes LLC",
      phone: "+1 (800) 555-0190",
      email: "consultation.howardhomes@hotmail.com",
      address: "1995 Woodlake Dr, Orange Park, FL 32003, USA",
      workingHours: "Mon - Fri: 8:00 AM - 6:00 PM (PST), Sat: By Appointment",
      whatsappNumber: "18005550190",
      googleMapIframe: ""
    },
    seo: {
      metaTitle: "Howard Homes LLC | Elite Corporate Real Estate Advisory & Valuation",
      metaDescription: "Howard Homes LLC is a premier corporate real estate consultancy.",
      openGraphImage: ""
    },
    social: { linkedin: "", twitter: "", facebook: "", instagram: "" }
  });

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [careers, setCareers] = useState<JobListing[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // FAQ open states
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({});

  // Active Job application state
  const [applyingJob, setApplyingJob] = useState<JobListing | null>(null);
  const [appFormData, setAppFormData] = useState({ fullName: '', email: '', phone: '', coverLetter: '', resumeName: '', resumeBase64: '' });
  const [appSuccess, setAppSuccess] = useState(false);
  const [appLoading, setAppLoading] = useState(false);

  // Gallery Active Lightbox state
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const [activeGalleryFilter, setActiveGalleryFilter] = useState('All');

  // Stats Counters
  const [stats, setStats] = useState({ years: 0, projects: 0, clients: 0, consultants: 0 });

  // Load public metrics from server
  const loadPublicData = async () => {
    try {
      const [resSettings, resBlogs, resTeam, resGallery, resCareers, resTestimonials] = await Promise.all([
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/blogs').then(r => r.json()),
        fetch('/api/team').then(r => r.json()),
        fetch('/api/gallery').then(r => r.json()),
        fetch('/api/careers').then(r => r.json()),
        fetch('/api/testimonials').then(r => r.json())
      ]);

      if (resSettings && !resSettings.error) setSettings(resSettings);
      if (Array.isArray(resBlogs)) setBlogs(resBlogs);
      if (Array.isArray(resTeam)) setTeam(resTeam);
      if (Array.isArray(resGallery)) setGallery(resGallery);
      if (Array.isArray(resCareers)) setCareers(resCareers);
      if (Array.isArray(resTestimonials)) setTestimonials(resTestimonials);
    } catch (err) {
      console.error("Failed synchronizing corporate database metrics:", err);
    }
  };

  useEffect(() => {
    loadPublicData();

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleBlogActive = (e: Event) => {
      const customEvent = e as CustomEvent<{ active: boolean }>;
      setIsReadingBlog(customEvent.detail.active);
      if (!customEvent.detail.active) {
        setBlogScrollProgress(0);
      }
    };
    const handleBlogScroll = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      setBlogScrollProgress(customEvent.detail.progress);
    };

    window.addEventListener('blog-active', handleBlogActive);
    window.addEventListener('blog-scroll', handleBlogScroll);
    return () => {
      window.removeEventListener('blog-active', handleBlogActive);
      window.removeEventListener('blog-scroll', handleBlogScroll);
    };
  }, []);

  const activeProgress = isReadingBlog ? blogScrollProgress : scrollProgress;
  const showProgressBar = currentTab === 'services' || isReadingBlog;

  // Sync state if Admin Panel closes
  const handleAdminClose = () => {
    setIsAdminOpen(false);
    loadPublicData();
  };

  // Increment Statistics animation on Home page mount
  useEffect(() => {
    if (currentTab === 'home') {
      setStats({ years: 0, projects: 0, clients: 0, consultants: 0 });
      const duration = 1500;
      const steps = 50;
      const interval = duration / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        setStats({
          years: Math.min(Math.round((25 / steps) * step), 25),
          projects: Math.min(Math.round((480 / steps) * step), 480),
          clients: Math.min(Math.round((98 / steps) * step), 98),
          consultants: Math.min(Math.round((15 / steps) * step), 15),
        });

        if (step >= steps) clearInterval(timer);
      }, interval);

      return () => clearInterval(timer);
    }
  }, [currentTab]);

  // Handle Application Submit
  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFormData.fullName || !appFormData.email || !appFormData.phone || !applyingJob) {
      toastWarning("Please provide all required profile details.", "Missing Information");
      return;
    }
    setAppLoading(true);

    try {
      const response = await fetch(`/api/careers/${applyingJob.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appFormData),
      });

      if (response.ok) {
        setAppSuccess(true);
        toastSuccess("Your job application has been submitted successfully.", "Application Submitted");
        setTimeout(() => {
          setAppSuccess(false);
          setApplyingJob(null);
          setAppFormData({ fullName: '', email: '', phone: '', coverLetter: '', resumeName: '', resumeBase64: '' });
        }, 3000);
      } else {
        const d = await response.json();
        toastError(d.error || "Submission failed.", "Submission Error");
      }
    } catch (err) {
      toastError("Could not upload record to administration portal.", "Connection Error");
    } finally {
      setAppLoading(false);
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAppFormData({
        ...appFormData,
        resumeName: file.name,
        resumeBase64: reader.result as string
      });
    };
    reader.readAsDataURL(file);
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFaq = (key: string) => {
    setFaqOpen(prev => ({ ...prev, [key]: !prev[key] }));
  };



  // Gallery items category filter logic
  const filteredGallery = gallery.filter(item => activeGalleryFilter === 'All' || item.category === activeGalleryFilter);

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#C5A02E] selection:text-white ${settings?.styling?.fontFamily || 'font-sans'}`}>
      <style>{`
        :root {
          --primary: ${settings?.styling?.primaryColor || '#0A1D37'};
          --accent: ${settings?.styling?.accentColor || '#C5A02E'};
          --bg: ${settings?.styling?.backgroundColor || '#ffffff'};
        }
        .text-\\[\\#0A1D37\\] { color: var(--primary) !important; }
        .bg-\\[\\#0A1D37\\] { background-color: var(--primary) !important; }
        .border-\\[\\#0A1D37\\] { border-color: var(--primary) !important; }
        .fill-\\[\\#0A1D37\\] { fill: var(--primary) !important; }
        .hover\\:text-\\[\\#0A1D37\\]:hover { color: var(--primary) !important; }
        .hover\\:bg-\\[\\#0A1D37\\]:hover { background-color: var(--primary) !important; }
        
        .text-\\[\\#C5A02E\\] { color: var(--accent) !important; }
        .bg-\\[\\#C5A02E\\] { background-color: var(--accent) !important; }
        .border-\\[\\#C5A02E\\] { border-color: var(--accent) !important; }
        .fill-\\[\\#C5A02E\\] { fill: var(--accent) !important; }
        .hover\\:text-\\[\\#C5A02E\\]:hover { color: var(--accent) !important; }
        .hover\\:bg-\\[\\#C5A02E\\]:hover { background-color: var(--accent) !important; }
        .hover\\:bg-\\[\\#A68625\\]:hover { background-color: color-mix(in srgb, var(--accent) 80%, black) !important; }
        
        .bg-white { background-color: var(--bg) !important; }
        .bg-\\[\\#F4F7F9\\] { background-color: color-mix(in srgb, var(--bg) 95%, var(--primary)) !important; }
        
        /* Apply dynamic borders */
        .rounded-none {
          border-radius: ${settings?.styling?.borderRadius === 'rounded-sm' ? '0.25rem' : settings?.styling?.borderRadius === 'rounded-md' ? '0.375rem' : settings?.styling?.borderRadius === 'rounded-lg' ? '0.5rem' : settings?.styling?.borderRadius === 'rounded-full' ? '9999px' : '0px'} !important;
        }
      `}</style>
      
      {/* Subtle Progress Bar */}
      {showProgressBar && (
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#C5A02E]/20 z-[9999] pointer-events-none">
          <div 
            className="h-full bg-[#C5A02E] transition-all duration-75 ease-out"
            style={{ width: `${activeProgress}%` }}
          />
        </div>
      )}

      {/* Google Maps Platform Quota Defense Banner (Demo Key) */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-[10000] shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Sticky Top Header Navigation */}
      <Header 
        currentTab={currentTab} 
        setTab={setTab} 
        onBookClick={() => setTab('consultation')} 
        onApplyClick={() => setTab('apply')}
        onSearchClick={() => setIsSearchOpen(true)}
        settings={settings} 
      />

      {/* RENDER PAGES DYNAMICALLY */}
      <main className="flex-grow pt-[72px]">

        {/* 1. HOME TAB */}
        {currentTab === 'home' && (
          <div className={`space-y-0 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'} duration-300`}>
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0A1D37]">
              <div className="absolute inset-0 z-0 opacity-40">
                <img 
                  src={settings.content?.heroImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"} 
                  alt="City Commercial Skyline" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A1D37] via-[#0A1D37]/90 to-transparent"></div>
              </div>
              
              <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <div className="w-12 h-1 bg-[#C5A02E] mx-auto mb-6"></div>
                <h1 className="font-serif font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-tight whitespace-pre-line">
                  {settings.content?.heroHeadline || "Your Trusted Partner in\nReal Estate Excellence"}
                </h1>
                <p className="max-w-2xl mx-auto text-gray-300 text-sm sm:text-lg leading-relaxed font-sans font-medium whitespace-pre-line">
                  {settings.content?.heroSubheadline || "Providing professional real estate consultancy, investment advisory, certified valuation audits, legal documentation assistance, and tailored solutions with absolute integrity."}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <button 
                    onClick={() => setTab('consultation')}
                    className="w-full sm:w-auto bg-[#C5A02E] hover:bg-[#A68625] text-white font-sans font-bold text-xs tracking-wider px-8 py-4 rounded-none transition-all duration-150 cursor-pointer shadow-lg uppercase"
                  >
                    Discover Our Expertise
                  </button>
                  <button 
                    onClick={() => setTab('services')}
                    className="w-full sm:w-auto bg-white text-[#0A1D37] hover:bg-gray-100 font-sans font-bold text-xs tracking-wider px-8 py-4 rounded-none transition-all duration-150 cursor-pointer uppercase"
                  >
                    Our Services
                  </button>
                </div>
              </div>
              
              {/* Bottom stats indicator */}
              <div className="absolute bottom-0 right-0 z-20 bg-white p-8 hidden md:grid grid-cols-2 gap-8 shadow-2xl border-l-4 border-[#C5A02E]">
                <div className="text-center px-4">
                  <div className="text-3xl font-serif font-bold text-[#0A1D37]">{stats.years}+</div>
                  <div className="text-[10px] uppercase tracking-tighter text-gray-500 font-bold">Years Experience</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-3xl font-serif font-bold text-[#0A1D37]">{stats.clients}k</div>
                  <div className="text-[10px] uppercase tracking-tighter text-gray-500 font-bold">Clients Advised</div>
                </div>
              </div>
            </section>

            {/* About brief teaser section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest block font-bold">ABOUT HOWARD HOMES</span>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#0A1D37] dark:text-white tracking-tight leading-tight whitespace-pre-line">
                  {settings.content?.aboutHeadline || "Over a Quarter Century of Elite Commercial Real Estate Mastery"}
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                  {settings.content?.aboutText || "Established in California, Howard Homes LLC is an accredited advisory firm providing commercial zoning, underwriting audits, facility intelligence, and certified valuations. We strictly operate as a premium corporate consultancy.\n\nWe maintain absolute structural boundaries: we represent enterprise acquisitions under total fiduciary loyalty and never operate commercial marketplace lists or retail portals."}
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setTab('about')}
                    className="text-xs font-bold text-[#C5A02E] hover:text-[#A68625] border-b-2 border-[#C5A02E]/20 hover:border-[#C5A02E] pb-1.5 transition-all cursor-pointer flex items-center gap-1"
                  >
                    Read Company Background <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="lg:col-span-6 rounded-none overflow-hidden h-[360px] sm:h-[450px] shadow-2xl relative border border-gray-200 dark:border-slate-800">
                <img 
                  src={settings.content?.aboutImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"} 
                  alt="Boardroom advisory" 
                  className="w-full h-full object-cover"
                />
              </div>
            </section>

            {/* 8 Core Services Teaser Section */}
            <section className="py-24 bg-[#F4F7F9]/40 dark:bg-slate-900/40 border-y border-gray-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center space-y-3">
                  <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest block font-bold">CORE DOMAINS</span>
                  <h3 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#0A1D37] dark:text-white tracking-tight">{settings.content?.servicesHeadline || "Our Advisory Services"}</h3>
                  <p className="max-w-xl mx-auto text-gray-500 dark:text-slate-400 text-xs sm:text-sm whitespace-pre-line">
                    {settings.content?.servicesSubheadline || "Strategic, RICS-compliant, and transactional underwriting solutions built for developers, institutional entities, and private capital."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { name: 'Real Estate Consultancy', desc: 'Lease audits, portfolio restructuring, workplace optimization, and landlord-tenant strategic briefings.' },
                    { name: 'Property Valuation Services', desc: 'RICS Red Book compliant certified evaluations for auditing, asset financing, and portfolio validation.' },
                    { name: 'Investment Advisory', desc: 'Macroeconomic modeling, discounted cash flow (DCF) underwriting, risk indices, and acquisition advisory.' },
                    { name: 'Facility Management Advice', desc: 'Long-term operational risk management audits, energy compliance modeling, and lifecycle expenditure mapping.' },
                    { name: 'Property Documentation Assistance', desc: 'Municipal zoning validation, title audits, and technical document alignment in regional registries.' },
                    { name: 'Development Advisory', desc: 'Architectural envelope modeling, feasibility studies, zoning variances, and general zoning audits.' },
                    { name: 'Project Management Advisory', desc: 'Technical developer representation, cost estimation analysis, procurement auditing, and milestone audits.' },
                    { name: 'Legal Consultation', desc: 'Eminent domain consultation, contractual boundary reviews, easement audits, and technical legal diagnostics.' }
                  ].map((svc, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -5, rotate: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 rounded-none flex flex-col justify-between hover:border-gray-300 dark:hover:border-slate-600 transition-all shadow-xl"
                      
                    >
                      <div className="space-y-4">
                        <div className="h-10 w-10 rounded-none bg-[#C5A02E]/10 text-[#C5A02E] flex items-center justify-center font-bold text-sm font-sans">
                          0{idx + 1}
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white tracking-tight group-hover:text-[#C5A02E] transition-colors">
                          {svc.name}
                        </h4>
                        <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">{svc.desc}</p>
                      </div>
                      <div className="pt-6">
                        <button 
                          onClick={() => setTab('services')}
                          className="text-xs text-[#C5A02E] group-hover:underline font-semibold cursor-pointer"
                        >
                          Learn Detail →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Why Choose Section */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              <div className="text-center space-y-3">
                <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest block font-bold">THE HOWARD DIFFERENCE</span>
                <h3 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#0A1D37] dark:text-white tracking-tight">Why Choose {settings.general?.companyName || "Howard Homes LLC"}</h3>
                <p className="max-w-xl mx-auto text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
                  We elevate structural integrity to the center of our advisory business. Discover how we protect your long-term capital assets.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                  { title: 'Experienced Professionals', desc: 'Advisors averaging 15+ years in senior institutional acquisition profiles.' },
                  { title: 'Absolute Integrity', desc: 'A fiduciary framework shielding clients against transaction conflicts of interest.' },
                  { title: 'Full Transparency', desc: 'Uncompromised, evidence-backed valuations free from capital commission bias.' },
                  { title: 'Client Satisfaction', desc: 'Multi-decade relationships advising high-net-worth families and Fortune 500 panels.' },
                  { title: 'Tailored Solutions', desc: 'No boilerplate. Bespoke macroeconomic underwriting tailored to your portfolio objectives.' },
                  { title: 'Industry Expertise', desc: 'Unrivaled command of zoning laws, RICS guidelines, and local real estate parameters.' },
                  { title: 'Professional Guidance', desc: 'Direct access to founding partners during complex legal zoning audits.' }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ y: -5, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-[#F4F7F9]/30 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-800 p-6 rounded-none space-y-3 shadow-lg"
                  >
                    <div className="inline-flex p-2 bg-[#C5A02E]/10 text-[#C5A02E] rounded-none">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#0A1D37] dark:text-slate-200">{item.title}</h4>
                    <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Counters / Stats Section */}
            <section className="bg-[#F4F7F9] dark:bg-slate-900 border-y border-gray-200 dark:border-slate-800 py-20 text-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl font-serif font-bold text-[#0A1D37] dark:text-white">{stats.years}+</p>
                  <p className="text-xs uppercase font-sans tracking-widest text-gray-500 dark:text-slate-400">Years of Experience</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl font-serif font-bold text-[#0A1D37] dark:text-white">{stats.projects}+</p>
                  <p className="text-xs uppercase font-sans tracking-widest text-gray-500 dark:text-slate-400">Projects Completed</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl font-serif font-bold text-[#0A1D37] dark:text-white">{stats.clients}%</p>
                  <p className="text-xs uppercase font-sans tracking-widest text-gray-500 dark:text-slate-400">Client Satisfaction</p>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl font-serif font-bold text-[#0A1D37] dark:text-white">{stats.consultants}+</p>
                  <p className="text-xs uppercase font-sans tracking-widest text-gray-500 dark:text-slate-400">Professional Consultants</p>
                </div>
              </div>
            </section>

            {/* Mission & Vision Banners */}
            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 p-8 sm:p-10 rounded-none space-y-4 shadow-xl">
                <span className="text-[#C5A02E] font-sans text-[10px] uppercase tracking-widest font-bold block">OUR MISSION</span>
                <h4 className="font-serif font-extrabold text-2xl text-[#0A1D37] dark:text-white">To Deliver Structural Integrity & Professionalism</h4>
                <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  To provide absolute standard of real estate advisory, offering verified, unbiased, data-backed reports that help major institutions protect capital and allocate development assets with absolute confidence.
                </p>
              </div>

              <div className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 p-8 sm:p-10 rounded-none space-y-4 shadow-xl">
                <span className="text-[#C5A02E] font-sans text-[10px] uppercase tracking-widest font-bold block">OUR VISION</span>
                <h4 className="font-serif font-extrabold text-2xl text-[#0A1D37] dark:text-white">Shaping Fiduciary Commercial Standards</h4>
                <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  To become the absolute standard for premium real estate consultancy. We aim to shield clients from biased agency frameworks, pushing industry ethics forward.
                </p>
              </div>
            </section>

            {/* Core Values Section */}
            <section className="py-24 bg-[#F4F7F9]/20 dark:bg-slate-900/20 border-t border-gray-200 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
                <div className="text-center space-y-3">
                  <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest block font-bold">ETHICAL ANCHORS</span>
                  <h3 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#0A1D37] dark:text-white tracking-tight">Our Core Values</h3>
                  <p className="max-w-xl mx-auto text-gray-500 dark:text-slate-400 text-xs sm:text-sm">
                    Every zoning advisory, transaction underwriting, and certified valuation reports is audited against our core principles.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { val: 'Integrity', desc: 'Our word is absolute. We do not participate in market brokers commissions.' },
                    { val: 'Professionalism', desc: 'Adhering to strict international standards of the Royal Institution of Chartered Surveyors (RICS).' },
                    { val: 'Innovation', desc: 'Harnessing machine intelligence and GIS data mapping for forward portfolio insights.' },
                    { val: 'Transparency', desc: 'Open ledger accounting and clear methodology reports on all valuation projects.' },
                    { val: 'Excellence', desc: 'Delivering under peerless standard of analytical prose and detail execution.' },
                    { val: 'Customer Focus', desc: 'Our clients interests form the absolute apex of our strategic fiduciaries.' },
                    { val: 'Accountability', desc: 'Full corporate liability and insurance cover backing our structural briefs.' },
                    { val: 'Teamwork', desc: 'Cross-functional alignments merging analysts, lawyers, and surveyors.' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -5, rotate: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 p-6 rounded-none space-y-2"
                    >
                      <h4 className="font-serif font-bold text-[#0A1D37] dark:text-white text-base">{item.val}</h4>
                      <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials Slider */}
            {testimonials.length > 0 && (
              <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center space-y-3">
                  <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest block font-bold">VERIFIED REFS</span>
                  <h3 className="font-serif font-extrabold text-3xl text-[#0A1D37] dark:text-white tracking-tight">Client Endorsements</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {testimonials.map((test) => (
                    <div key={test.id} className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 p-6 rounded-none flex flex-col justify-between space-y-4 relative">
                      <div className="space-y-2">
                        <div className="flex text-[#C5A02E] gap-0.5">
                          {Array.from({ length: test.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-[#0A1D37] dark:text-slate-200 text-xs italic leading-relaxed font-sans">
                          "{test.review}"
                        </p>
                      </div>
                      <div className="pt-3 border-t border-gray-200/50 dark:border-slate-800">
                        <p className="text-xs font-bold text-[#0A1D37] dark:text-white">{test.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans uppercase">{test.company}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}



            {/* Latest Insights Teaser */}
            {blogs.length > 0 && (
              <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="flex items-end justify-between border-b border-gray-200 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest block font-bold">INTELLIGENCE DIARY</span>
                    <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-[#0A1D37] dark:text-white tracking-tight">Latest Market Insights</h3>
                  </div>
                  <button 
                    onClick={() => setTab('blog')}
                    className="text-xs font-semibold text-[#C5A02E] hover:underline cursor-pointer"
                  >
                    View All Publications →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {blogs.slice(0, 3).map((blog) => (
                    <div 
                      key={blog.id}
                      onClick={() => setTab('blog')}
                      className="group bg-[#F4F7F9]/30 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-800 rounded-none overflow-hidden flex flex-col justify-between h-full hover:border-gray-300 dark:hover:border-slate-700 transition-all cursor-pointer"
                    >
                      <div className="h-44 bg-[#F4F7F9] dark:bg-slate-800 overflow-hidden">
                        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="p-5 space-y-3 flex-grow flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] text-[#C5A02E] font-sans uppercase tracking-wider">{blog.category}</span>
                          <h4 className="font-serif font-bold text-[#0A1D37] dark:text-white leading-snug line-clamp-2 group-hover:text-[#C5A02E] transition-colors">{blog.title}</h4>
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                          <span className="tabular-nums">{blog.date}</span>
                          <span className="text-[#C5A02E] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">Read <ChevronRight className="h-3.5 w-3.5" /></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}


          </div>
        )}

        {/* 2. ABOUT TAB */}
        {currentTab === 'about' && (
          <div className={`space-y-16 pb-20 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            
            {/* Sleek Hero Header Banner */}
            <div className="bg-[#0A1D37] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C5A02E] shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A02E_1px,transparent_1px)] [background-size:16px_16px]"></div>
              <div className="max-w-7xl mx-auto relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#C5A02E]/20 border border-[#C5A02E]/40 px-3 py-1 text-[11px] font-mono font-bold text-[#C5A02E] uppercase tracking-widest">
                  <ShieldCheck className="h-3.5 w-3.5" /> Corporate Excellence & Fiduciary Integrity
                </div>
                <h1 className="font-serif font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                  {settings?.content?.aboutPageHeadline || `About ${settings.general?.companyName || "Howard Homes LLC"}`}
                </h1>
                <p className="max-w-3xl text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans">
                  {settings?.content?.aboutPageText || "A premier, client-aligned advisory specializing in commercial zoning audits, municipal registries, facility operations, and RICS Red Book compliant valuations."}
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

              {/* KPI Metrics Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Years of Excellence', val: '25+' },
                  { label: 'Fiduciary Independence', val: '100%' },
                  { label: 'RICS Standards', val: 'Certified' },
                  { label: 'Brokerage Conflict', val: 'Zero' }
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 shadow-md text-center space-y-1 hover:border-[#C5A02E] transition-colors">
                    <p className="font-serif font-extrabold text-2xl sm:text-3xl text-[#0A1D37] dark:text-[#C5A02E]">{stat.val}</p>
                    <p className="text-[11px] font-sans font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Timelines and grid splits */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-6 space-y-6">
                  <div className="w-10 h-1 bg-[#C5A02E]"></div>
                  <h3 className="font-serif font-extrabold text-3xl text-[#0A1D37] dark:text-white tracking-tight">{settings?.content?.aboutPageStoryHeadline || "Our Corporate Story"}</h3>
                  <p className="text-gray-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {settings?.content?.aboutPageStoryText || `${settings.general?.companyName || "Howard Homes LLC"} was established as an independent alternative to large, transaction-driven real estate brokerages. Seeing a conflict of interest in agencies that represent both buyers and sellers while seeking sales commission incentives, we chose to design a fee-only, fiduciary-aligned corporate consultancy.

Over the past 25 years, we have structured acquisition reviews, verified environmental compliance criteria, secured zoning approvals, and published certified RICS valuation books for pension schemes, corporate boards, and family offices.`}
                  </p>
                </div>
                <div className="lg:col-span-6 space-y-5 bg-[#0A1D37] text-white p-8 sm:p-10 shadow-2xl relative border-l-4 border-[#C5A02E]">
                  <span className="text-[#C5A02E] font-sans text-xs uppercase font-bold tracking-widest block">{settings?.content?.aboutPageMessageHeadline || "A Message from our Managing Director"}</span>
                  <p className="text-gray-200 text-xs sm:text-sm italic leading-relaxed whitespace-pre-line font-serif">
                    "{settings?.content?.aboutPageMessageText || `At ${settings.general?.companyName || "Howard Homes LLC"}, we believe that real estate excellence is built upon absolute transparency and fiduciary loyalty. We have chosen never to participate in listing markets or transaction brokerages to maintain completely objective advice for our clients. That is our structural ceiling, and it remains our absolute pride.`}"
                  </p>
                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-xs font-bold text-white uppercase tracking-wider">{settings?.content?.aboutPageMessageAuthor?.split(',')[0] || "Michael Howard"}</p>
                    <p className="text-[10px] text-[#C5A02E] font-sans font-semibold pt-0.5">{settings?.content?.aboutPageMessageAuthor?.split(',')[1]?.trim() || "Managing Director & Principal Valuer"}</p>
                  </div>
                </div>
              </div>

              {/* Core Principles 3-Col Grid */}
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold">OUR PILLARS</span>
                  <h3 className="font-serif font-extrabold text-3xl text-[#0A1D37] dark:text-white">Core Operational Principles</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: 'Absolute Independence', desc: 'Zero brokerage incentives or retail listing commissions. Our advice is strictly fee-only and aligned solely with client objectives.' },
                    { title: 'Rigorous Underwriting', desc: 'Advanced discounted cash flow (DCF) modeling and RICS Red Book compliant asset valuations ensuring institutional-grade accuracy.' },
                    { title: 'Regulatory Mastery', desc: 'Deep expertise in California municipal zoning codes, environmental compliance, eminent domain, and land-use entitlements.' }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 shadow-xl space-y-4 hover:border-[#C5A02E] transition-all">
                      <div className="w-10 h-10 bg-[#C5A02E]/10 text-[#C5A02E] flex items-center justify-center font-bold font-mono text-sm">
                        0{idx + 1}
                      </div>
                      <h4 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">{p.title}</h4>
                      <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline component */}
              <div className="space-y-8 pt-6">
                <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
                  <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">MILESTONES</span>
                  <h3 className="font-serif font-extrabold text-2xl text-[#0A1D37] dark:text-white">Corporate Historical Timeline</h3>
                </div>
                <div className="relative border-l-2 border-[#C5A02E]/40 ml-4 space-y-12 py-2">
                  {[
                    { yr: '2001', title: 'Firm Conception', desc: 'Established in San Francisco, dedicating resources strictly to fee-only capital underwriting and zoning advisory.' },
                    { yr: '2009', title: 'Valuations Expansion', desc: 'Launched our RICS Red Book compliant commercial asset valuations department for institutional lenders.' },
                    { yr: '2016', title: 'National Advisory Footprint', desc: 'Expanded corporate advisory operations across major west coast commercial hubs.' },
                    { yr: '2026', title: 'Modern GIS & ESG Integrations', desc: 'Integrated advanced geographical mapping models for carbon audit compliance and environmental valuation offsets.' }
                  ].map((item, idx) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute -left-[9px] top-1.5 h-4 w-4 bg-[#0A1D37] dark:bg-[#C5A02E] rounded-full border-4 border-white dark:border-slate-900 shadow-sm"></div>
                      <span className="text-[#C5A02E] font-mono text-xs font-bold block tracking-wider">{item.yr}</span>
                      <h4 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white pt-1">{item.title}</h4>
                      <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed max-w-3xl mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. SERVICES TAB */}
        {currentTab === 'services' && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            
            {/* Structured Print Header (Visible strictly when printing) */}
            <PrintHeader 
              title="Corporate Advisory Portfolios & Valuation Services" 
              subtitle="RICS Red Book Compliant Commercial Valuations & Real Estate Consultancy"
              documentType="Official Practice Profile"
              settings={settings}
            />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
              <div className="space-y-3">
                <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">SERVICE BLUEPRINTS</span>
                <h2 className="font-serif font-bold text-4xl text-[#0A1D37] dark:text-white tracking-tight">{settings.content?.servicesHeadline || "Our Advisory Services"}</h2>
                <p className="max-w-xl text-gray-500 dark:text-slate-400 text-xs sm:text-sm whitespace-pre-line">
                  {settings.content?.servicesSubheadline || "Each real estate sub-discipline is managed by a certified specialist under strict fiduciary oversight."}
                </p>
              </div>
              <button
                onClick={(e) => {
                  setIsPrintingPortfolio(true);
                  handleImmediatePrint(e, () => setIsPrintingPortfolio(false));
                  setTimeout(() => setIsPrintingPortfolio(false), 1500);
                }}
                disabled={isPrintingPortfolio}
                className="no-print self-start sm:self-auto bg-[#0A1D37] hover:bg-[#C5A02E] active:scale-[0.98] text-white px-5 py-2.5 text-xs font-sans font-bold tracking-wider rounded-none transition-all shadow-md flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-85"
                title="Print Application Status / Portfolio (Instant PDF)"
              >
                {isPrintingPortfolio ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-[#C5A02E]" />
                    <span>OPENING PRINT...</span>
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 text-[#C5A02E]" />
                    <span>EXPORT PORTFOLIO PDF</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-20">
              {[
                { name: 'Real Estate Consultancy', tag: 'CORPORATE SOLUTIONS', desc: 'We deliver comprehensive workplace analytics, lease audits, and footprint planning structures.', benefits: ['Complete portfolio diagnostic auditing', 'Average overhead reduction of 30%', 'Landlord strategic alignment analyses'], process: 'Initial lease portfolio data ingestion → Personnel occupancy analytics study → Custom footprint restructuring design proposal.' },
                { name: 'Property Valuation Services', tag: 'RICS COMPLIANT', desc: 'Chartered surveyors deliver certified valuation books backed by DCF models for banks and audits.', benefits: ['RICS Red Book guidelines adherence', 'Certified asset financing valuation profiles', 'Independent methodology free of broker bias'], process: 'Regional technical site audit → Market transactional underwriting comps → Discounted cash flow (DCF) drafting → Accredited book release.' },
                { name: 'Investment Advisory', tag: 'FINANCIAL INTELLIGENCE', desc: 'Secure asset allocation matrices and macroeconomic risk analysis tailored to private equity and family boards.', benefits: ['Advanced Argus and Excel scenario models', 'Zoning risk mitigation overlays', 'Yield and capitalization rate auditing'], process: 'Briefing objective identification → GIS zoning risk check → Underwriting modeling compilation → Executive investment briefing.' },
                { name: 'Facility Management Advice', tag: 'OPERATIONAL SAFETY', desc: 'Lifecycle asset modeling and environmental compliance planning to protect assets from obsolescence.', benefits: ['LEED and carbon carbon tax audit mitigations', 'Equipment lifecycle cost predictions', 'Operational efficiency gains'], process: 'Physical mechanical inspection → Compliance delta auditing → Operational roadmap release.' },
                { name: 'Property Documentation Assistance', tag: 'ZONING & BOUNDARY', desc: 'Secure technical zoning variances and clean municipal land registration records.', benefits: ['Registry boundary diagnostic auditing', 'Direct local zoning coordination', 'Variance submission assistance'], process: 'Land record ingestion → Registry delta diagnosis → Municipal variance filing.' },
                { name: 'Legal Consultation', tag: 'MUNICIPAL CODES', desc: 'Zoning boundary assessments, easement audits, and eminent domain advice under professional standards.', benefits: ['Municipal law expertise', 'Zoning dispute mitigation', 'Contractual diagnostic reviews'], process: 'Legal case ingestion → Code auditing review → Municipal resolution roadmap.' }
              ].map((svc, i) => (
                <section key={i} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-b border-gray-200 dark:border-slate-800 pb-16 last:border-b-0">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-[#C5A02E] font-sans text-[9px] uppercase tracking-wider font-bold bg-[#C5A02E]/10 px-2.5 py-1 rounded-none inline-block">{svc.tag}</span>
                    <h3 className="font-serif font-extrabold text-2xl text-[#0A1D37] dark:text-white tracking-tight">{svc.name}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">{svc.desc}</p>
                    <div className="pt-4">
                      <button 
                        onClick={() => setTab('consultation')}
                        className="bg-[#F4F7F9] dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-[#0A1D37] dark:text-white border border-gray-300 dark:border-slate-700 text-xs font-bold py-2.5 px-5 rounded-none cursor-pointer transition-colors"
                      >
                        Request Service Consult
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-6 bg-[#F4F7F9]/20 dark:bg-slate-900/20 border border-gray-200 dark:border-slate-800 p-6 rounded-none font-sans">
                    <div className="space-y-2">
                      <span className="text-[10px] text-[#0A1D37] dark:text-slate-200 uppercase font-bold tracking-wider block">Key Benefits</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500 dark:text-slate-400">
                        {svc.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#C5A02E] shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5 pt-4 border-t border-gray-200 text-xs">
                      <span className="text-[10px] text-slate-500 uppercase font-sans tracking-wider block">Process Flow</span>
                      <p className="text-gray-600 italic font-sans leading-relaxed">{svc.process}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Structured Print Footer (Visible strictly when printing) */}
            <PrintFooter settings={settings} />

          </div>
        )}

        {/* 4. MISSION & VISION TAB */}
        {currentTab === 'mission' && (
          <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            <div className="space-y-3 text-center">
              <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">FOUNDING MOTIVATIONS</span>
              <h2 className="font-serif font-extrabold text-4xl text-[#0A1D37] dark:text-white tracking-tight">{settings?.content?.missionHeadline || "Our Mission & Vision"}</h2>
              <p className="max-w-lg mx-auto text-gray-500 dark:text-slate-400 text-xs sm:text-sm whitespace-pre-line">
                {settings?.content?.missionText || `How ${settings.general?.companyName || "Howard Homes LLC"} builds trust and sets premium standards across California's real estate domains.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              <div className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 p-8 rounded-none space-y-4 shadow-lg">
                <div className="h-10 w-10 bg-[#C5A02E]/10 text-[#C5A02E] rounded-none flex items-center justify-center font-bold font-sans">01</div>
                <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">Our Core Mission</h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  To offer completely unbiased, data-backed commercial valuations and consulting reports that help enterprise businesses preserve capital, execute zoning processes cleanly, and select office locations with absolute fiduciary clarity.
                </p>
              </div>

              <div className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 p-8 rounded-none space-y-4 shadow-lg">
                <div className="h-10 w-10 bg-[#C5A02E]/10 text-[#C5A02E] rounded-none flex items-center justify-center font-bold font-sans">02</div>
                <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">Our Strategic Vision</h3>
                <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                  To prove that premium commercial real estate advice thrives best when separated from marketing listing marketplaces and brokerage commissions. We aim to elevate California's real estate consultancy to a true fee-only professional discipline.
                </p>
              </div>
            </div>

            {/* Core values cards list */}
            <div className="space-y-6 pt-12">
              <span className="text-xs text-[#0A1D37] dark:text-slate-200 font-bold uppercase tracking-wider block text-center">Our Core Values</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {['Integrity', 'Professionalism', 'Innovation', 'Transparency', 'Excellence', 'Customer Focus', 'Accountability', 'Teamwork'].map((val, idx) => (
                  <motion.div 
                    key={idx} 
                    whileHover={{ y: -5, rotate: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-[#F4F7F9]/20 dark:bg-slate-900/20 border border-gray-200 dark:border-slate-800 p-6 rounded-none text-center shadow-md"
                  >
                    <span className="text-[#C5A02E] font-sans text-xs font-bold block">0{idx + 1}</span>
                    <h4 className="font-serif font-bold text-[#0A1D37] dark:text-white text-sm pt-1">{val}</h4>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. TEAM TAB */}
        {currentTab === 'team' && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            <div className="space-y-3">
              <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">PARTNERS & ADVISORS</span>
              <h2 className="font-serif font-bold text-4xl text-[#0A1D37] dark:text-white tracking-tight">{settings?.content?.teamHeadline || "Meet Our Professional Team"}</h2>
              <p className="max-w-2xl text-gray-500 dark:text-slate-400 text-sm whitespace-pre-line">
                {settings?.content?.teamSubheadline || `Bespoke transactional advisors, RICS chartered valuations surveyors, and municipal zoning advocates forming the core of ${settings.general?.companyName || "Howard Homes LLC"}.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {team.map((member) => (
                <div key={member.id} className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 rounded-none overflow-hidden flex flex-col justify-between shadow-xl">
                  <div className="h-64 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white">{member.name}</h4>
                      <p className="text-xs text-[#C5A02E] font-sans uppercase tracking-wide">{member.position}</p>
                      <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed pt-2 line-clamp-4">{member.bio}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs font-sans">
                      <a href={`mailto:${member.email}`} className="hover:text-[#C5A02E] dark:text-slate-400 dark:hover:text-[#C5A02E] transition-colors">Email</a>
                      <a href={member.linkedin} target="_blank" rel="noopener" className="hover:text-[#C5A02E] dark:text-slate-400 dark:hover:text-[#C5A02E] transition-colors">LinkedIn</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. GALLERY TAB */}
        {currentTab === 'gallery' && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            <div className="space-y-3">
              <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">VISUAL CHRONOLOGY</span>
              <h2 className="font-serif font-bold text-4xl text-[#0A1D37] dark:text-white tracking-tight">Media & Asset Gallery</h2>
              <p className="max-w-xl text-gray-500 dark:text-slate-400 text-sm">
                Explore our corporate office, boardroom advisory, and on-site technical surveying assets.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200 dark:border-slate-800">
              {['All', 'Office', 'Meetings', 'Projects', 'Corporate Events', 'Site Visits', 'Team Activities'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveGalleryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-sans font-medium rounded-none transition-colors cursor-pointer ${
                    activeGalleryFilter === cat
                      ? 'bg-[#C5A02E] text-white font-semibold'
                      : 'bg-[#F4F7F9] dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:text-[#0A1D37] dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setLightboxItem(item)}
                  className="group bg-[#F4F7F9]/30 dark:bg-slate-900/30 border border-gray-200 dark:border-slate-800 rounded-none overflow-hidden shadow-xl cursor-pointer hover:border-gray-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A1D37]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-xs font-semibold text-white truncate w-full">{item.title}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-[10px] text-[#C5A02E] font-sans uppercase tracking-wider">{item.category}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-sans group-hover:text-[#0A1D37] dark:group-hover:text-white transition-colors">Expand View →</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Lightbox Modal */}
            {lightboxItem && (
              <div 
                className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setLightboxItem(null)}
              >
                <div className="max-w-4xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{lightboxItem.title} - {lightboxItem.category}</span>
                    <button onClick={() => setLightboxItem(null)} className="text-white hover:text-[#C5A02E] uppercase font-sans text-[10px] cursor-pointer">Close [X]</button>
                  </div>
                  <div className="rounded-none overflow-hidden border border-slate-800 bg-black h-[60vh] sm:h-[70vh]">
                    <img src={lightboxItem.image} alt={lightboxItem.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. BLOG TAB */}
        {currentTab === 'blog' && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            <div className="space-y-3">
              <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">INTELLIGENCE DIARY</span>
              <h2 className="font-serif font-bold text-4xl text-[#0A1D37] dark:text-white tracking-tight">Corporate Market Insights</h2>
              <p className="max-w-xl text-gray-500 dark:text-slate-400 text-sm">
                Macroeconomic parameters, carbon offsets updates, zoning audit compliance, and lease footprint planning guidelines.
              </p>
            </div>

            {/* Inject active BlogGrid component */}
            <BlogGrid blogs={blogs} />
          </div>
        )}

        {/* 8. CAREERS TAB */}
        {currentTab === 'careers' && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            <div className="space-y-3">
              <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">OPPORTUNITIES</span>
              <h2 className="font-serif font-bold text-4xl text-[#0A1D37] dark:text-white tracking-tight">Corporate Vacancies</h2>
              <p className="max-w-xl text-gray-500 dark:text-slate-400 text-sm">
                Join an elite panel of chartered surveyors, capital analysts, and corporate consultants in San Francisco.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Opportunities List */}
              <div className="lg:col-span-7 space-y-6">
                {careers.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">There are currently no active openings. Check back soon.</p>
                ) : (
                  careers.map((job) => (
                    <div 
                      key={job.id}
                      className="bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 p-6 rounded-none space-y-4 shadow-xl"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-[#C5A02E] font-sans uppercase tracking-wider">{job.department} • {job.type}</span>
                          <h4 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">{job.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 font-sans">{job.location}</p>
                        </div>
                        <button 
                          onClick={() => setApplyingJob(job)}
                          className="bg-[#C5A02E] hover:bg-[#A68625] text-white font-sans font-bold text-xs tracking-wider px-4 py-2 rounded-none cursor-pointer"
                        >
                          APPLY TO POSITION
                        </button>
                      </div>

                      <div className="space-y-2 pt-2 text-xs text-gray-500 dark:text-slate-400 leading-relaxed border-t border-gray-200 dark:border-slate-800">
                        <p className="font-semibold text-[#0A1D37] dark:text-white">Position Overview:</p>
                        <p>{job.description}</p>
                      </div>

                      <div className="space-y-1.5 pt-2 text-xs text-gray-500 dark:text-slate-400">
                        <p className="font-semibold text-[#0A1D37] dark:text-white">Key Requirements:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {job.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Right panel teaser */}
              <div className="lg:col-span-5 bg-[#F4F7F9]/20 dark:bg-slate-900/20 border border-gray-200 dark:border-slate-800 p-6 sm:p-8 rounded-none space-y-4 shadow-lg">
                <span className="text-[#C5A02E] font-sans text-[10px] uppercase font-bold tracking-wider block">CORPORATE CULTURE</span>
                <h4 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white">A Peerless Standard of Intellectual Rigor</h4>
                <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">
                  We seek professionals who value intellectual truth and ethical standards above short-term transactional commissions. All partners must undergo certified background checks and maintain compliance structures.
                </p>
                <div className="pt-2 border-t border-gray-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans uppercase">Core Benefits</span>
                  <ul className="mt-2 text-xs space-y-1 text-gray-500 dark:text-slate-400 font-sans">
                    <li>• Fee-only fiduciary structure</li>
                    <li>• Direct partner mentoring programs</li>
                    <li>• Comprehensive RICS Red Book sponsorship</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Job Application Overlay Form Modal */}
            {applyingJob && (
              <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <form onSubmit={handleAppSubmit} className="bg-[#F4F7F9] dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-none max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start pb-3 border-b border-gray-200 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] text-[#C5A02E] uppercase font-sans tracking-wider">Submit Candidate Application</span>
                      <h4 className="font-serif font-bold text-[#0A1D37] dark:text-white text-lg">{applyingJob.title}</h4>
                    </div>
                    <button type="button" onClick={() => setApplyingJob(null)} className="text-gray-500 dark:text-slate-400 hover:text-[#0A1D37] dark:hover:text-white p-1 rounded-full cursor-pointer">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {appSuccess ? (
                    <div className="text-center py-8 space-y-3 animate-in zoom-in-95">
                      <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <p className="font-sans font-bold text-[#0A1D37] dark:text-white">Application Transmitted Successfully</p>
                      <p className="text-gray-500 dark:text-slate-400 text-xs">Your academic background and credentials have been filed under confidential administrative audit review.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Full Name */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">Full Name</label>
                        <input
                          type="text"
                          required
                          value={appFormData.fullName}
                          onChange={(e) => setAppFormData({ ...appFormData, fullName: e.target.value })}
                          placeholder="Richard Vance"
                          className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A02E]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">Professional Email</label>
                          <input
                            type="email"
                            required
                            value={appFormData.email}
                            onChange={(e) => setAppFormData({ ...appFormData, email: e.target.value })}
                            placeholder="r.vance@gmail.com"
                            className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                        {/* Phone */}
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">Telephone Number</label>
                          <input
                            type="tel"
                            required
                            value={appFormData.phone}
                            onChange={(e) => setAppFormData({ ...appFormData, phone: e.target.value })}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                      </div>

                      {/* Resume */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">Curriculum Vitae / Resume</label>
                        <div className="border border-dashed border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-none text-center space-y-1.5 relative hover:border-[#C5A02E] transition-colors">
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            {appFormData.resumeName ? `File selected: ${appFormData.resumeName}` : "Select resume document (.pdf, .docx)"}
                          </p>
                          <label className="inline-block bg-[#F4F7F9] dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-300 dark:border-slate-700 px-3 py-1.5 rounded-none text-[10px] uppercase font-semibold cursor-pointer text-[#0A1D37] dark:text-white transition-colors">
                            Browse Files
                            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeChange} className="hidden" />
                          </label>
                        </div>
                      </div>

                      {/* Cover Narrative */}
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">Cover Narrative (Statement of Motivations)</label>
                        <textarea
                          rows={3}
                          value={appFormData.coverLetter}
                          onChange={(e) => setAppFormData({ ...appFormData, coverLetter: e.target.value })}
                          placeholder="Briefly describe your transaction background, zoning experience or RICS survey credentials..."
                          className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A02E] resize-none font-sans"
                        ></textarea>
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3">
                        <button type="button" onClick={() => setApplyingJob(null)} className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-[#0A1D37] dark:text-slate-200 px-4 py-2 rounded-none text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">Cancel</button>
                        <button type="submit" disabled={appLoading} className="bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-slate-800 text-white font-bold px-4 py-2 rounded-none text-xs cursor-pointer transition-colors">
                          {appLoading ? "UPLOADING..." : "TRANSMIT CANDIDATE APPLICATION"}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* 9. FAQs TAB */}
        {currentTab === 'faq' && (
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            <div className="space-y-3 text-center">
              <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-widest font-bold block">RESOURCES</span>
              <h2 className="font-serif font-bold text-4xl text-[#0A1D37] dark:text-white tracking-tight">Frequently Asked Questions</h2>
              <p className="max-w-md mx-auto text-gray-500 dark:text-slate-400 text-sm">
                Get instant answers to typical questions regarding RICS compliant valuations, zoning audits, and transaction fiduciaries.
              </p>
            </div>

            {(() => {
              const faqs = settings?.content?.faqs || [];
              const categories = ['Corporate', 'Valuations', 'Legal'] as const;
              
              return (
                <div className="space-y-8">
                  {categories.map(cat => {
                    const catFaqs = faqs.filter(f => (f.category || 'Corporate') === cat);
                    if (catFaqs.length === 0) return null;
                    const catKey = `cat-${cat}`;
                    const isCatOpen = faqOpen[catKey] !== false;

                    return (
                      <div key={cat} className="bg-[#F4F7F9] dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 rounded-none space-y-4 shadow-sm">
                        <button
                          onClick={() => setFaqOpen(prev => ({ ...prev, [catKey]: !isCatOpen }))}
                          className="w-full flex justify-between items-center text-left cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#C5A02E]/10 text-[#C5A02E] flex items-center justify-center font-bold text-xs uppercase">
                              {cat.charAt(0)}
                            </div>
                            <h3 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white group-hover:text-[#C5A02E] transition-colors uppercase tracking-wider">
                              {cat} Advisory FAQs
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400 font-sans font-bold uppercase">{catFaqs.length} questions</span>
                            <ChevronDown className={`h-5 w-5 text-[#C5A02E] transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isCatOpen && (
                          <div className="divide-y divide-gray-200 dark:divide-slate-800 border-t border-gray-200 dark:border-slate-800 pt-2">
                            {catFaqs.map((faq) => {
                              const globalIdx = faqs.indexOf(faq);
                              const key = `faq-${globalIdx}`;
                              const isOpen = !!faqOpen[key];
                              return (
                                <div key={globalIdx} className="py-4 space-y-2">
                                  <button 
                                    onClick={() => toggleFaq(key)}
                                    className="w-full flex justify-between items-center text-left text-[#0A1D37] dark:text-white hover:text-[#C5A02E] dark:hover:text-[#C5A02E] transition-colors font-sans font-bold text-sm cursor-pointer"
                                  >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`h-4 w-4 text-[#C5A02E] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                  {isOpen && (
                                    <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed pt-1 pl-1 max-w-3xl animate-in fade-in duration-150">
                                      {faq.a}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* 10. CONTACT TAB */}
        {currentTab === 'contact' && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            {/* Inject ContactForm component */}
            <ContactForm settings={settings} />
          </div>
        )}

        {/* 11. CONSULTATION TAB */}
        {currentTab === 'consultation' && (
          <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            {/* Inject BookingForm component */}
            <BookingForm onSuccessClose={() => setTab('home')} settings={settings} />
          </div>
        )}

        {/* 12. APPLY NOW TAB */}
        {currentTab === 'apply' && (
          <div className={`max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            {/* Inject ApplyNowForm component */}
            <ApplyNowForm onSuccessClose={() => setTab('home')} onTrackClick={handleTrackApplication} settings={settings} />
          </div>
        )}

        {/* 13. TRACK APPLICATION TAB */}
        {currentTab === 'track' && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'}`}>
            <TrackApplication initialQuery={trackQuery} onApplyClick={() => setTab('apply')} settings={settings} setTab={setTab} />
          </div>
        )}

        {/* LEGAL PAGES (Privacy, Terms, Cookies, Disclaimer, Sitemap) */}
        {currentTab === 'privacy' && (
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'} text-gray-500 text-xs sm:text-sm leading-relaxed`}>
            <h2 className="font-serif font-bold text-2xl text-[#0A1D37]">Privacy Policy</h2>
            <p className="whitespace-pre-line">{settings?.content?.privacyPolicyText || `At ${settings.general?.companyName || "Howard Homes LLC"}, we respect the absolute privacy of our institutional and private capital clients. All consultation requests, municipal documentation, and correspondence transmitted via our contact forms are stored securely within local sandboxed networks.

We do not operate tracking cookie pools, nor do we disclose or sell client identities or real estate portfolios to third-party marketplaces or promotional agencies.`}</p>
          </div>
        )}

        {currentTab === 'terms' && (
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'} text-gray-500 text-xs sm:text-sm leading-relaxed`}>
            <h2 className="font-serif font-bold text-2xl text-[#0A1D37]">Terms of Service</h2>
            <p className="whitespace-pre-line">{settings?.content?.termsOfServiceText || `The materials, briefs, and valuation methodologies presented on this corporate website serve purely as informational guides. Underwriting models, zoning legal advice, and certified surveys require direct contractual agreements under real estate NDAs.

By engaging with this website, you acknowledge that ${settings.general?.companyName || "Howard Homes LLC"} does not act as a licensed property listing broker or transactional agency.`}</p>
          </div>
        )}

        {currentTab === 'cookies' && (
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'} text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed`}>
            <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Cookie Policy</h2>
            <p className="whitespace-pre-line">{settings?.content?.cookiePolicyText || `${settings.general?.companyName || "Howard Homes LLC"} utilizes simple functional session tokens to secure administration dashboard access. We do not engage in tracking pixels, commercial profiling, or third-party advertising cookie networks.`}</p>
          </div>
        )}

        {currentTab === 'disclaimer' && (
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'} text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed`}>
            <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Disclaimer</h2>
            <p className="whitespace-pre-line">{settings?.content?.disclaimerText || `${settings.general?.companyName || "Howard Homes LLC"} operates strictly under California municipal laws. Any content, blog analytical paper, or outline of zoning processes does not represent statutory tax or final legal zoning decisions. Clients are strictly advised to undergo direct custom surveys for certified audits.`}</p>
          </div>
        )}

        {currentTab === 'sitemap' && (
          <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6 ${settings?.styling?.animationStyle || 'animate-in fade-in duration-200'} text-gray-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed`}>
            <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Corporate Sitemap</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-4 font-sans">
              <div className="space-y-2">
                <p className="font-bold text-[#0A1D37] dark:text-white text-xs uppercase tracking-wider">Main Pages</p>
                <ul className="space-y-1 text-xs">
                  <li><button onClick={() => setTab('home')} className="hover:text-[#C5A02E] transition-colors">Home Landing</button></li>
                  <li><button onClick={() => setTab('about')} className="hover:text-[#C5A02E] transition-colors">About Story</button></li>
                  <li><button onClick={() => setTab('services')} className="hover:text-[#C5A02E] transition-colors">Advisory domains</button></li>
                  <li><button onClick={() => setTab('mission')} className="hover:text-[#C5A02E] transition-colors">Mission & Vision</button></li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-[#0A1D37] dark:text-white text-xs uppercase tracking-wider">Resources</p>
                <ul className="space-y-1 text-xs">
                  <li><button onClick={() => setTab('team')} className="hover:text-[#C5A02E] transition-colors">Our Team</button></li>
                  <li><button onClick={() => setTab('gallery')} className="hover:text-[#C5A02E] transition-colors">Media Gallery</button></li>
                  <li><button onClick={() => setTab('blog')} className="hover:text-[#C5A02E] transition-colors">Market Insights</button></li>
                  <li><button onClick={() => setTab('faq')} className="hover:text-[#C5A02E] transition-colors">FAQs Directory</button></li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-[#0A1D37] dark:text-white text-xs uppercase tracking-wider">Acquisition</p>
                <ul className="space-y-1 text-xs">
                  <li><button onClick={() => setTab('careers')} className="hover:text-[#C5A02E] transition-colors">Careers</button></li>
                  <li><button onClick={() => setTab('contact')} className="hover:text-[#C5A02E] transition-colors">Contact Corporate</button></li>
                  <li><button onClick={() => setTab('consultation')} className="hover:text-[#C5A02E] transition-colors">Book Advisory</button></li>
                </ul>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Corporate Footer Section */}
      <Footer setTab={setTab} onBookClick={() => setTab('consultation')} googleMapIframe={settings.general.googleMapIframe} settings={settings} />

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          className="no-print fixed bottom-6 left-6 z-40 bg-[#F4F7F9] border border-gray-300 text-[#C5A02E] p-3 rounded-full hover:bg-gray-200 hover:text-[#0A1D37] transition-all shadow-2xl hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
          title="Back to Top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}



      {/* Full Screen Interactive Admin Control Panel Modal */}
      {isAdminOpen && (
        <AdminPanel onClose={handleAdminClose} />
      )}

      <SupportWidget />
      
      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelect={(tab, id) => {
          setTab(tab);
          if (id) {
            // Give time for tab to switch then scroll
            setTimeout(() => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }
        }}
        blogs={blogs}
        team={team}
        settings={settings}
      />
    </div>
  );
}
