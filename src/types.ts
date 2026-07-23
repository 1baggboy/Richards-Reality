/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConsultationRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  company: string;
  serviceNeeded: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: 'pending' | 'contacted' | 'completed';
  createdAt: string;
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
    faqs?: { q: string, a: string }[];
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
