/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ConsultationStatus = 
  | 'pending' 
  | 'approved' 
  | 'in_progress' 
  | 'completed' 
  | 'rescheduled' 
  | 'cancelled' 
  | 'rejected' 
  | 'archived';

export type ConsultationMethod = 'virtual' | 'phone' | 'in_person';

export interface ConsultationRequest {
  id: string;
  refNumber?: string;
  fullName: string;
  phone: string;
  email: string;
  company: string;
  serviceNeeded: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: ConsultationStatus;
  consultationMethod?: ConsultationMethod;
  assignedTo?: string;
  internalNotes?: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ConsultationDraft {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  serviceNeeded: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  currentStep?: number;
  totalSteps?: number;
  completedFieldsCount?: number;
  status: 'in_progress' | 'abandoned' | 'submitted';
  lastTouchedAt: string;
}

export type LeadStatus = 
  | 'New Lead' 
  | 'Contacted' 
  | 'Awaiting Response' 
  | 'Consultation Scheduled' 
  | 'Consultation Completed' 
  | 'Follow-up Required' 
  | 'Converted' 
  | 'Closed';

export interface UserProfile {
  id: string;
  uid?: string;
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  leadStatus: LeadStatus;
  tags: string[];
  assignedAdmin?: string;
  registrationDate: string;
  lastActive: string;
  notes?: string;
  consultationCount?: number;
  totalSubmissions?: number;
}

export interface CommunicationRecord {
  id: string;
  userEmail: string;
  userName: string;
  type: 'email' | 'phone_log' | 'meeting_note';
  subject: string;
  message: string;
  senderAdmin: string;
  templateUsed?: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
}

export interface FollowUpTask {
  id: string;
  userEmail: string;
  userName: string;
  assignedAdmin: string;
  scheduledDate: string;
  scheduledTime?: string;
  note: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'consultation_booking' | 'form_draft' | 'new_user' | 'submission' | 'followup_due' | 'support_chat';
  title: string;
  message: string;
  referenceId?: string;
  read: boolean;
  timestamp: string;
}

export interface UserActivityLog {
  id: string;
  userEmail: string;
  userName?: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  date: string;
  shortDesc: string;
  content: string;
  image: string;
  author: string;
  readTime: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  linkedin: string;
  email: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Office' | 'Meetings' | 'Projects' | 'Corporate Events' | 'Site Visits' | 'Team Activities';
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  review: string;
  rating: number;
}

export interface JobListing {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship';
  description: string;
  requirements: string[];
  status: 'active' | 'closed';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  coverLetter: string;
  resumeUrl: string; // Stored as base64 or file mock
  status?: 'pending' | 'reviewing' | 'interview' | 'hired' | 'rejected';
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface WebsiteSettings {
  general: {
    companyName: string;
    phone: string;
    email: string;
    address: string;
    workingHours: string;
    whatsappNumber: string;
    googleMapIframe: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    openGraphImage: string;
  };
  social: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  content?: {
    // Home Page
    heroHeadline?: string;
    heroSubheadline?: string;
    heroImage?: string;
    aboutHeadline?: string;
    aboutText?: string;
    aboutImage?: string;
    servicesHeadline?: string;
    servicesSubheadline?: string;
    missionHeadline?: string;
    missionText?: string;
    teamHeadline?: string;
    teamSubheadline?: string;
    faqs?: { q: string, a: string, category?: 'Valuations' | 'Legal' | 'Corporate' }[];
    // Other Pages
    aboutPageHeadline?: string;
    aboutPageText?: string;
    aboutPageStoryHeadline?: string;
    aboutPageStoryText?: string;
    aboutPageMessageHeadline?: string;
    aboutPageMessageText?: string;
    aboutPageMessageAuthor?: string;
    missionCoreHeadline?: string;
    missionCoreText?: string;
    missionVisionHeadline?: string;
    missionVisionText?: string;
    missionApproachHeadline?: string;
    missionApproachText?: string;
    missionCommitmentHeadline?: string;
    missionCommitmentText?: string;
    galleryHeadline?: string;
    gallerySubheadline?: string;
    blogHeadline?: string;
    blogSubheadline?: string;
    careersHeadline?: string;
    careersSubheadline?: string;
    contactHeadline?: string;
    contactSubheadline?: string;
    footerText?: string;
    privacyPolicyText?: string;
    termsOfServiceText?: string;
    cookiePolicyText?: string;
    disclaimerText?: string;
  };
  styling?: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    animationStyle?: string;
  };
}

export interface SystemLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface SupportThread {
  id: string;
  visitorName: string;
  visitorEmail: string;
  status: 'open' | 'active' | 'resolved';
  lastMessageAt: any; // Firebase Timestamp or string
  lastMessageText?: string;
  createdAt: any;
  visitorTyping?: boolean;
  adminTyping?: boolean;
}

export interface SupportMessage {
  id: string;
  text: string;
  sender: 'visitor' | 'admin';
  timestamp: any;
}
