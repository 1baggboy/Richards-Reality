import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building, 
  User, 
  Home, 
  Briefcase, 
  Users, 
  PhoneCall, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  UploadCloud, 
  Lock, 
  Printer, 
  ArrowRight, 
  RefreshCw, 
  Calendar, 
  DollarSign,
  Info,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  FileCheck,
  Eye,
  FileWarning
} from 'lucide-react';
import { WebsiteSettings } from '../types';
import { PrintHeader, PrintFooter, handleImmediatePrint } from './PrintHeaderFooter';
import {
  isValidEmail,
  isValidPhone,
  isDateTodayOrFuture,
  isAdultDateOfBirth,
  isPositiveNumeric
} from '../lib/validation';

interface ApplyNowFormProps {
  onSuccessClose?: () => void;
  onTrackClick?: (refNumber: string) => void;
  settings?: WebsiteSettings;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const PAYMENT_MODES = [
  {
    id: 'PayPal',
    label: 'PayPal',
    sub: 'Online & Card',
    icon: (
      <div className="w-8 h-8 rounded bg-[#003087]/10 dark:bg-white/10 flex items-center justify-center shrink-0">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.476a.64.64 0 0 1 .632-.54h6.702c2.274 0 4.093.57 5.074 1.745.922 1.103 1.077 2.658.463 4.621-.61 1.954-1.782 3.498-3.483 4.588-1.554.996-3.473 1.501-5.704 1.501H6.77l-1.028 6.486a.64.64 0 0 0 .633.74h.701l.462-2.915a.64.64 0 0 1 .633-.54h2.247c3.483 0 6.22-1.415 7.02-4.998.347-1.554.124-2.85-.662-3.864-.84-1.082-2.3-1.636-4.341-1.636H5.708" fill="#003087" />
          <path d="M9.138 14.85h-2.37l1.378-8.718h4.636c1.688 0 3.038.375 3.766 1.15.684.729.799 1.761.344 3.063-.453 1.295-1.323 2.32-2.585 3.042-1.153.66-2.578.994-4.234.994l-.935.469" fill="#0079C1" />
        </svg>
      </div>
    )
  },
  {
    id: 'Venmo',
    label: 'Venmo',
    sub: 'Mobile Wallet',
    icon: (
      <div className="w-8 h-8 rounded bg-[#008CFF] flex items-center justify-center text-white font-extrabold text-base italic shrink-0 shadow-xs">
        <span>v</span>
      </div>
    )
  },
  {
    id: 'Zelle',
    label: 'Zelle',
    sub: 'Bank Transfer',
    icon: (
      <div className="w-8 h-8 rounded bg-[#7414CA] flex items-center justify-center text-white shrink-0 shadow-xs">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h12l-8 12h12" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
        </svg>
      </div>
    )
  },
  {
    id: 'Cash App',
    label: 'Cash App',
    sub: 'Instant Transfer',
    icon: (
      <div className="w-8 h-8 rounded bg-[#00D632] flex items-center justify-center text-white shrink-0 shadow-xs font-bold text-sm">
        <DollarSign className="h-5 w-5 text-white stroke-[2.5]" />
      </div>
    )
  }
];

export default function ApplyNowForm({ settings, onTrackClick }: ApplyNowFormProps) {
  // Active Section Step (1 to 6)
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPrintingReceipt, setIsPrintingReceipt] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  // Real-time Field Touched & Validation Errors
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [fileErrors, setFileErrors] = useState<{ income?: string; id_front?: string; id_back?: string }>({});

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    paymentMethod: 'PayPal',
    ssnOrIdNumber: '',
    maritalStatus: 'Single',
    totalOccupants: '1',

    // Step 2: Property & Residential History
    propertyRequested: '',
    desiredMoveInDate: '',
    leaseTerm: '12 Months',
    monthlyRentBudget: '',
    currentAddress: '',
    currentResidenceDuration: '',
    currentRentAmount: '',
    currentLandlordName: '',
    currentLandlordPhone: '',
    reasonForLeaving: '',

    // Step 3: Employment & Income
    employmentStatus: 'Full-time Employee',
    employerName: '',
    jobTitle: '',
    supervisorPhone: '',
    employmentDuration: '',
    grossMonthlyIncome: '',
    additionalIncomeSource: '',
    additionalMonthlyIncome: '',
    bankName: '',

    // Step 4: Co-Applicants, Occupants & Pets
    hasCoApplicants: 'No',
    coApplicantsDetails: '',
    minorOccupantsDetails: '',
    hasPets: 'No',
    petDetails: '',

    // Step 5: Document Upload & Emergency Disclosures
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
    emergencyContactEmail: '',
    hasEvictionHistory: 'No',
    hasBankruptcyHistory: 'No',
    hasFelonyHistory: 'No',
    isSmoker: 'No',
    screeningConsent: false,

