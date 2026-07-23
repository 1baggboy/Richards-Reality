import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, ShieldCheck, Mail, Phone, Building2, User } from 'lucide-react';
import { useToast } from './ui/Toast';
import { WebsiteSettings } from '../types';

interface BookingFormProps {
  onSuccessClose?: () => void;
  settings?: WebsiteSettings;
}

export default function BookingForm({ onSuccessClose, settings }: BookingFormProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    serviceNeeded: 'Real Estate Consultancy',
    preferredDate: '',
    preferredTime: 'morning',
    message: '',
    captcha: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const services = [
    'Real Estate Consultancy',
    'Property Investment Advisory',
    'Property Valuation',
    'Facility Management',
    'Land Documentation Assistance',
    'Legal Consultation',
    'Development Advisory',
    'Project Management'
  ];

  const times = [
    { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)' },
    { value: 'evening', label: 'Late Afternoon (4:00 PM - 6:00 PM)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName || !formData.email || !formData.preferredDate || !formData.captcha) {
      const msg = 'Please fill in all mandatory fields.';
      setError(msg);
      toastWarning(msg, 'Incomplete Profile');
      return;
    }

    if (parseInt(formData.captcha) !== 9) {
      const msg = 'Anti-spam validation failed: 5 + 4 does not equal ' + formData.captcha;
      setError(msg);
      toastError(msg, 'Validation Error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        toastSuccess('Your corporate real estate advisory consultation has been scheduled successfully.', 'Consultation Confirmed');
        if (onSuccessClose) {
          setTimeout(() => {
            onSuccessClose();
          }, 3500);
        }
      } else {
        const errData = await response.json();
        const msg = errData.error || 'Failed to submit booking. Please check credentials.';
        setError(msg);
        toastError(msg, 'Booking Error');
      }
    } catch (err) {
      const msg = 'Server connection error. Please try again later.';
      setError(msg);
      toastError(msg, 'Connection Failure');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#F4F7F9] border border-gray-300 rounded-none p-8 text-center space-y-6 max-w-xl mx-auto shadow-2xl my-8 animate-in zoom-in-95 duration-300">
        <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 text-emerald-500 rounded-full mb-2">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <h3 className="font-serif font-bold text-2xl text-[#0A1D37] tracking-tight">Consultation Request Confirmed</h3>
        <p className="text-[#0A1D37] text-sm leading-relaxed">
          Thank you for choosing <span className="font-semibold text-[#0A1D37]">{settings?.general?.companyName || "Richards Realty LLC"}</span>. A senior corporate real estate officer will review your dossier and contact your office within <span className="font-semibold text-[#0A1D37]">1 business hour</span>.
        </p>
        <div className="bg-white p-4 rounded-none border border-gray-300 text-left text-xs space-y-2 font-sans">
          <p className="text-slate-500"><span className="text-[#0A1D37] font-semibold">Service:</span> {formData.serviceNeeded}</p>
          <p className="text-slate-500"><span className="text-[#0A1D37] font-semibold">Scheduled Date:</span> {formData.preferredDate}</p>
          <p className="text-slate-500"><span className="text-[#0A1D37] font-semibold">Accreditation:</span> Certified RICS Advisory Underwriting</p>
        </div>
        <p className="text-xs text-[#C5A02E] animate-pulse">Initializing direct corporate correspondence...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#F4F7F9]/90 border border-gray-300 rounded-none p-6 sm:p-8 shadow-2xl max-w-2xl mx-auto backdrop-blur-sm">
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-[#C5A02E] font-sans text-xs uppercase tracking-wider">
          <ShieldCheck className="h-4 w-4" />
          <span>Accredited Briefing Scheduler</span>
        </div>
        <h3 className="font-serif font-extrabold text-2xl text-[#0A1D37] tracking-tight">Schedule Corporate Advisory</h3>
        <p className="text-gray-500 text-xs">
          Submit your executive profile and preferred itinerary below. Our managing partner directly reviews high-value briefs.
        </p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-4 py-3 rounded-none text-xs font-sans mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#C5A02E]" /> Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="e.g. Richard Vance"
              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] placeholder:text-slate-600 focus:outline-none focus:border-[#C5A02E] transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#C5A02E]" /> Professional Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="name@company.com"
              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] placeholder:text-slate-600 focus:outline-none focus:border-[#C5A02E] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#C5A02E]" /> Contact Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] placeholder:text-slate-600 focus:outline-none focus:border-[#C5A02E] transition-colors"
            />
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-[#C5A02E]" /> Corporation / Entity
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Apex Holdings LLC"
              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] placeholder:text-slate-600 focus:outline-none focus:border-[#C5A02E] transition-colors"
            />
          </div>
        </div>

        {/* Service Needed */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500">
            Advisory Specialization <span className="text-rose-500">*</span>
          </label>
          <select
            name="serviceNeeded"
            value={formData.serviceNeeded}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E] transition-colors"
          >
            {services.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Preferred Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#C5A02E]" /> Target Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="preferredDate"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.preferredDate}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E] transition-colors"
            />
          </div>

          {/* Preferred Time */}
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-[#C5A02E]" /> Day Period <span className="text-rose-500">*</span>
            </label>
            <select
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E] transition-colors"
            >
              {times.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase font-sans tracking-wider text-gray-500">
            Advisory Brief & Scope Instructions
          </label>
          <textarea
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Briefly state zoning issues, portfolio metrics, or investment objectives (confidential under NDA)..."
            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2.5 text-xs text-[#0A1D37] placeholder:text-slate-600 focus:outline-none focus:border-[#C5A02E] transition-colors resize-none"
          ></textarea>
        </div>

        {/* CAPTCHA Protection */}
        <div className="bg-white border border-gray-300 rounded-none p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] text-[#C5A02E] uppercase font-sans tracking-wider font-semibold block">Spam Protection Verification</span>
            <p className="text-[11px] text-gray-500">What is the sum of <span className="text-[#0A1D37] font-semibold">5 + 4</span>? <span className="text-rose-500">*</span></p>
          </div>
          <input
            type="number"
            name="captcha"
            required
            value={formData.captcha}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="Your answer"
            className="bg-[#F4F7F9] border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] text-center w-28 focus:outline-none focus:border-[#C5A02E] transition-colors font-sans"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-slate-800 text-white hover:scale-[1.01] active:scale-[0.99] font-sans font-bold text-xs tracking-wider py-3.5 rounded-none transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? "TRANSMITTING BRIEF..." : "TRANSMIT ACCREDITED BRIEFING DOSSIER"}
        </button>
      </form>
    </div>
  );
}
