import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useToast } from './ui/Toast';
import { WebsiteSettings } from '../types';

interface ContactFormProps {
  settings?: WebsiteSettings;
}

export default function ContactForm({ settings }: ContactFormProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    captcha: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.subject || !formData.message || !formData.captcha) {
      const msg = 'Please populate all required fields.';
      setError(msg);
      toastWarning(msg, 'Incomplete Fields');
      return;
    }

    if (parseInt(formData.captcha) !== 12) {
      const msg = 'Anti-spam validation failed: 8 + 4 does not equal ' + formData.captcha;
      setError(msg);
      toastError(msg, 'Validation Error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        toastSuccess('Your advisory inquiry has been transmitted securely.', 'Inquiry Sent');
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          captcha: '',
        });
      } else {
        const errData = await response.json();
        const msg = errData.error || 'Failed to submit inquiry.';
        setError(msg);
        toastError(msg, 'Submission Error');
      }
    } catch (err) {
      const msg = 'Could not connect to the database. Please try again.';
      setError(msg);
      toastError(msg, 'Connection Failure');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/18005550190?text=Hello%20Richards%20Realty,%20I%20would%20like%20to%20request%20an%20advisory%20consultation.', '_blank');
  };

  return (
    <div className="relative">
      {/* WhatsApp Floating Button */}
      <button
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center cursor-pointer group"
        title="Contact on WhatsApp"
      >
        <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.864-9.843.002-2.63-1.023-5.101-2.887-6.968C16.583 1.958 14.115.934 11.49.934c-5.441 0-9.866 4.414-9.87 9.846-.001 1.77.465 3.497 1.348 5.03l-.999 3.648 3.738-.981zm11.387-5.464c-.301-.15-1.78-.879-2.057-.98-.277-.101-.478-.15-.678.15-.2.3-.775.98-.95 1.18-.175.2-.35.225-.651.075-.301-.15-1.27-.468-2.42-1.494-.895-.798-1.5-1.784-1.676-2.084-.176-.3-.019-.462.13-.611.135-.133.301-.35.451-.524.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.524-.075-.15-.678-1.631-.93-2.238-.245-.592-.495-.512-.678-.521-.175-.008-.376-.01-.577-.01s-.527.075-.802.375c-.276.3-1.053 1.029-1.053 2.509s1.077 2.909 1.228 3.109c.15.2 2.119 3.237 5.132 4.537.717.309 1.277.494 1.711.632.72.228 1.375.196 1.893.118.577-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.125-.276-.201-.577-.351z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300">
          WhatsApp Chat
        </span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Panel: Contact Information */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-3">
            <span className="text-[#C5A02E] font-sans text-xs uppercase tracking-wider font-semibold block">
              Direct Channels
            </span>
            <h3 className="font-serif font-bold text-3xl text-[#0A1D37] dark:text-white tracking-tight">
              Get in Touch with Our Advisors
            </h3>
            <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed">
              Have questions regarding zoning laws, land document audits, RICS valuation compliance, or investment strategy briefs? Engage directly with our officers.
            </p>
          </div>

          <div className="space-y-6">
            {/* Address */}
            <div className="flex gap-4 p-4 bg-[#F4F7F9]/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-none shadow-sm">
              <div className="p-3 bg-[#C5A02E]/10 text-[#C5A02E] rounded-none shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-bold text-sm text-[#0A1D37] dark:text-white">Corporate HQ</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {settings?.general?.address || "600 Montgomery St, 41st Floor, Transamerica Pyramid, San Francisco, CA 94111"}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 p-4 bg-[#F4F7F9]/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-none shadow-sm">
              <div className="p-3 bg-[#C5A02E]/10 text-[#C5A02E] rounded-none shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-bold text-sm text-[#0A1D37] dark:text-white">Direct Correspondence</p>
                <a href={`mailto:${settings?.general?.email || "consulting@richardsrealty.com"}`} className="text-xs font-sans text-[#0A1D37] dark:text-slate-300 hover:text-[#C5A02E] transition-colors hover:underline">
                  {settings?.general?.email || "consulting@richardsrealty.com"}
                </a>
                <p className="text-[10px] text-slate-500 dark:text-slate-500">Response standard: within 1 business hour</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-4 p-4 bg-[#F4F7F9]/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-none shadow-sm">
              <div className="p-3 bg-[#C5A02E]/10 text-[#C5A02E] rounded-none shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-bold text-sm text-[#0A1D37] dark:text-white">Advisory Line</p>
                <a href={`tel:${settings?.general?.phone?.replace(/\s+/g, '') || "+18005550190"}`} className="text-xs font-sans text-[#0A1D37] dark:text-slate-300 hover:text-[#C5A02E] transition-colors hover:underline tabular-nums">
                  {settings?.general?.phone || "+1 (800) 555-0190"}
                </a>
                <p className="text-[10px] text-slate-500 dark:text-slate-500">Toll-free national consultations</p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex gap-4 p-4 bg-[#F4F7F9]/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-none shadow-sm">
              <div className="p-3 bg-[#C5A02E]/10 text-[#C5A02E] rounded-none shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-sans font-bold text-sm text-[#0A1D37] dark:text-white">Operation Schedule</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  {settings?.general?.workingHours || "Monday - Friday: 8:00 AM - 6:00 PM (PST), Saturday: Scheduled Bookings Only"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive Contact Form */}
        <div className="lg:col-span-7 bg-[#F4F7F9]/40 dark:bg-slate-900/40 border border-gray-300 dark:border-slate-800 p-6 sm:p-8 rounded-none shadow-xl backdrop-blur-sm">
          {success ? (
            <div className="text-center py-10 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-500 rounded-full mb-2">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h4 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">Message Transmitted Successfully</h4>
              <p className="text-[#0A1D37] dark:text-slate-300 text-xs leading-relaxed max-w-md mx-auto">
                Thank you for your correspondence. Your message has been logged in our administrative portal. A consulting advisor will follow up with you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-6 text-xs text-[#C5A02E] hover:text-[#A68625] font-sans uppercase tracking-wider font-semibold cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h4 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white tracking-tight">Transmit Inquiry Memo</h4>
              
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-none text-xs font-sans flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Jane Doe"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#C5A02E] transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">
                    Corporate Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="name@corporation.com"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#C5A02E] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">
                    Telephone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#C5A02E] transition-colors tabular-nums"
                  />
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">
                    Inquiry Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="e.g. Zoning Documentation Inquiry"
                    className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#C5A02E] transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500 dark:text-slate-400">
                  Message Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Provide parameters of your asset or consulting goals..."
                  className="w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#C5A02E] transition-colors resize-none"
                ></textarea>
              </div>

              {/* Anti-spam validation */}
              <div className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-none p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-0.5 text-center sm:text-left">
                  <span className="text-[9px] text-[#C5A02E] uppercase font-sans tracking-wider font-semibold block">Spam Protection</span>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">What is the sum of <span className="text-[#0A1D37] dark:text-white font-semibold">8 + 4</span>? <span className="text-rose-500">*</span></p>
                </div>
                <input
                  type="number"
                  name="captcha"
                  required
                  value={formData.captcha}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Your answer"
                  className="bg-[#F4F7F9] dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-none px-3 py-1.5 text-xs text-[#0A1D37] dark:text-white text-center w-28 focus:outline-none focus:border-[#C5A02E] transition-colors font-sans"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-slate-800 text-white font-sans font-bold text-xs tracking-wider py-3 rounded-none transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? "TRANSMITTING..." : "TRANSMIT MESSAGE SECURELY"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