    // Step 6: Submission Review & Digital Signature
    digitalSignature: '',
    signatureDate: new Date().toISOString().split('T')[0],
    captcha: ''
  });

  // Upload file states
  const [incomeDocName, setIncomeDocName] = useState<string | null>(null);
  const [idFrontDocName, setIdFrontDocName] = useState<string | null>(null);
  const [idBackDocName, setIdBackDocName] = useState<string | null>(null);

  // Upload file preview data URLs for Admin Panel
  const [incomeUrl, setIncomeUrl] = useState<string | null>(null);
  const [idFrontUrl, setIdFrontUrl] = useState<string | null>(null);
  const [idBackUrl, setIdBackUrl] = useState<string | null>(null);

  // Real-time Field Validators
  const validateEmail = (val: string): boolean => isValidEmail(val);
  const validatePhone = (val: string): boolean => isValidPhone(val);

  const fieldErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    // Step 1: Personal Details
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Legal Name is required.';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Full Legal Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Mobile phone number is required.';
    } else if (!isValidPhone(formData.phone)) {
      errs.phone = 'Please enter a valid phone number (10 to 15 digits).';
    }

    if (!formData.dateOfBirth.trim()) {
      errs.dateOfBirth = 'Date of Birth is required.';
    } else if (!isAdultDateOfBirth(formData.dateOfBirth)) {
      errs.dateOfBirth = 'Applicant must be at least 18 years old with a valid birth date.';
    }

    if (!formData.gender) {
      errs.gender = 'Gender selection is required.';
    }

    if (!formData.ssnOrIdNumber.trim()) {
      errs.ssnOrIdNumber = 'Social Security Number is required.';
    } else if (formData.ssnOrIdNumber.trim().length < 4) {
      errs.ssnOrIdNumber = 'Please enter a valid Social Security Number (at least 4 characters).';
    }

    if (!formData.maritalStatus) {
      errs.maritalStatus = 'Marital / Civil Status is required.';
    }

    if (!formData.totalOccupants) {
      errs.totalOccupants = 'Total Number of Occupants is required.';
    }

    if (!formData.paymentMethod) {
      errs.paymentMethod = 'Please select your preferred mode of payment.';
    }

    // Step 2: Property & Residential History
    if (!formData.propertyRequested.trim()) {
      errs.propertyRequested = 'Rental property address / unit requested is required.';
    } else if (formData.propertyRequested.trim().length < 3) {
      errs.propertyRequested = 'Please enter a complete property address or unit name.';
    }

    if (formData.desiredMoveInDate && !isDateTodayOrFuture(formData.desiredMoveInDate)) {
      errs.desiredMoveInDate = 'Desired move-in date cannot be in the past.';
    }

    if (!formData.currentAddress.trim()) {
      errs.currentAddress = 'Current residential street address is required.';
    } else if (formData.currentAddress.trim().length < 5) {
      errs.currentAddress = 'Please enter your complete current street address.';
    }

    if (formData.currentRentAmount.trim() && !isPositiveNumeric(formData.currentRentAmount)) {
      errs.currentRentAmount = 'Monthly rent amount must be a positive number.';
    }

    if (formData.currentLandlordPhone.trim() && !isValidPhone(formData.currentLandlordPhone)) {
      errs.currentLandlordPhone = 'Please enter a valid landlord phone number (10+ digits).';
    }

    // Step 3: Employment & Income
    if (!formData.employerName.trim()) {
      errs.employerName = 'Employer or primary source of income is required.';
    } else if (formData.employerName.trim().length < 2) {
      errs.employerName = 'Employer name must be at least 2 characters.';
    }

    if (!formData.grossMonthlyIncome.trim()) {
      errs.grossMonthlyIncome = 'Gross Monthly Income is required.';
    } else if (!isPositiveNumeric(formData.grossMonthlyIncome)) {
      errs.grossMonthlyIncome = 'Gross Monthly Income must be greater than $0.';
    }

    if (formData.supervisorPhone.trim() && !isValidPhone(formData.supervisorPhone)) {
      errs.supervisorPhone = 'Please enter a valid supervisor phone number (10+ digits).';
    }

    // Step 4: Co-Applicants & Pets (conditional required checks)
    if (formData.hasCoApplicants === 'Yes' && !formData.coApplicantsDetails.trim()) {
      errs.coApplicantsDetails = 'Please provide Co-Applicant names and details.';
    }

    if (formData.hasPets === 'Yes' && !formData.petDetails.trim()) {
      errs.petDetails = 'Please describe your pets or assistance animals (type, breed, weight).';
    }

    // Step 5: Document Upload & Emergency Contact
    if (!idFrontDocName) {
      errs.id_front = 'Government Photo ID (Front Side) upload is required.';
    }
    if (!idBackDocName) {
      errs.id_back = 'Government Photo ID (Back Side) upload is required.';
    }

    if (!formData.emergencyContactName.trim()) {
      errs.emergencyContactName = 'Emergency contact full name is required.';
    } else if (formData.emergencyContactName.trim().length < 2) {
      errs.emergencyContactName = 'Emergency contact name must be at least 2 characters.';
    }

    if (!formData.emergencyContactPhone.trim()) {
      errs.emergencyContactPhone = 'Emergency contact phone number is required.';
    } else if (!isValidPhone(formData.emergencyContactPhone)) {
      errs.emergencyContactPhone = 'Please enter a valid emergency phone number (10+ digits).';
    }

    if (!formData.screeningConsent) {
      errs.screeningConsent = 'You must agree to the Tenant Screening Authorization Consent.';
    }

    // Step 6: Submission Review & Signature
    if (!formData.digitalSignature.trim()) {
      errs.digitalSignature = 'Electronic Digital Signature is required.';
    } else if (formData.digitalSignature.trim().length < 2) {
      errs.digitalSignature = 'Please type your full legal name as your digital signature.';
    }

    if (!formData.captcha.trim()) {
      errs.captcha = 'Security verification answer is required.';
    } else if (parseInt(formData.captcha, 10) !== 9) {
      errs.captcha = 'Incorrect answer: 5 + 4 equals 9.';
    }

    return errs;
  }, [formData, idFrontDocName, idBackDocName]);

  // Draft auto-save handler (debounced)
  useEffect(() => {
    if (!formData.email || !isValidEmail(formData.email)) return;
    
    const timer = setTimeout(async () => {
      try {
        setIsDraftSaving(true);
        await fetch('/api/consultations/draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            fullName: formData.fullName || 'Anonymous Applicant',
            phone: formData.phone || '',
            serviceNeeded: 'Residential Rental Application',
            formData: formData,
            lastStepCompleted: activeStep,
            status: 'draft'
          })
        });
        setDraftSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error("Draft autosave failed", err);
      } finally {
        setIsDraftSaving(false);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData, activeStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    if (submitError) setSubmitError(null);

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  // File Upload with strict File Size & Format Validation
  const handleFileUpload = (type: 'income' | 'id_front' | 'id_back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileErrors(prev => ({ ...prev, [type]: undefined }));

    // File Size Check (Max 10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileErrors(prev => ({
        ...prev,
        [type]: `File size (${fileSizeMB}MB) exceeds maximum 10MB limit.`
      }));
      return;
    }

    // File Format Check
    if (ALLOWED_MIME_TYPES.length > 0 && !ALLOWED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i)) {
      setFileErrors(prev => ({
        ...prev,
        [type]: 'Unsupported format. Allowed: PDF, PNG, JPG, DOC, DOCX'
      }));
      return;
    }

    const formattedName = `${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
    if (type === 'income') setIncomeDocName(formattedName);
    if (type === 'id_front') setIdFrontDocName(formattedName);
    if (type === 'id_back') setIdBackDocName(formattedName);

    // Generate Data URL for image/document preview in Admin Panel
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'income') setIncomeUrl(result);
      if (type === 'id_front') setIdFrontUrl(result);
      if (type === 'id_back') setIdBackUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (step: number): boolean => {
    setSubmitError(null);

    if (step === 1) {
      const step1Fields = [
        'fullName',
        'email',
        'phone',
        'dateOfBirth',
        'gender',
        'paymentMethod',
        'ssnOrIdNumber',
        'maritalStatus',
        'totalOccupants'
      ];
      setTouchedFields(prev => ({
        ...prev,
        ...Object.fromEntries(step1Fields.map(k => [k, true]))
      }));
      for (const field of step1Fields) {
        if (fieldErrors[field]) {
          setSubmitError(fieldErrors[field]);
          return false;
        }
      }
    }

    if (step === 2) {
      const step2Fields = [
        'propertyRequested',
        'desiredMoveInDate',
        'currentAddress',
        'currentRentAmount',
        'currentLandlordPhone'
      ];
      setTouchedFields(prev => ({
        ...prev,
        ...Object.fromEntries(step2Fields.map(k => [k, true]))
      }));
      for (const field of step2Fields) {
        if (fieldErrors[field]) {
          setSubmitError(fieldErrors[field]);
          return false;
        }
      }
    }

    if (step === 3) {
      const step3Fields = ['employerName', 'grossMonthlyIncome', 'supervisorPhone'];
      setTouchedFields(prev => ({
        ...prev,
        ...Object.fromEntries(step3Fields.map(k => [k, true]))
      }));
      for (const field of step3Fields) {
        if (fieldErrors[field]) {
          setSubmitError(fieldErrors[field]);
          return false;
        }
      }
    }

    if (step === 4) {
      const step4Fields = ['coApplicantsDetails', 'petDetails'];
      setTouchedFields(prev => ({
        ...prev,
        ...Object.fromEntries(step4Fields.map(k => [k, true]))
      }));
      for (const field of step4Fields) {
        if (fieldErrors[field]) {
          setSubmitError(fieldErrors[field]);
          return false;
        }
      }
    }

    if (step === 5) {
      const step5Fields = ['id_front', 'id_back', 'emergencyContactName', 'emergencyContactPhone', 'screeningConsent'];
      setTouchedFields(prev => ({
        ...prev,
        ...Object.fromEntries(step5Fields.map(k => [k, true]))
      }));
      if (fieldErrors.id_front) {
        setSubmitError("Government Photo ID (Front Side) must be uploaded before proceeding to Step 6.");
        return false;
      }
      if (fieldErrors.id_back) {
        setSubmitError("Government Photo ID (Back Side) must be uploaded before proceeding to Step 6.");
        return false;
      }
      if (fieldErrors.emergencyContactName) {
        setSubmitError(fieldErrors.emergencyContactName);
        return false;
      }
      if (fieldErrors.emergencyContactPhone) {
        setSubmitError(fieldErrors.emergencyContactPhone);
        return false;
      }
      if (fieldErrors.screeningConsent) {
        setSubmitError("You must check the Background & Credit Screening Consent box to proceed.");
        return false;
      }
    }

    if (step === 6) {
      const step6Fields = ['digitalSignature', 'captcha'];
      setTouchedFields(prev => ({
        ...prev,
        ...Object.fromEntries(step6Fields.map(k => [k, true]))
      }));
      if (!idFrontDocName || !idBackDocName) {
        setSubmitError("Government Photo ID (Front AND Back sides) are strictly required before submitting your application. Please attach both sides in Step 5.");
        return false;
      }
      if (fieldErrors.digitalSignature) {
        setSubmitError(fieldErrors.digitalSignature);
        return false;
      }
      if (fieldErrors.captcha) {
        setSubmitError("Security math verification failed. (5 + 4 = 9).");
        return false;
      }
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 6));
      window.scrollTo({ top: 180, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    setActiveStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    setSubmitError(null);

    // Format rich structured JSON string & text message for Admin Panel preview & PDF export
    const structuredPayload = {
      propertyRequested: formData.propertyRequested,
      desiredMoveInDate: formData.desiredMoveInDate,
      leaseTerm: formData.leaseTerm,
      monthlyRentBudget: formData.monthlyRentBudget,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      paymentMethod: formData.paymentMethod,
      ssnOrIdNumber: formData.ssnOrIdNumber,
      maritalStatus: formData.maritalStatus,
      totalOccupants: formData.totalOccupants,
      currentAddress: formData.currentAddress,
      currentResidenceDuration: formData.currentResidenceDuration,
      currentRentAmount: formData.currentRentAmount,
      currentLandlordName: formData.currentLandlordName,
      currentLandlordPhone: formData.currentLandlordPhone,
      reasonForLeaving: formData.reasonForLeaving,
      employmentStatus: formData.employmentStatus,
      employerName: formData.employerName,
      jobTitle: formData.jobTitle,
      supervisorPhone: formData.supervisorPhone,
      grossMonthlyIncome: formData.grossMonthlyIncome,
      additionalIncomeSource: formData.additionalIncomeSource,
      additionalMonthlyIncome: formData.additionalMonthlyIncome,
      bankName: formData.bankName,
      hasCoApplicants: formData.hasCoApplicants,
      coApplicantsDetails: formData.coApplicantsDetails,
      minorOccupantsDetails: formData.minorOccupantsDetails,
      hasPets: formData.hasPets,
      petDetails: formData.petDetails,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactRelation: formData.emergencyContactRelation,
      emergencyContactPhone: formData.emergencyContactPhone,
      emergencyContactEmail: formData.emergencyContactEmail,
      hasEvictionHistory: formData.hasEvictionHistory,
      hasBankruptcyHistory: formData.hasBankruptcyHistory,
      hasFelonyHistory: formData.hasFelonyHistory,
      isSmoker: formData.isSmoker,
      incomeDocName: incomeDocName || 'Paystubs_Attached.pdf',
      idFrontDocName: idFrontDocName || 'Driver_License_Front_Attached.pdf',
      idBackDocName: idBackDocName || 'Driver_License_Back_Attached.pdf',
      digitalSignature: formData.digitalSignature,
      signatureDate: formData.signatureDate
    };

    const formattedTextMessage = `
