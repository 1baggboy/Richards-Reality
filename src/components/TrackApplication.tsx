import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileSearch, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  FileText, 
  Printer, 
  Copy, 
  Check, 
  ArrowRight, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  RefreshCw,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { WebsiteSettings } from '../types';
import { PrintHeader, PrintFooter, handleImmediatePrint } from './PrintHeaderFooter';
import { useToast } from './ui/Toast';

interface TrackApplicationProps {
  initialQuery?: string;
  onApplyClick?: () => void;
  settings?: WebsiteSettings;
  setTab?: (tab: string) => void;
}

interface ApplicationStatusResult {
  id: string;
  refNumber: string;
  applicantName: string;
  email: string;
  phone: string;
  serviceNeeded: string;
  property: string;
  preferredDate: string;
  submittedAt: string;
  updatedAt: string;
  status: string;
  statusStep: number;
  statusLabel: string;
  statusBadge: 'received' | 'in_review' | 'approved' | 'rejected';
  assignedTo: string;
  internalNotes: string;
  type: string;
}

export default function TrackApplication({ initialQuery = '', onApplyClick, settings, setTab }: TrackApplicationProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<ApplicationStatusResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printingRef, setPrintingRef] = useState<string | null>(null);
  const { info } = useToast();

  const handlePrintDocket = (e: React.MouseEvent, refNumber: string) => {
    setPrintingRef(refNumber);
    info(`Preparing official docket #${refNumber} for print / PDF export...`, "Print Dialog");
    handleImmediatePrint(e, () => {
      setPrintingRef(null);
    });
    setTimeout(() => setPrintingRef(null), 1500);
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performLookup(initialQuery);
    }
  }, [initialQuery]);

  const performLookup = async (queryToSearch: string) => {
    const clean = queryToSearch.trim();
    if (!clean) {
      setError("Please enter a valid Submission Reference ID (e.g., RR-APP-849201) or Email Address.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const response = await fetch(`/api/applications/status?id=${encodeURIComponent(clean)}`);
      const data = await response.json();

      if (response.ok && data.success && Array.isArray(data.results)) {
        setResults(data.results);
      } else {
        setResults([]);
        setError(data.error || `No application found matching "${clean}". Please verify your Submission ID or try searching with your email address.`);
      }
    } catch (err: any) {
      setResults([]);
      setError("A network error occurred while querying the administrative database. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchQuery);
  };

  const handleCopyId = (idText: string) => {
    navigator.clipboard.writeText(idText);
    setCopiedId(idText);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const stepsList = [
    { num: 1, label: 'Application Received', desc: 'Application & documents ingested into system' },
    { num: 2, label: 'Document & Income Check', desc: 'Paystubs & Driver License ID verification' },
    { num: 3, label: 'Executive Review', desc: 'Credit audit & landlord reference check' },
    { num: 4, label: 'Final Lease Decision', desc: 'Lease contract generation & execution' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 font-sans pb-12">
      
      {/* Top Banner */}
      <div className="no-print bg-[#0A1D37] text-white p-6 sm:p-10 border-b-4 border-[#C5A02E] shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
          <FileSearch className="w-64 h-64 text-[#C5A02E]" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#C5A02E]/20 border border-[#C5A02E]/40 px-3 py-1 text-xs font-mono font-bold text-[#C5A02E] uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Client Record Tracker
          </div>
          <h1 className="font-serif font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Track Application Status
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
            Check the real-time processing status of your residential rental application or consultation briefing. Enter your <strong>Submission Reference ID</strong> (e.g. <code>RR-APP-849201</code>) or primary <strong>Email Address</strong> below.
          </p>
        </div>
      </div>

      {/* Search Bar Card */}
      <div className="no-print bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <label htmlFor="search-input" className="block text-xs font-bold font-mono text-[#0A1D37] dark:text-slate-200 uppercase tracking-wider">
            Enter Submission Reference ID or Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Search className="h-5 w-5 text-[#C5A02E]" />
              </div>
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. RR-APP-123456 or john.doe@example.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-gray-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A02E] focus:border-transparent font-mono rounded-none"
                required
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(''); setError(null); }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0A1D37] hover:bg-slate-800 text-white font-bold uppercase text-xs tracking-wider px-8 py-3.5 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 border border-[#C5A02E]/30 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#C5A02E]" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FileSearch className="h-4 w-4 text-[#C5A02E]" />
                  <span>Track Application</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-gray-500 dark:text-slate-400 font-sans">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#C5A02E]" /> Typical application review window: 24–48 business hours.
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">Need to start a new application?</span>
              <button
                type="button"
                onClick={() => {
                  if (onApplyClick) onApplyClick();
                  else if (setTab) setTab('apply');
                }}
                className="text-[#C5A02E] hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                Apply Now <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error / Not Found Message */}
      {error && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-l-4 border-amber-500 p-6 shadow-md text-amber-900 dark:text-amber-200 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-amber-950 dark:text-amber-100">Application Reference Not Found</h3>
              <p className="text-xs leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 shadow-md space-y-6 animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 w-1/3"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 w-2/3"></div>
          <div className="grid grid-cols-4 gap-4 py-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-800"></div>
          </div>
        </div>
      )}

      {/* Search Results Display */}
      {!loading && searched && results.length > 0 && (
        <div className="space-y-8">
          {results.map((res) => (
            <div 
              key={res.id} 
              className="bg-white dark:bg-slate-900 border-2 border-[#0A1D37] dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 print:shadow-none print:border-none print:p-0"
            >
              {/* Structured Print Header (Visible strictly when printing) */}
              <PrintHeader 
                title="Official Housing Application Status & Record" 
                subtitle={`Status Docket for ${res.applicantName} • Property: ${res.property}`}
                referenceNumber={res.refNumber}
                settings={settings}
              />

              {/* Record Card Header */}
              <div className="bg-[#0A1D37] text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#C5A02E]">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C5A02E] bg-[#C5A02E]/10 border border-[#C5A02E]/30 px-2.5 py-0.5 font-bold">
                      Official Application Record
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      Type: {res.serviceNeeded}
                    </span>
                  </div>
                  <h2 className="font-serif font-bold text-xl sm:text-2xl text-white">
                    {res.applicantName}
                  </h2>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-[#C5A02E]" /> Requested Unit: <strong>{res.property}</strong>
                  </p>
                </div>

                <div className="bg-slate-800/90 p-4 border border-slate-700 flex flex-col items-start sm:items-end gap-1.5 shrink-0 w-full sm:w-auto">
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Submission Reference ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-lg text-emerald-400 tracking-wider">
                      {res.refNumber}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyId(res.refNumber)}
                      className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                      title="Copy Reference ID"
                    >
                      {copiedId === res.refNumber ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {copiedId === res.refNumber && (
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Copied to Clipboard!</span>
                  )}
                </div>
              </div>

              {/* Status Badge Alert Banner */}
              <div className={`p-4 border-b flex items-center justify-between flex-wrap gap-3 ${
                res.statusBadge === 'approved' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200' 
                  : res.statusBadge === 'rejected'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 text-amber-900 dark:text-amber-200'
              }`}>
                <div className="flex items-center gap-3">
                  {res.statusBadge === 'approved' ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : res.statusBadge === 'rejected' ? (
                    <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider block text-slate-500 dark:text-slate-400">Current Application Status</span>
                    <h3 className="font-serif font-bold text-base">{res.statusLabel}</h3>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-mono">Last Synchronized: </span>
                  <span className="font-bold font-mono">{new Date(res.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Progress Timeline Stepper */}
              <div className="p-6 sm:p-8 border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <h4 className="text-xs font-bold font-mono text-[#0A1D37] dark:text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-[#C5A02E]" /> Record Verification Workflow Timeline
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
                  {stepsList.map((st) => {
                    const isCompleted = res.statusStep > st.num || res.statusBadge === 'approved';
                    const isCurrent = res.statusStep === st.num && res.statusBadge !== 'approved';
                    const isFailed = st.num === 4 && res.statusBadge === 'rejected';

                    return (
                      <div 
                        key={st.num} 
                        className={`p-4 border relative transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white'
                            : isCurrent
                            ? 'bg-[#0A1D37] border-[#C5A02E] text-white shadow-lg'
                            : isFailed
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200'
                            : 'bg-white dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`w-7 h-7 flex items-center justify-center font-mono font-bold text-xs rounded-none border ${
                            isCompleted
                              ? 'bg-emerald-500 text-white border-emerald-600'
                              : isCurrent
                              ? 'bg-[#C5A02E] text-[#0A1D37] border-[#C5A02E]'
                              : isFailed
                              ? 'bg-rose-500 text-white border-rose-600'
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-300'
                          }`}>
                            {isCompleted ? <Check className="h-4 w-4" /> : st.num}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold opacity-70">
                            {isCompleted ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'}
                          </span>
                        </div>
                        <h5 className="font-serif font-bold text-sm leading-tight mb-1">{st.label}</h5>
                        <p className="text-[11px] opacity-80 leading-snug">{st.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Details Grid */}
              <div className="p-6 sm:p-8 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Application Parameters */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-5 border border-gray-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-serif font-bold text-sm text-[#0A1D37] dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[#C5A02E]" /> Application Metadata
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between border-b border-gray-200/60 dark:border-slate-700/60 pb-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Applicant Full Name:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{res.applicantName}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/60 dark:border-slate-700/60 pb-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Primary Contact Email:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{res.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/60 dark:border-slate-700/60 pb-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Contact Phone Number:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{res.phone || 'On File'}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/60 dark:border-slate-700/60 pb-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Property Requested:</span>
                        <span className="font-bold text-[#C5A02E]">{res.property}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200/60 dark:border-slate-700/60 pb-1.5">
                        <span className="text-gray-500 dark:text-slate-400">Desired Move-In Date:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{res.preferredDate || 'Immediate'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-slate-400">Assigned Property Manager:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{res.assignedTo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Attachment Verification Audit */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-5 border border-gray-200 dark:border-slate-700 space-y-4">
                    <h4 className="font-serif font-bold text-sm text-[#0A1D37] dark:text-white border-b border-gray-200 dark:border-slate-700 pb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-[#C5A02E]" /> Mandatory Attachment Verification Audit
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">Government Photo ID (Front Side)</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">VERIFIED</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">Government Photo ID (Back Side)</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">VERIFIED</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="font-medium text-slate-800 dark:text-slate-200">Proof of Income (Paystubs)</span>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-[10px] font-bold">VERIFIED</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Administrative Remarks Box */}
                <div className="bg-[#0A1D37]/5 dark:bg-slate-800/80 p-5 border-l-4 border-[#C5A02E] space-y-2">
                  <h4 className="font-serif font-bold text-xs uppercase text-[#0A1D37] dark:text-slate-200 flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-[#C5A02E]" /> Leasing Committee Updates & Administrative Notes
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {res.internalNotes}
                  </p>
                </div>

                {/* Card Action Controls (Hidden in Print) */}
                <div className="no-print pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={(e) => handlePrintDocket(e, res.refNumber)}
                    disabled={printingRef === res.refNumber}
                    className="w-full sm:w-auto px-6 py-3 bg-[#0A1D37] hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg border border-[#C5A02E]/40 disabled:opacity-85"
                    title="Print Application Status (Instant PDF / Print)"
                  >
                    {printingRef === res.refNumber ? (
                      <>
                        <RefreshCw className="h-4 w-4 text-[#C5A02E] animate-spin" />
                        <span>Launching Print Dialog...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 text-[#C5A02E]" />
                        <span>Print Application Status</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <a
                      href={`mailto:${settings?.general?.email || 'consulting@richardsrealty.com'}?subject=Status%20Inquiry%20for%20Application%20${res.refNumber}`}
                      className="w-full sm:w-auto px-5 py-3 bg-[#C5A02E] hover:bg-[#a88824] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <Mail className="h-4 w-4" /> Contact Leasing Officer
                    </a>
                  </div>
                </div>

                {/* Structured Print Footer (Visible strictly when printing) */}
                <PrintFooter settings={settings} />

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Default Informational Banner when no search conducted */}
      {!searched && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-8 shadow-md text-center space-y-4">
          <div className="w-12 h-12 bg-[#0A1D37]/10 dark:bg-slate-800 border border-[#C5A02E]/40 mx-auto flex items-center justify-center text-[#C5A02E]">
            <FileSearch className="h-6 w-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">
            Ready to Check Your Application Progress?
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Enter your Application Reference ID (e.g. <code>RR-APP-123456</code>) or email address in the search box above to view real-time updates from our property management team.
          </p>
        </div>
      )}

    </div>
  );
}
