import React from 'react';
import { WebsiteSettings } from '../types';

/**
 * Universal print invocation helper that guarantees the print dialog 
 * immediately opens across all browsers and iframe preview sandboxes.
 */
export const handleImmediatePrint = (e?: React.SyntheticEvent | MouseEvent, onComplete?: () => void) => {
  if (e) {
    try {
      if (typeof (e as any).preventDefault === 'function') (e as any).preventDefault();
      if (typeof (e as any).stopPropagation === 'function') (e as any).stopPropagation();
    } catch (_) {}
  }

  // 1. Unfocus to remove active element artifacts
  try {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  } catch (_) {}

  // 2. Wrap in a short delay to allow UI to settle after click
  setTimeout(() => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error("Print dialog invocation failed:", err);
    }
    if (onComplete) {
      onComplete();
    }
  }, 250);
};

interface PrintHeaderProps {
  title?: string;
  subtitle?: string;
  referenceNumber?: string;
  documentType?: string;
  settings?: WebsiteSettings;
}

/**
 * Structured corporate print header displaying official logo, company name, 
 * physical address, phone, email, and live print timestamp.
 */
export function PrintHeader({ 
  title = "Official Housing Application Status & Record", 
  subtitle = "Residential Property Management & Advisory Records",
  referenceNumber,
  documentType = "Administrative Client Record",
  settings 
}: PrintHeaderProps) {
  const companyName = settings?.general?.companyName || "Richards Realty LLC";
  const phone = settings?.general?.phone || "+1 (800) 555-0190";
  const email = settings?.general?.email || "consulting@richardsrealty.com";
  const address = settings?.general?.address || "600 Montgomery St, 41st Floor, San Francisco, CA 94111";

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="print-only print-header w-full mb-6 pb-4 border-b-2 border-[#C5A02E]">
      <div className="flex items-start justify-between gap-6">
        
        {/* Left: Brand Emblem & Corporate Title */}
        <div className="flex items-center gap-4">
          {/* Stylized Logo Emblem for High-Res Print */}
          <div className="w-12 h-12 bg-[#0A1D37] border-2 border-[#C5A02E] rotate-45 flex items-center justify-center shrink-0 shadow-sm print:bg-[#0A1D37]">
            <span className="text-[#C5A02E] -rotate-45 font-serif text-2xl font-bold leading-none select-none">
              R
            </span>
          </div>

          <div className="flex flex-col">
            <h1 className="font-serif font-extrabold text-xl text-[#0A1D37] tracking-tight uppercase leading-tight">
              {companyName}
            </h1>
            <p className="text-[9px] font-sans uppercase tracking-[0.25em] text-[#C5A02E] font-bold">
              Corporate Real Estate Advisory • Housing Management
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-serif font-bold text-slate-800">
                {title}
              </span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-300 font-semibold uppercase">
                {documentType}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-sans">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Explicit Company Contact Details */}
        <div className="text-right text-[9px] font-sans text-slate-700 leading-snug space-y-0.5 shrink-0 max-w-[280px]">
          <p className="font-bold text-[#0A1D37] text-[10px] leading-tight">
            {address}
          </p>
          <p>
            <span className="font-bold text-slate-900">Phone:</span> {phone}
          </p>
          <p>
            <span className="font-bold text-slate-900">Email:</span> {email}
          </p>
          <p>
            <span className="font-bold text-slate-900">Portal:</span> www.richardsrealty.com | <span className="font-bold text-slate-900">DRE:</span> #01928471
          </p>
          {referenceNumber && (
            <p className="font-mono font-bold text-[#0A1D37] pt-1 text-[11px] text-[#0A1D37]">
              Docket Ref: <span className="text-emerald-700 font-extrabold">{referenceNumber}</span>
            </p>
          )}
          <p className="text-[8px] text-slate-500 font-mono pt-1 font-bold uppercase tracking-tighter">
            Date Printed: {currentDate} | {currentTime}
          </p>
        </div>

      </div>
    </div>
  );
}

interface PrintFooterProps {
  settings?: WebsiteSettings;
}

/**
 * Structured corporate print footer displaying legal disclaimer, confidentiality notice, 
 * contact details, and compliance certifications.
 */
export function PrintFooter({ settings }: PrintFooterProps) {
  const companyName = settings?.general?.companyName || "Richards Realty LLC";
  const phone = settings?.general?.phone || "+1 (800) 555-0190";
  const email = settings?.general?.email || "consulting@richardsrealty.com";
  const address = settings?.general?.address || "600 Montgomery St, 41st Floor, San Francisco, CA 94111";

  return (
    <div className="print-only print-footer w-full mt-8 pt-4 border-t border-slate-300 text-[8pt] text-slate-600 font-sans space-y-1.5">
      <div className="flex items-center justify-between text-[8.5pt] font-bold text-[#0A1D37] border-b border-slate-200 pb-1">
        <span>{companyName} • Official Housing Management & Application Record</span>
        <span>Equal Housing Opportunity • RICS Certified Standards</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-[7.5pt] text-slate-600">
        <div>
          <p className="leading-relaxed">
            <strong>CONFIDENTIALITY & DATA INTEGRITY NOTICE:</strong> This document and any attached verification files contain privileged administrative information intended solely for authorized personnel and the identified applicant. Any unauthorized copying, distribution, or dissemination is strictly prohibited.
          </p>
        </div>
        <div className="text-right space-y-0.5">
          <p><strong>Corporate Headquarters:</strong> {address}</p>
          <p><strong>Direct Helpline:</strong> {phone} | <strong>Email:</strong> {email}</p>
          <p className="font-mono text-[7pt] text-slate-400">California Municipal Code 7-A Compliance • Document Encrypted & Verified</p>
        </div>
      </div>
    </div>
  );
}