--- OFFICIAL RESIDENTIAL RENTAL APPLICATION ---
PROPERTY REQUESTED: ${formData.propertyRequested} (Move-in: ${formData.desiredMoveInDate || 'Immediate'}, Term: ${formData.leaseTerm})

APPLICANT PERSONAL DETAILS:
Full Name: ${formData.fullName}
Email: ${formData.email} | Phone: ${formData.phone}
DOB: ${formData.dateOfBirth || 'N/A'} | Gender: ${formData.gender || 'N/A'} | Payment Mode: ${formData.paymentMethod || 'PayPal'} | Marital Status: ${formData.maritalStatus} | Total Occupants: ${formData.totalOccupants}
ID / SSN: ${formData.ssnOrIdNumber ? 'Provided (Encrypted & Verified)' : 'N/A'}

RESIDENTIAL HISTORY:
Current Address: ${formData.currentAddress} (${formData.currentResidenceDuration || 'N/A'})
Current Rent: $${formData.currentRentAmount || '0'}/mo | Landlord: ${formData.currentLandlordName || 'N/A'} (${formData.currentLandlordPhone || 'N/A'})
Reason for Leaving: ${formData.reasonForLeaving || 'N/A'}

EMPLOYMENT & FINANCIAL PROFILE:
Status: ${formData.employmentStatus} | Employer: ${formData.employerName}
Title: ${formData.jobTitle || 'N/A'} | Supervisor Phone: ${formData.supervisorPhone || 'N/A'}
Gross Monthly Income: $${formData.grossMonthlyIncome}/mo
Additional Funds: ${formData.additionalIncomeSource ? `${formData.additionalIncomeSource} ($${formData.additionalMonthlyIncome}/mo)` : 'None'}
Bank: ${formData.bankName || 'N/A'}

CO-APPLICANTS & PETS:
Co-Applicants: ${formData.hasCoApplicants === 'Yes' ? formData.coApplicantsDetails : 'None'}
Minor Occupants: ${formData.minorOccupantsDetails || 'None'}
Pets: ${formData.hasPets === 'Yes' ? formData.petDetails : 'None'}

EMERGENCY CONTACT:
Name: ${formData.emergencyContactName} (${formData.emergencyContactRelation || 'Contact'}) | Phone: ${formData.emergencyContactPhone} | Email: ${formData.emergencyContactEmail || 'N/A'}

LEGAL DISCLOSURES:
Evictions: ${formData.hasEvictionHistory} | Bankruptcy: ${formData.hasBankruptcyHistory} | Felony: ${formData.hasFelonyHistory} | Smoker: ${formData.isSmoker}
Uploaded Attachments: Paystubs: ${incomeDocName || 'Attached'}, Driver's License Front: ${idFrontDocName || 'Attached'}, Driver's License Back: ${idBackDocName || 'Attached'}
Digital Signature: ${formData.digitalSignature} (Executed on ${formData.signatureDate})

DOCUMENT_ATTACHMENTS_METADATA:
[ATTACHMENT_ID_FRONT: ${idFrontUrl || ''}]
[ATTACHMENT_ID_BACK: ${idBackUrl || ''}]
[ATTACHMENT_INCOME: ${incomeUrl || ''}]
`.trim();

    const generatedRef = `RR-APP-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          company: `Rental Applicant (${formData.propertyRequested})`,
          serviceNeeded: 'Residential Rental Application',
          preferredDate: formData.desiredMoveInDate || new Date().toISOString().split('T')[0],
          preferredTime: '10:00 AM',
          message: formattedTextMessage,
          consultationMethod: 'physical',
          captcha: formData.captcha,
          refNumber: generatedRef
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const returnedRef = data.request?.refNumber || generatedRef;
        setSubmittedData({
          refNumber: returnedRef,
          applicantName: formData.fullName,
          property: formData.propertyRequested,
          moveInDate: formData.desiredMoveInDate,
          email: formData.email,
          phone: formData.phone,
          submittedAt: new Date().toLocaleString()
        });
        window.scrollTo({ top: 150, behavior: 'smooth' });
      } else {
        setSubmitError(data.error || "Submission failed. Please check your form details.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "A network error occurred. Please try submitting again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Personal Details', icon: User },
    { num: 2, label: 'Residential History', icon: Home },
    { num: 3, label: 'Employment & Income', icon: Briefcase },
    { num: 4, label: 'Co-Applicants & Pets', icon: Users },
    { num: 5, label: 'Document Upload', icon: UploadCloud },
    { num: 6, label: 'Submission Review', icon: Eye }
  ];

  const progressPercentage = Math.round((activeStep / 6) * 100);

  // If application successfully submitted
  if (submittedData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300 py-4 font-sans">
        <div className="bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-2xl p-8 sm:p-10 space-y-8 text-slate-900 dark:text-white print:border-none print:shadow-none print:p-0">
          
          {/* Structured Print Header (Visible strictly when printing) */}
          <PrintHeader 
            title="Official Residential Rental Application Submission Receipt" 
            subtitle={`Applicant: ${submittedData.applicantName} • Property: ${submittedData.property}`}
            referenceNumber={submittedData.refNumber}
            documentType="Official Electronic Submission Receipt"
            settings={settings}
          />

          <div className="flex flex-col items-center text-center space-y-3 border-b border-gray-200 dark:border-slate-800 pb-6">
            <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500">
              <FileCheck className="h-8 w-8" />
            </div>
            <span className="text-[#C5A02E] font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 bg-[#C5A02E]/10 border border-[#C5A02E]/30">
              Application Received
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl text-[#0A1D37] dark:text-white">
              Application Successfully Submitted
            </h2>
            <p className="text-gray-600 dark:text-slate-300 text-sm max-w-xl">
              Thank you, <strong className="text-[#0A1D37] dark:text-white">{submittedData.applicantName}</strong>. Your rental application has been logged into the Howard Homes management directory and admin panel.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/80 p-6 border border-gray-200 dark:border-slate-700 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-700 pb-4">
              <div>
                <span className="text-xs text-gray-500 dark:text-slate-400 font-mono uppercase">Reference Number</span>
                <p className="font-mono font-bold text-xl text-[#0A1D37] dark:text-emerald-400">{submittedData.refNumber}</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-gray-500 dark:text-slate-400 font-mono uppercase">Submission Timestamp</span>
                <p className="font-sans text-xs font-semibold text-slate-700 dark:text-slate-200">{submittedData.submittedAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Rental Property Requested:</span>
                <p className="font-bold text-slate-900 dark:text-white">{submittedData.property}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Desired Move-In Date:</span>
                <p className="font-bold text-slate-900 dark:text-white">{submittedData.moveInDate || 'Immediate'}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Primary Contact Email:</span>
                <p className="font-bold text-slate-900 dark:text-white">{submittedData.email}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400 font-semibold">Contact Phone Number:</span>
                <p className="font-bold text-slate-900 dark:text-white">{submittedData.phone}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white flex items-center gap-2">
              <Info className="h-4 w-4 text-[#C5A02E]" /> What Happens Next?
            </h4>
            <ul className="text-xs text-gray-600 dark:text-slate-300 space-y-2 list-disc pl-5 leading-relaxed">
              <li>Our leasing team will verify income documents and landlord references within 24–48 business hours.</li>
              <li>You will receive an official notification email regarding application approval status or requests for supplementary documents.</li>
              <li>All application information is available to administrators in the Howard Homes Management Panel for PDF documentation.</li>
            </ul>
          </div>

          {/* Structured Print Footer (Visible strictly when printing) */}
          <PrintFooter settings={settings} />

          <div className="no-print pt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={(e) => {
                setIsPrintingReceipt(true);
                handleImmediatePrint(e, () => setIsPrintingReceipt(false));
                setTimeout(() => setIsPrintingReceipt(false), 1500);
              }}
              disabled={isPrintingReceipt}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-85"
              title="Print Application Receipt"
            >
              {isPrintingReceipt ? (
                <>
                  <RefreshCw className="h-4 w-4 text-[#C5A02E] animate-spin" />
                  <span>Launching Print Dialog...</span>
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 text-[#C5A02E]" />
                  <span>Print Application Receipt</span>
                </>
              )}
            </button>

            {onTrackClick && (
              <button
                onClick={() => onTrackClick(submittedData.refNumber)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#C5A02E] hover:bg-[#a68625] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Eye className="h-4 w-4" /> Track Status Live ({submittedData.refNumber})
              </button>
            )}

            <button
              onClick={() => {
                setSubmittedData(null);
                setSubmitError(null);
                setActiveStep(1);
                setTouchedFields({});
                setFileErrors({});
                setIncomeDocName(null);
                setIdFrontDocName(null);
                setIdBackDocName(null);
                setIncomeUrl(null);
                setIdFrontUrl(null);
                setIdBackUrl(null);
                setFormData({
                  fullName: '', email: '', phone: '', dateOfBirth: '', gender: 'Male', paymentMethod: 'PayPal', ssnOrIdNumber: '', maritalStatus: 'Single',
                  totalOccupants: '1', propertyRequested: '', desiredMoveInDate: '', leaseTerm: '12 Months',
                  monthlyRentBudget: '', currentAddress: '', currentResidenceDuration: '', currentRentAmount: '',
                  currentLandlordName: '', currentLandlordPhone: '', reasonForLeaving: '', employmentStatus: 'Full-time Employee',
                  employerName: '', jobTitle: '', supervisorPhone: '', employmentDuration: '', grossMonthlyIncome: '',
                  additionalIncomeSource: '', additionalMonthlyIncome: '', bankName: '', hasCoApplicants: 'No',
                  coApplicantsDetails: '', minorOccupantsDetails: '', hasPets: 'No', petDetails: '',
                  emergencyContactName: '', emergencyContactRelation: '', emergencyContactPhone: '',
                  emergencyContactEmail: '', hasEvictionHistory: 'No', hasBankruptcyHistory: 'No',
                  hasFelonyHistory: 'No', isSmoker: 'No', screeningConsent: false, digitalSignature: '',
                  signatureDate: new Date().toISOString().split('T')[0], captcha: ''
                });
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#0A1D37] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300 font-sans">
      
      {/* Top Header Banner */}
      <div className="bg-[#0A1D37] text-white p-6 sm:p-8 border-b-4 border-[#C5A02E] shadow-2xl">
        <div>
          <h2 className="font-serif font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Residential Rental Application
          </h2>
          <p className="text-gray-300 text-xs sm:text-sm max-w-2xl leading-relaxed mt-1">
            Complete all sections of the official housing application below. Information submitted is encrypted and directly linked to our administrative property management system.
          </p>
        </div>
      </div>

      {/* --- MULTI-STEP PROGRESS BAR WIDGET --- */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-4 shadow-md space-y-3">
        {/* Visual Progress Bar track */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#0A1D37] to-[#C5A02E] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Milestone Steps Buttons */}
        <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stepsList.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.num;
            const isCompleted = activeStep > step.num;

            return (
              <button
                key={step.num}
                type="button"
                onClick={() => {
                  if (step.num < activeStep || validateStep(activeStep)) {
                    setActiveStep(step.num);
                  }
                }}
                className={`flex items-center gap-2 p-2 border text-[11px] font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'border-[#C5A02E] text-[#0A1D37] dark:text-[#C5A02E] bg-slate-50 dark:bg-slate-800/80 font-bold shadow-sm' 
                    : isCompleted
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                    : 'border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-700'
                }`}
              >
                <div className={`w-4 h-4 shrink-0 flex items-center justify-center text-[9px] font-mono font-bold ${
                  isCompleted 
                    ? 'bg-emerald-500 text-white' 
                    : isActive 
                    ? 'bg-[#0A1D37] text-[#C5A02E]' 
                    : 'bg-gray-200 dark:bg-slate-800 text-gray-500'
                }`}>
                  {isCompleted ? <Check className="h-3 w-3" /> : step.num}
                </div>
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Alert Box */}
      {submitError && (
        <div className="p-4 bg-rose-500/10 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-8 text-slate-900 dark:text-white">
        
        {/* STEP 1: PERSONAL DETAILS */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-[#C5A02E]" /> 1. Applicant Personal Details
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Provide your primary legal identity and verified contact channels.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* Full Legal Name */}
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Full Legal Name <span className="text-rose-500">*</span></label>
                  {touchedFields.fullName && !fieldErrors.fullName && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="First, Middle, Last Name"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.fullName && fieldErrors.fullName
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.fullName && fieldErrors.fullName && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Email Address with Real-time Regex Validation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Email Address <span className="text-rose-500">*</span></label>
                  {touchedFields.email && !fieldErrors.email && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid Format</span>
                  )}
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="applicant@example.com"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.email && fieldErrors.email
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.email && fieldErrors.email && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.email}</p>
                )}
              </div>

              {/* Mobile Phone with Real-time Digit Pattern Check */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Mobile Phone Number <span className="text-rose-500">*</span></label>
                  {touchedFields.phone && !fieldErrors.phone && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.phone && fieldErrors.phone
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.phone && fieldErrors.phone && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Date of Birth <span className="text-rose-500">*</span></label>
                  {touchedFields.dateOfBirth && !fieldErrors.dateOfBirth && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  onBlur={() => handleBlur('dateOfBirth')}
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.dateOfBirth && fieldErrors.dateOfBirth
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.dateOfBirth && fieldErrors.dateOfBirth && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.dateOfBirth}</p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Gender <span className="text-rose-500">*</span></label>
                  {touchedFields.gender && formData.gender && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Selected</span>
                  )}
                </div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  onBlur={() => handleBlur('gender')}
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.gender && !formData.gender
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                {touchedFields.gender && !formData.gender && (
                  <p className="text-[10px] text-rose-500">Gender is required.</p>
                )}
              </div>

              {/* SSN / ID */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Social Security Number <span className="text-rose-500">*</span></label>
                  {touchedFields.ssnOrIdNumber && !fieldErrors.ssnOrIdNumber && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Provided</span>
                  )}
                </div>
                <input
                  type="password"
                  name="ssnOrIdNumber"
                  value={formData.ssnOrIdNumber}
                  onChange={handleChange}
                  onBlur={() => handleBlur('ssnOrIdNumber')}
                  placeholder="Encrypted Social Security Number"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.ssnOrIdNumber && fieldErrors.ssnOrIdNumber
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.ssnOrIdNumber && fieldErrors.ssnOrIdNumber && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.ssnOrIdNumber}</p>
                )}
              </div>

              {/* Marital Status */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Marital / Civil Status <span className="text-rose-500">*</span></label>
                  {touchedFields.maritalStatus && formData.maritalStatus && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Selected</span>
                  )}
                </div>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  onBlur={() => handleBlur('maritalStatus')}
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.maritalStatus && !formData.maritalStatus
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Domestic Partnership">Domestic Partnership</option>
                </select>
                {touchedFields.maritalStatus && !formData.maritalStatus && (
                  <p className="text-[10px] text-rose-500">Marital / Civil Status is required.</p>
                )}
              </div>

              {/* Total Occupants */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Total Number of Occupants <span className="text-rose-500">*</span></label>
                  {touchedFields.totalOccupants && formData.totalOccupants && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Specified</span>
                  )}
                </div>
                <select
                  name="totalOccupants"
                  value={formData.totalOccupants}
                  onChange={handleChange}
                  onBlur={() => handleBlur('totalOccupants')}
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.totalOccupants && !formData.totalOccupants
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5+">5+ People</option>
                </select>
                {touchedFields.totalOccupants && !formData.totalOccupants && (
                  <p className="text-[10px] text-rose-500">Total Number of Occupants is required.</p>
                )}
              </div>

              {/* Method / Mode of Payment */}
              <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-3 pt-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">
                    Mode of Payment <span className="text-rose-500">*</span>
                  </label>
                  {touchedFields.paymentMethod && formData.paymentMethod && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5">
                      <Check className="h-3 w-3" /> Selected: {formData.paymentMethod}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PAYMENT_MODES.map((mode) => {
                    const isSelected = formData.paymentMethod === mode.id;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, paymentMethod: mode.id }));
                          setTouchedFields(prev => ({ ...prev, paymentMethod: true }));
                        }}
                        className={`flex items-center gap-3 p-3 border text-left cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? 'border-[#C5A02E] bg-[#C5A02E]/10 dark:bg-[#C5A02E]/20 text-[#0A1D37] dark:text-white shadow-sm ring-1 ring-[#C5A02E]'
                            : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-[#C5A02E]/50'
                        }`}
                      >
                        {/* Brand Logo on the Side */}
                        {mode.icon}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold leading-tight truncate">{mode.label}</p>
                          <p className="text-[10px] text-gray-500 dark:text-slate-400 leading-tight truncate">{mode.sub}</p>
                        </div>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-[#C5A02E] bg-[#C5A02E]'
                            : 'border-gray-400 dark:border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {touchedFields.paymentMethod && !formData.paymentMethod && (
                  <p className="text-[10px] text-rose-500">Please select your preferred mode of payment.</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* STEP 2: PROPERTY & RESIDENTIAL HISTORY */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white flex items-center gap-2">
                <Home className="h-5 w-5 text-[#C5A02E]" /> 2. Property & Residential History
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Specify prospective rental premises and past landlord background verification.</p>
            </div>

            {/* Requested Premises Sub-grid */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-gray-200 dark:border-slate-700 space-y-4">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#0A1D37] dark:text-[#C5A02E]">Target Property Requested</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label className="text-gray-700 dark:text-slate-300">Property Address / Unit Requested <span className="text-rose-500">*</span></label>
                    {touchedFields.propertyRequested && !fieldErrors.propertyRequested && (
                      <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="propertyRequested"
                    value={formData.propertyRequested}
                    onChange={handleChange}
                    onBlur={() => handleBlur('propertyRequested')}
                    placeholder="e.g. 1995 Woodlake Dr, Orange Park, FL 32003"
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                      touchedFields.propertyRequested && fieldErrors.propertyRequested
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                    }`}
                    required
                  />
                  {touchedFields.propertyRequested && fieldErrors.propertyRequested && (
                    <p className="text-[10px] text-rose-500">{fieldErrors.propertyRequested}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Desired Move-In Date</label>
                  <input
                    type="date"
                    name="desiredMoveInDate"
                    value={formData.desiredMoveInDate}
                    onChange={handleChange}
                    onBlur={() => handleBlur('desiredMoveInDate')}
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                      touchedFields.desiredMoveInDate && fieldErrors.desiredMoveInDate
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                    }`}
                  />
                  {touchedFields.desiredMoveInDate && fieldErrors.desiredMoveInDate && (
                    <p className="text-[10px] text-rose-500">{fieldErrors.desiredMoveInDate}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Lease Term Requested</label>
                  <select
                    name="leaseTerm"
                    value={formData.leaseTerm}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                  >
                    <option value="12 Months">12 Months (Standard)</option>
                    <option value="18 Months">18 Months</option>
                    <option value="24 Months">24 Months</option>
                    <option value="6 Months">6 Months</option>
                    <option value="Month-to-Month">Month-to-Month</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Current Residence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Current Street Address <span className="text-rose-500">*</span></label>
                  {touchedFields.currentAddress && !fieldErrors.currentAddress && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="text"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  onBlur={() => handleBlur('currentAddress')}
                  placeholder="Street Address, City, State, Zip Code"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.currentAddress && fieldErrors.currentAddress
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.currentAddress && fieldErrors.currentAddress && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.currentAddress}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Duration at Current Address</label>
                <input
                  type="text"
                  name="currentResidenceDuration"
                  value={formData.currentResidenceDuration}
                  onChange={handleChange}
                  placeholder="e.g. 2 Years 4 Months"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Current Monthly Rent / Mortgage ($)</label>
                <input
                  type="number"
                  min="1"
                  name="currentRentAmount"
                  value={formData.currentRentAmount}
                  onChange={handleChange}
                  onBlur={() => handleBlur('currentRentAmount')}
                  placeholder="e.g. 2400"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.currentRentAmount && fieldErrors.currentRentAmount
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                />
                {touchedFields.currentRentAmount && fieldErrors.currentRentAmount && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.currentRentAmount}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Current Landlord / Manager Name</label>
                <input
                  type="text"
                  name="currentLandlordName"
                  value={formData.currentLandlordName}
                  onChange={handleChange}
                  placeholder="Landlord Name"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Landlord Phone Number</label>
                  {touchedFields.currentLandlordPhone && formData.currentLandlordPhone.trim() && !fieldErrors.currentLandlordPhone && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="tel"
                  name="currentLandlordPhone"
                  value={formData.currentLandlordPhone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('currentLandlordPhone')}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.currentLandlordPhone && fieldErrors.currentLandlordPhone
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                />
                {touchedFields.currentLandlordPhone && fieldErrors.currentLandlordPhone && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.currentLandlordPhone}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Reason for Leaving Current Residence</label>
                <textarea
                  name="reasonForLeaving"
                  value={formData.reasonForLeaving}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g., Seeking closer location to office, downsizing..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EMPLOYMENT & INCOME */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#C5A02E]" /> 3. Employment & Income Profile
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Details regarding primary employment status, monthly earnings, and financial assets.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Employment Status</label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                >
                  <option value="Full-time Employee">Full-time Employee</option>
                  <option value="Part-time Employee">Part-time Employee</option>
                  <option value="Self-Employed">Self-Employed / Business Owner</option>
                  <option value="Retired">Retired</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other Source of Funds</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Employer / Business Name <span className="text-rose-500">*</span></label>
                  {touchedFields.employerName && !fieldErrors.employerName && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="text"
                  name="employerName"
                  value={formData.employerName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('employerName')}
                  placeholder="Company Name"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.employerName && fieldErrors.employerName
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.employerName && fieldErrors.employerName && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.employerName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Job Title / Occupation</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  placeholder="e.g. Financial Analyst"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Gross Monthly Income ($) <span className="text-rose-500">*</span></label>
                  {touchedFields.grossMonthlyIncome && !fieldErrors.grossMonthlyIncome && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  name="grossMonthlyIncome"
                  value={formData.grossMonthlyIncome}
                  onChange={handleChange}
                  onBlur={() => handleBlur('grossMonthlyIncome')}
                  placeholder="e.g. 8500"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.grossMonthlyIncome && fieldErrors.grossMonthlyIncome
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.grossMonthlyIncome && fieldErrors.grossMonthlyIncome && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.grossMonthlyIncome}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Supervisor / HR Phone</label>
                  {touchedFields.supervisorPhone && formData.supervisorPhone.trim() && !fieldErrors.supervisorPhone && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="tel"
                  name="supervisorPhone"
                  value={formData.supervisorPhone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('supervisorPhone')}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.supervisorPhone && fieldErrors.supervisorPhone
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                />
                {touchedFields.supervisorPhone && fieldErrors.supervisorPhone && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.supervisorPhone}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Length of Employment</label>
                <input
                  type="text"
                  name="employmentDuration"
                  value={formData.employmentDuration}
                  onChange={handleChange}
                  placeholder="e.g. 3 Years"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: CO-APPLICANTS & PETS */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-[#C5A02E]" /> 4. Co-Applicants & Pets
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Information on secondary adult occupants, minors, or domestic pets.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Are there Co-Applicants (Adults 18+)?</label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                      <input type="radio" name="hasCoApplicants" value="Yes" checked={formData.hasCoApplicants === 'Yes'} onChange={handleChange} />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                      <input type="radio" name="hasCoApplicants" value="No" checked={formData.hasCoApplicants === 'No'} onChange={handleChange} />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {formData.hasCoApplicants === 'Yes' && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label className="text-gray-700 dark:text-slate-300">Co-Applicant Names & Details <span className="text-rose-500">*</span></label>
                      {touchedFields.coApplicantsDetails && !fieldErrors.coApplicantsDetails && (
                        <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                      )}
                    </div>
                    <textarea
                      name="coApplicantsDetails"
                      value={formData.coApplicantsDetails}
                      onChange={handleChange}
                      onBlur={() => handleBlur('coApplicantsDetails')}
                      rows={2}
                      placeholder="e.g. Jane Doe (Spouse) - Phone: 555-0199"
                      className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                        touchedFields.coApplicantsDetails && fieldErrors.coApplicantsDetails
                          ? 'border-rose-500 bg-rose-50/20'
                          : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                      }`}
                    />
                    {touchedFields.coApplicantsDetails && fieldErrors.coApplicantsDetails && (
                      <p className="text-[10px] text-rose-500">{fieldErrors.coApplicantsDetails}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Minor Occupants (Under 18 Years)</label>
                <input
                  type="text"
                  name="minorOccupantsDetails"
                  value={formData.minorOccupantsDetails}
                  onChange={handleChange}
                  placeholder="e.g. Child 1 (Age 8), Child 2 (Age 5)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Do you have pets or assistance animals?</label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                      <input type="radio" name="hasPets" value="Yes" checked={formData.hasPets === 'Yes'} onChange={handleChange} />
                      <span>Yes</span>
                    </label>
                    <label className="inline-flex items-center gap-1 text-xs cursor-pointer">
                      <input type="radio" name="hasPets" value="No" checked={formData.hasPets === 'No'} onChange={handleChange} />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                {formData.hasPets === 'Yes' && (
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <label className="text-gray-700 dark:text-slate-300">Pet Details (Type, Breed, Weight) <span className="text-rose-500">*</span></label>
                      {touchedFields.petDetails && !fieldErrors.petDetails && (
                        <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                      )}
                    </div>
                    <input
                      type="text"
                      name="petDetails"
                      value={formData.petDetails}
                      onChange={handleChange}
                      onBlur={() => handleBlur('petDetails')}
                      placeholder="e.g. Golden Retriever, 45 lbs"
                      className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                        touchedFields.petDetails && fieldErrors.petDetails
                          ? 'border-rose-500 bg-rose-50/20'
                          : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                      }`}
                    />
                    {touchedFields.petDetails && fieldErrors.petDetails && (
                      <p className="text-[10px] text-rose-500">{fieldErrors.petDetails}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENT UPLOAD & DISCLOSURES */}
        {activeStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-[#C5A02E]" /> 5. Document Upload & Legal Disclosures
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Attach mandatory identity/income documents (Max 10MB limit) and complete background declarations.</p>
            </div>

            {/* Document Upload Boxes with Strict 10MB Check */}
            <div className="space-y-4">
              
              {/* Government Photo ID for Driver's License (Front and Back Separately) */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-2 gap-1">
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#0A1D37] dark:text-[#C5A02E]">
                      Government Photo ID (Driver's License)
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      Upload front and back images of your Driver's License separately (Max 10MB limit per side).
                    </p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#C5A02E] shrink-0">Front & Back Required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Driver's License Front Side */}
                  <div className={`border-2 border-dashed p-4 text-center space-y-2 bg-white dark:bg-slate-900 transition-all ${
                    fileErrors.id_front || (touchedFields.id_front && fieldErrors.id_front) ? 'border-rose-500 bg-rose-500/10' : idFrontDocName ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-300 dark:border-slate-700'
                  }`}>
                    <UploadCloud className={`h-7 w-7 mx-auto ${fileErrors.id_front || (touchedFields.id_front && fieldErrors.id_front) ? 'text-rose-500' : idFrontDocName ? 'text-emerald-500' : 'text-[#C5A02E]'}`} />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Driver's License (Front Side) <span className="text-rose-500">*</span></div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">PDF, PNG, JPG up to 10MB</p>
                    
                    {(fileErrors.id_front || (touchedFields.id_front && fieldErrors.id_front)) && (
                      <div className="p-1.5 bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[10px] font-semibold flex items-center justify-center gap-1">
                        <FileWarning className="h-3.5 w-3.5 shrink-0" /> {fileErrors.id_front || fieldErrors.id_front}
                      </div>
                    )}

                    <label className="inline-block px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors">
                      <span>{idFrontDocName ? idFrontDocName : 'Upload ID Front'}</span>
                      <input type="file" onChange={(e) => handleFileUpload('id_front', e)} className="hidden" accept="image/*,.pdf" />
                    </label>
                  </div>

                  {/* Driver's License Back Side */}
                  <div className={`border-2 border-dashed p-4 text-center space-y-2 bg-white dark:bg-slate-900 transition-all ${
                    fileErrors.id_back || (touchedFields.id_back && fieldErrors.id_back) ? 'border-rose-500 bg-rose-500/10' : idBackDocName ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-300 dark:border-slate-700'
                  }`}>
                    <UploadCloud className={`h-7 w-7 mx-auto ${fileErrors.id_back || (touchedFields.id_back && fieldErrors.id_back) ? 'text-rose-500' : idBackDocName ? 'text-emerald-500' : 'text-[#C5A02E]'}`} />
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Driver's License (Back Side) <span className="text-rose-500">*</span></div>
                    <p className="text-[10px] text-gray-500 dark:text-slate-400">PDF, PNG, JPG up to 10MB</p>
                    
                    {(fileErrors.id_back || (touchedFields.id_back && fieldErrors.id_back)) && (
                      <div className="p-1.5 bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[10px] font-semibold flex items-center justify-center gap-1">
                        <FileWarning className="h-3.5 w-3.5 shrink-0" /> {fileErrors.id_back || fieldErrors.id_back}
                      </div>
                    )}

                    <label className="inline-block px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors">
                      <span>{idBackDocName ? idBackDocName : 'Upload ID Back'}</span>
                      <input type="file" onChange={(e) => handleFileUpload('id_back', e)} className="hidden" accept="image/*,.pdf" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Proof of Income (Paystubs Only) */}
              <div className={`border-2 border-dashed p-5 text-center space-y-2 bg-slate-50 dark:bg-slate-800/40 transition-all ${
                fileErrors.income ? 'border-rose-500 bg-rose-500/10' : incomeDocName ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-300 dark:border-slate-700'
              }`}>
                <UploadCloud className={`h-8 w-8 mx-auto ${fileErrors.income ? 'text-rose-500' : incomeDocName ? 'text-emerald-500' : 'text-[#C5A02E]'}`} />
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Proof of Income (Paystubs)</div>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  Please attach your recent paystubs up to <strong>10MB limit</strong>.
                </p>
                
                {fileErrors.income && (
                  <div className="p-2 bg-rose-500/20 text-rose-600 dark:text-rose-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 max-w-md mx-auto">
                    <FileWarning className="h-4 w-4" /> {fileErrors.income}
                  </div>
                )}

                <label className="inline-block px-4 py-2 bg-slate-800 text-white text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors shadow-sm">
                  <span>{incomeDocName ? incomeDocName : 'Upload Paystubs File'}</span>
                  <input type="file" onChange={(e) => handleFileUpload('income', e)} className="hidden" accept="image/*,.pdf,.doc,.docx" />
                </label>
              </div>

            </div>

            {/* Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 border border-gray-200 dark:border-slate-700">
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Emergency Contact Name <span className="text-rose-500">*</span></label>
                  {touchedFields.emergencyContactName && !fieldErrors.emergencyContactName && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('emergencyContactName')}
                  placeholder="First and Last Name"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.emergencyContactName && fieldErrors.emergencyContactName
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.emergencyContactName && fieldErrors.emergencyContactName && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.emergencyContactName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Relationship</label>
                <input
                  type="text"
                  name="emergencyContactRelation"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  placeholder="Parent, Sibling, Relative"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#C5A02E] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <label className="text-gray-700 dark:text-slate-300">Emergency Phone <span className="text-rose-500">*</span></label>
                  {touchedFields.emergencyContactPhone && !fieldErrors.emergencyContactPhone && (
                    <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Valid</span>
                  )}
                </div>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  onBlur={() => handleBlur('emergencyContactPhone')}
                  placeholder="+1 (555) 000-0000"
                  className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border text-xs text-slate-900 dark:text-white focus:outline-none ${
                    touchedFields.emergencyContactPhone && fieldErrors.emergencyContactPhone
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
                {touchedFields.emergencyContactPhone && fieldErrors.emergencyContactPhone && (
                  <p className="text-[10px] text-rose-500">{fieldErrors.emergencyContactPhone}</p>
                )}
              </div>
            </div>

            {/* Background Declarations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 border">
                <span>Evicted or asked to vacate rental?</span>
                <select name="hasEvictionHistory" value={formData.hasEvictionHistory} onChange={handleChange} className="px-2 py-1 bg-white dark:bg-slate-900 border">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 border">
                <span>Filed for bankruptcy?</span>
                <select name="hasBankruptcyHistory" value={formData.hasBankruptcyHistory} onChange={handleChange} className="px-2 py-1 bg-white dark:bg-slate-900 border">
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className={`p-4 border space-y-2 ${
              touchedFields.screeningConsent && fieldErrors.screeningConsent
                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-500'
                : 'bg-[#0A1D37]/5 dark:bg-slate-800/80 border-[#C5A02E]/30'
            }`}>
              <label className="flex items-start gap-3 cursor-pointer text-xs text-gray-700 dark:text-slate-200 leading-relaxed">
                <input
                  type="checkbox"
                  name="screeningConsent"
                  checked={formData.screeningConsent}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 text-[#C5A02E] border-gray-300 rounded-none focus:ring-0"
                />
                <span>
                  <strong>Tenant Screening Authorization Consent:</strong> I hereby certify that the statements made in this rental application are true and correct. I authorize Howard Homes LLC to perform background, employment, rental history, and consumer credit verification.
                </span>
              </label>
              {touchedFields.screeningConsent && fieldErrors.screeningConsent && (
                <p className="text-[10px] text-rose-500 font-semibold pl-7">{fieldErrors.screeningConsent}</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 6: SUBMISSION REVIEW & DIGITAL SIGNATURE */}
        {activeStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#C5A02E]" /> 6. Submission Review & Digital Signature
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Review your full application details below before executing your legal digital signature.</p>
            </div>

            {/* Mandatory ID Missing Warning Banner on Step 6 */}
            {(!idFrontDocName || !idBackDocName) && (
              <div className="p-4 bg-rose-500/10 border-l-4 border-rose-500 text-rose-700 dark:text-rose-300 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                  <span>
                    <strong>Action Required:</strong> Government Photo ID (both Front and Back sides) must be attached before submitting.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(5)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer transition-colors shadow-sm"
                >
                  Upload ID in Step 5
                </button>
              </div>
            )}

            {/* --- INTERACTIVE APPLICATION REVIEW DOSSIER CARD --- */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-5 border border-gray-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="border-b pb-3">
                <span className="font-serif font-bold text-base text-[#0A1D37] dark:text-white">Pre-Submission Application Summary</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Applicant Name</span>
                  <p className="font-bold text-slate-900 dark:text-white">{formData.fullName || 'Not Provided'} <span className="font-normal text-xs text-[#C5A02E]">({formData.gender})</span></p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Email & Phone</span>
                  <p className="font-mono text-slate-900 dark:text-white">{formData.email} | {formData.phone}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Mode of Payment</span>
                  <p className="font-bold text-[#C5A02E]">{formData.paymentMethod || 'PayPal'}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Property Requested</span>
                  <p className="font-bold text-[#C5A02E]">{formData.propertyRequested || 'Not Specified'}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Current Address</span>
                  <p className="text-slate-800 dark:text-slate-200">{formData.currentAddress || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Employer & Income</span>
                  <p className="font-bold text-slate-900 dark:text-white">{formData.employerName || 'N/A'} (${formData.grossMonthlyIncome}/mo)</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Attached Documents</span>
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">ID Front:</span>
                      {idFrontDocName ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Attached</span>
                      ) : (
                        <span className="text-rose-500 font-bold">Missing (Required)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">ID Back:</span>
                      {idBackDocName ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Attached</span>
                      ) : (
                        <span className="text-rose-500 font-bold">Missing (Required)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Digital Signature Field */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border border-gray-200 dark:border-slate-700 space-y-4">
              <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-[#0A1D37] dark:text-[#C5A02E]">Legal Electronic Signature</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <label className="text-gray-700 dark:text-slate-300">Type Your Full Legal Name <span className="text-rose-500">*</span></label>
                    {touchedFields.digitalSignature && !fieldErrors.digitalSignature && (
                      <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Signed</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="digitalSignature"
                    value={formData.digitalSignature}
                    onChange={handleChange}
                    onBlur={() => handleBlur('digitalSignature')}
                    placeholder="e.g. Johnathan Edward Doe"
                    className={`w-full px-3 py-2 bg-white dark:bg-slate-900 border font-serif text-sm italic text-[#0A1D37] dark:text-[#C5A02E] focus:outline-none ${
                      touchedFields.digitalSignature && fieldErrors.digitalSignature
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                    }`}
                    required
                  />
                  {touchedFields.digitalSignature && fieldErrors.digitalSignature && (
                    <p className="text-[10px] text-rose-500">{fieldErrors.digitalSignature}</p>
                  )}
                  <p className="text-[10px] text-gray-400">By typing your full name above, you acknowledge this electronic signature is legally binding.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Signature Date</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.signatureDate}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs text-gray-600 dark:text-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Captcha Security Check */}
            <div className="p-4 bg-slate-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center max-w-xs">
                <label className="text-xs font-bold text-[#0A1D37] dark:text-white block">
                  Security Math Verification Challenge <span className="text-rose-500">*</span>
                </label>
                {touchedFields.captcha && !fieldErrors.captcha && (
                  <span className="text-emerald-500 text-[10px] flex items-center gap-0.5"><Check className="h-3 w-3" /> Verified</span>
                )}
              </div>
              <div className="flex items-center gap-3 max-w-xs">
                <span className="font-mono font-bold text-sm bg-white dark:bg-slate-900 px-3 py-1.5 border border-gray-300 dark:border-slate-700">
                  5 + 4 =
                </span>
                <input
                  type="number"
                  name="captcha"
                  value={formData.captcha}
                  onChange={handleChange}
                  onBlur={() => handleBlur('captcha')}
                  placeholder="?"
                  className={`w-20 px-3 py-1.5 bg-white dark:bg-slate-900 border text-sm font-mono focus:outline-none ${
                    touchedFields.captcha && fieldErrors.captcha
                      ? 'border-rose-500 bg-rose-50/20'
                      : 'border-gray-300 dark:border-slate-700 focus:border-[#C5A02E]'
                  }`}
                  required
                />
              </div>
              {touchedFields.captcha && fieldErrors.captcha && (
                <p className="text-[10px] text-rose-500">{fieldErrors.captcha}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between gap-4">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {activeStep < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-[#0A1D37] hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>Continue to {stepsList[activeStep].label}</span>
              <ChevronRight className="h-4 w-4 text-[#C5A02E]" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-[#C5A02E] hover:bg-[#A68625] text-white text-xs font-extrabold uppercase tracking-widest transition-all flex items-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Transmitting Application...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4" />
                  <span>Submit Rental Application</span>
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
