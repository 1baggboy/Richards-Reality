import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, User, LogOut, LayoutDashboard, Settings as SettingsIcon, 
  FileText, MessageSquare, Briefcase, Users, Image as ImageIcon, 
  Mail, Activity, ShieldCheck, Database, Check, Trash2, Edit2, 
  Plus, X, ChevronRight, Eye, ShieldAlert, RefreshCw, Upload, Download, TrendingUp, Printer,
  Search, Calendar, Clock, Filter, Bell, CheckCircle2, XCircle, AlertCircle,
  Phone, Building2, Tag, Send, ChevronDown, ChevronUp, UserCheck, ArrowUpRight,
  PieChart, BarChart2, Layers, Clock3, CornerUpLeft, MoreVertical, Paperclip, HelpCircle
} from 'lucide-react';
import { 
  ConsultationRequest, ContactMessage, BlogPost, TeamMember, 
  GalleryItem, Testimonial, JobListing, JobApplication, 
  NewsletterSubscriber, WebsiteSettings, SystemLog,
  ConsultationDraft, UserProfile, CommunicationRecord, FollowUpTask, AdminNotification,
  ConsultationStatus, LeadStatus, ConsultationMethod
} from '../types';
import { useToast } from './ui/Toast';
import SupportInbox from './SupportInbox';
import PerformanceDashboard from './PerformanceDashboard';
import ActivityHeatmapWidget from './ActivityHeatmapWidget';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { PrintHeader, PrintFooter, handleImmediatePrint } from './PrintHeaderFooter';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [token, setToken] = useState<string | null>(localStorage.getItem('howard_admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [adminRole, setAdminRole] = useState<'Super Administrator' | 'Advisory Consultant' | 'Support Manager'>('Super Administrator');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'crm_users' | 'drafts' | 'submissions' | 'communications' | 'followups' | 'support_chat' | 'content' | 'blogs' | 'team' | 'gallery' | 'careers' | 'settings' | 'logs'>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');

  // Database lists
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [drafts, setDrafts] = useState<ConsultationDraft[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [careers, setCareers] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [communications, setCommunications] = useState<CommunicationRecord[]>([]);
  const [followups, setFollowups] = useState<FollowUpTask[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Search & Filters
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [submissionFilter, setSubmissionFilter] = useState<string>('all');
  const [consultationViewMode, setConsultationViewMode] = useState<'list' | 'calendar'>('list');

  // Drawers & Modals
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRequest | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<{ type: 'message' | 'application'; data: any } | null>(null);
  const [isPrintingRecord, setIsPrintingRecord] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState({ email: '', name: '' });
  const [emailForm, setEmailForm] = useState({ subject: '', template: 'Custom Briefing Notice', message: '' });
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [followupForm, setFollowupForm] = useState({ userEmail: '', userName: '', scheduledDate: '', scheduledTime: '10:00 AM', note: '' });

  // Content Editing Forms
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [blogFormData, setBlogFormData] = useState({ id: '', title: '', category: 'Market Insights', shortDesc: '', content: '', image: '', author: 'Howard Homes Advisory', readTime: '5 min read' });
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState({ id: '', name: '', position: '', bio: '', image: '', linkedin: '', email: '' });
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState({ title: '', category: 'Office' as any, image: '' });
  const [isCareerFormOpen, setIsCareerFormOpen] = useState(false);
  const [careerFormData, setCareerFormData] = useState({ id: '', title: '', department: 'Investment Advisory', location: 'San Francisco, CA', type: 'Full-time' as any, description: '', requirements: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Password Reset Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');

  // Load backend data
  const loadAdminData = async (adminToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${adminToken}` };
      
      const [
        resSettings, resConsultations, resDrafts, resUsers, resMessages, 
        resBlogs, resTeam, resGallery, resCareers, resApps, resSubs, 
        resLogs, resComms, resTasks, resNotifs
      ] = await Promise.all([
        fetch('/api/settings').then(r => r.json()).catch(() => null),
        fetch('/api/consultations', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/consultations/drafts', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/crm/users', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/messages', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/blogs').then(r => r.json()).catch(() => []),
        fetch('/api/team').then(r => r.json()).catch(() => []),
        fetch('/api/gallery').then(r => r.json()).catch(() => []),
        fetch('/api/careers').then(r => r.json()).catch(() => []),
        fetch('/api/applications', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/subscribers', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/logs', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/communications', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/followups', { headers }).then(r => r.json()).catch(() => []),
        fetch('/api/notifications', { headers }).then(r => r.json()).catch(() => [])
      ]);

      if (resSettings && !resSettings.error) setSettings(resSettings);
      if (Array.isArray(resConsultations)) setConsultations(resConsultations);
      if (Array.isArray(resDrafts)) setDrafts(resDrafts);
      if (Array.isArray(resUsers)) setUsers(resUsers);
      if (Array.isArray(resMessages)) setMessages(resMessages);
      if (Array.isArray(resBlogs)) setBlogs(resBlogs);
      if (Array.isArray(resTeam)) setTeam(resTeam);
      if (Array.isArray(resGallery)) setGallery(resGallery);
      if (Array.isArray(resCareers)) setCareers(resCareers);
      if (Array.isArray(resApps)) setApplications(resApps);
      if (Array.isArray(resSubs)) setSubscribers(resSubs);
      if (Array.isArray(resLogs)) setLogs(resLogs);
      if (Array.isArray(resComms)) setCommunications(resComms);
      if (Array.isArray(resTasks)) setFollowups(resTasks);
      if (Array.isArray(resNotifs)) setNotifications(resNotifs);
    } catch (err) {
      console.error("Failed loading administrative data:", err);
    }
  };

  const handleRefresh = async () => {
    if (!token || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toastSuccess('Database cache synced directly with Firestore.', 'Sync Completed');
    } catch (err) {
      console.error("Error manual sync:", err);
    } finally {
      await loadAdminData(token);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAdminData(token);
    }
  }, [token]);

  // Auth Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem('howard_admin_token', data.token);
        setToken(data.token);
        toastSuccess("Authenticated into Executive Control Hub.", "Access Granted");
      } else {
        setAuthError(data.error || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setAuthError('Connection failed. Backend server not running.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('howard_admin_token');
    setToken(null);
    signOut(auth).catch(() => {});
    onClose();
  };

  // Idle Timeout (15 minutes = 900,000 ms)
  useEffect(() => {
    if (!token) return;

    const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
    let timeoutId: ReturnType<typeof setTimeout>;
    let lastActivity = Date.now();

    const triggerIdleLogout = () => {
      toastWarning('Session expired due to 15 minutes of inactivity.', 'Security Logout');
      handleLogout();
    };

    const resetTimer = () => {
      lastActivity = Date.now();
      clearTimeout(timeoutId);
      timeoutId = setTimeout(triggerIdleLogout, IDLE_TIMEOUT_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastActivity >= IDLE_TIMEOUT_MS) {
        triggerIdleLogout();
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    if (newPassword !== confirmNewPassword) {
      setResetError('New passwords do not match.');
      return;
    }
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, recoveryKey, newPassword })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toastSuccess('Password successfully reset. You may now log in.', 'Security Reset');
        setIsResetModalOpen(false);
        setResetEmail('');
        setRecoveryKey('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setResetError(data.error || 'Password reset failed.');
      }
    } catch (err) {
      setResetError('Connection failed. Server not reachable.');
    }
  };

  // Status Updates
  const handleUpdateConsultation = async (id: string, updates: Partial<ConsultationRequest>) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toastSuccess(`Consultation record updated successfully.`, `Update Saved`);
        loadAdminData(token!);
        setSelectedConsultation(null);
      }
    } catch (err) {
      toastError('Failed to update consultation record.', 'Update Error');
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toastSuccess('Consultation record removed successfully.', 'Record Deleted');
        loadAdminData(token!);
      } else {
        const data = await res.json().catch(() => ({}));
        toastError(data.error || 'Failed to delete consultation record.', 'Delete Error');
      }
    } catch (err) {
      toastError('Network error while deleting consultation record.', 'Delete Error');
    }
  };

  // User Profile Update
  const handleUpdateUser = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/crm/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        toastSuccess('Client CRM record updated.', 'Profile Saved');
        loadAdminData(token!);
      }
    } catch (err) {
      toastError('Failed updating client profile.', 'Error');
    }
  };

  // Send Email Communication
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipient.email || !emailForm.subject || !emailForm.message) {
      toastWarning('Please fill out all email fields.', 'Incomplete Form');
      return;
    }
    try {
      const res = await fetch('/api/communications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userEmail: emailRecipient.email,
          userName: emailRecipient.name,
          subject: emailForm.subject,
          message: emailForm.message,
          templateUsed: emailForm.template
        })
      });
      if (res.ok) {
        toastSuccess(`Corporate email transmitted to ${emailRecipient.email}.`, 'Email Dispatched');
        setIsEmailModalOpen(false);
        setEmailForm({ subject: '', template: 'Custom Briefing Notice', message: '' });
        loadAdminData(token!);
      }
    } catch (err) {
      toastError('Failed to dispatch email.', 'Transmission Error');
    }
  };

  // Schedule Followup
  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followupForm.userEmail || !followupForm.scheduledDate || !followupForm.note) {
      toastWarning('Please populate follow-up details.', 'Incomplete Form');
      return;
    }
    try {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(followupForm)
      });
      if (res.ok) {
        toastSuccess(`Follow-up task scheduled for ${followupForm.scheduledDate}.`, 'Task Scheduled');
        setIsFollowupModalOpen(false);
        setFollowupForm({ userEmail: '', userName: '', scheduledDate: '', scheduledTime: '10:00 AM', note: '' });
        loadAdminData(token!);
      }
    } catch (err) {
      toastError('Failed scheduling follow-up.', 'Error');
    }
  };

  const handleMarkFollowupDone = async (id: string) => {
    try {
      const res = await fetch(`/api/followups/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      if (res.ok) {
        toastSuccess('Follow-up task marked completed.', 'Completed');
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // CSV Export
  const handleExportCSV = (type: string) => {
    window.open(`/api/admin/export/${type}?token=${token}`, '_blank');
  };

  // Blog CRUD
  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = blogFormData.id ? 'PUT' : 'POST';
    const url = blogFormData.id ? `/api/blogs/${blogFormData.id}` : '/api/blogs';
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(blogFormData)
      });
      if (res.ok) {
        setIsBlogFormOpen(false);
        setBlogFormData({ id: '', title: '', category: 'Market Insights', shortDesc: '', content: '', image: '', author: 'Howard Homes Advisory', readTime: '5 min read' });
        toastSuccess('Blog insight published.', 'Saved');
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toastSuccess('Article removed successfully.', 'Deleted');
        loadAdminData(token!);
      } else {
        toastError('Failed to delete article.', 'Error');
      }
    } catch (err) {
      toastError('Network error while deleting article.', 'Error');
    }
  };

  // Team CRUD
  const handleTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = teamFormData.id ? 'PUT' : 'POST';
    const url = teamFormData.id ? `/api/team/${teamFormData.id}` : '/api/team';
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(teamFormData)
      });
      if (res.ok) {
        setIsTeamFormOpen(false);
        setTeamFormData({ id: '', name: '', position: '', bio: '', image: '', linkedin: '', email: '' });
        toastSuccess('Personnel profile saved.', 'Saved');
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toastSuccess('Team member removed successfully.', 'Deleted');
        loadAdminData(token!);
      } else {
        toastError('Failed to delete team member.', 'Error');
      }
    } catch (err) {
      toastError('Network error while deleting team member.', 'Error');
    }
  };

  // Gallery CRUD
  const handleGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(galleryFormData)
      });
      if (res.ok) {
        setIsGalleryFormOpen(false);
        setGalleryFormData({ title: '', category: 'Office', image: '' });
        toastSuccess('Gallery asset registered.', 'Saved');
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toastSuccess('Gallery asset removed successfully.', 'Deleted');
        loadAdminData(token!);
      } else {
        toastError('Failed to delete gallery asset.', 'Error');
      }
    } catch (err) {
      toastError('Network error while deleting gallery asset.', 'Error');
    }
  };

  // Career CRUD
  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = careerFormData.id ? 'PUT' : 'POST';
    const url = careerFormData.id ? `/api/careers/${careerFormData.id}` : '/api/careers';
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(careerFormData)
      });
      if (res.ok) {
        setIsCareerFormOpen(false);
        setCareerFormData({ id: '', title: '', department: 'Investment Advisory', location: 'San Francisco, CA', type: 'Full-time', description: '', requirements: '' });
        toastSuccess('Career listing published.', 'Saved');
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCareer = async (id: string) => {
    try {
      const res = await fetch(`/api/careers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toastSuccess('Career listing removed successfully.', 'Deleted');
        loadAdminData(token!);
      } else {
        toastError('Failed to delete career listing.', 'Error');
      }
    } catch (err) {
      toastError('Network error while deleting career listing.', 'Error');
    }
  };

  // Derived Metrics for Dashboard
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const totalConsultations = consultations.length;
    const pendingConsultations = consultations.filter(c => c.status === 'pending').length;
    const approvedConsultations = consultations.filter(c => c.status === 'approved' || c.status === 'in_progress').length;
    const completedConsultations = consultations.filter(c => c.status === 'completed').length;
    const cancelledConsultations = consultations.filter(c => c.status === 'cancelled' || c.status === 'rejected').length;
    const upcomingConsultations = consultations.filter(c => c.preferredDate >= new Date().toISOString().split('T')[0]).length;
    const totalEnquiries = messages.length + applications.length;
    const activeDrafts = drafts.filter(d => d.status === 'in_progress').length;
    const pendingFollowups = followups.filter(f => f.status === 'pending').length;
    const unreadNotifications = notifications.filter(n => !n.read).length;

    return {
      totalUsers,
      totalConsultations,
      pendingConsultations,
      approvedConsultations,
      completedConsultations,
      cancelledConsultations,
      upcomingConsultations,
      totalEnquiries,
      activeDrafts,
      pendingFollowups,
      unreadNotifications
    };
  }, [users, consultations, messages, applications, drafts, followups, notifications]);

  // Global search hits
  const searchResults = useMemo(() => {
    if (!globalSearchQuery.trim()) return [];
    const q = globalSearchQuery.toLowerCase();
    const hits: { type: string; title: string; subtitle: string; action: () => void }[] = [];

    users.forEach(u => {
      if (u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.company?.toLowerCase().includes(q)) {
        hits.push({
          type: 'Client Profile',
          title: u.fullName,
          subtitle: `${u.email} | ${u.company || 'Individual'} | ${u.leadStatus}`,
          action: () => { setSelectedUser(u); setActiveTab('crm_users'); setIsGlobalSearchOpen(false); }
        });
      }
    });

    consultations.forEach(c => {
      if (c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.serviceNeeded.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)) {
        hits.push({
          type: 'Consultation Booking',
          title: `${c.fullName} - ${c.serviceNeeded}`,
          subtitle: `Date: ${c.preferredDate} | Status: ${c.status.toUpperCase()} | Ref: ${c.id}`,
          action: () => { setSelectedConsultation(c); setActiveTab('consultations'); setIsGlobalSearchOpen(false); }
        });
      }
    });

    messages.forEach(m => {
      if (m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q)) {
        hits.push({
          type: 'Contact Inquiry',
          title: `${m.fullName}: ${m.subject}`,
          subtitle: `${m.email} | ${m.createdAt.split('T')[0]}`,
          action: () => { setSelectedSubmission({ type: 'message', data: m }); setActiveTab('submissions'); setIsGlobalSearchOpen(false); }
        });
      }
    });

    return hits;
  }, [globalSearchQuery, users, consultations, messages]);

  // If not logged in, show Login UI
  if (!token) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-[#0A1D37]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-none shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#0A1D37] text-[#C5A02E]">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-lg text-[#0A1D37] dark:text-white">Executive Control Hub</h3>
                  <p className="text-[11px] font-sans text-gray-500 dark:text-slate-400">Howard Homes LLC Administration</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-none cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-none mb-5 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 font-sans">
              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-slate-300 block mb-1">
                  Administrator Account
                </label>
                <div className="relative">
                  <User className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@howardhomes.com"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 pl-9 pr-3 py-2.5 text-xs text-[#0A1D37] dark:text-white focus:outline-none focus:border-[#C5A02E]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-600 dark:text-slate-300 block mb-1">
                  Security Passcode
                </label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 pl-9 pr-3 py-2.5 text-xs text-[#0A1D37] dark:text-white focus:outline-none focus:border-[#C5A02E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0A1D37] hover:bg-[#071426] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-none transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#C5A02E]/30"
              >
                <ShieldCheck className="h-4 w-4 text-[#C5A02E]" /> Login
              </button>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-500">Need credential recovery?</span>
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(true)}
                  className="text-[11px] font-bold text-[#C5A02E] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" /> Secure Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Secure Password Reset Modal */}
        {isResetModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-700 max-w-md w-full p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-[#C5A02E]" />
                  <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white uppercase tracking-wider">
                    Secure Password Reset
                  </h3>
                </div>
                <button onClick={() => setIsResetModalOpen(false)} className="text-gray-400 hover:text-white cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {resetError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4 font-sans text-xs">
                <p className="text-slate-600 dark:text-slate-300">
                  Enter your administrative email and the corporate master security recovery key to authorize a credential update.
                </p>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                    Administrator Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="admin@howardhomes.com"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A02E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                    Master Security Recovery Key
                  </label>
                  <input
                    type="password"
                    required
                    value={recoveryKey}
                    onChange={(e) => setRecoveryKey(e.target.value)}
                    placeholder="Enter master recovery key"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A02E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                    New Security Passcode
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A02E]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 dark:text-slate-300 block mb-1 uppercase tracking-wider text-[10px]">
                    Confirm New Passcode
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new passcode"
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-[#C5A02E]"
                  />
                </div>

                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[10px] text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Security Note:</span> The default master recovery key for bootstrap recovery is <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 py-0.5 font-bold">HOWARD-SECURE-2026</code>.
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetModalOpen(false)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-wider text-[11px] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0A1D37] hover:bg-[#071426] text-white font-bold uppercase tracking-wider text-[11px] cursor-pointer border border-[#C5A02E]/30"
                  >
                    Update Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F7F9] dark:bg-slate-950 flex flex-col font-sans overflow-hidden animate-in fade-in duration-200">
      
      {/* --- TOP BAR NAVIGATION --- */}
      <header className="bg-[#0A1D37] border-b border-[#0A1D37]/20 dark:border-slate-800 text-white h-16 shrink-0 px-4 sm:px-6 flex items-center justify-between shadow-lg">
        
        {/* Left Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-1.5 hover:bg-slate-800 rounded-none text-slate-300"
          >
            <Layers className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C5A02E] flex items-center justify-center font-serif font-bold text-[#0A1D37] text-base shadow-inner">
              R
            </div>
            <div>
              <h1 className="font-serif font-bold text-sm tracking-wide text-white flex items-center gap-2">
                Howard Homes
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block">Administrative Advisory & CRM System</p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-md w-full mx-4 hidden md:block">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Global search clients, bookings, reference IDs... (⌘K)"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              setIsGlobalSearchOpen(true);
            }}
            onFocus={() => setIsGlobalSearchOpen(true)}
            className="w-full bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-400 pl-9 pr-8 py-2 rounded-none focus:outline-none focus:border-[#C5A02E]"
          />
          {globalSearchQuery && (
            <button 
              onClick={() => { setGlobalSearchQuery(''); setIsGlobalSearchOpen(false); }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Search Dropdown Modal */}
          {isGlobalSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-11 left-0 right-0 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-2xl z-50 max-h-80 overflow-y-auto font-sans">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Matching Search Records ({searchResults.length})
              </div>
              {searchResults.map((hit, idx) => (
                <button
                  key={idx}
                  onClick={hit.action}
                  className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-b border-gray-100 dark:border-slate-800 transition-colors flex items-center justify-between group"
                >
                  <div>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 bg-[#C5A02E]/20 text-[#C5A02E] font-bold mr-2">{hit.type}</span>
                    <span className="text-xs font-semibold text-[#0A1D37] dark:text-white">{hit.title}</span>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{hit.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#C5A02E]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Top Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Role Switcher */}
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
            <UserCheck className="h-3.5 w-3.5 text-[#C5A02E]" />
            <select
              value={adminRole}
              onChange={(e) => setAdminRole(e.target.value as any)}
              className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="Super Administrator" className="bg-slate-900">Super Administrator</option>
              <option value="Advisory Consultant" className="bg-slate-900">Advisory Consultant</option>
              <option value="Support Manager" className="bg-slate-900">Support Manager</option>
            </select>
          </div>

          {/* Sync Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Sync Database with Firestore"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-none border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[#C5A02E]' : ''}`} />
          </button>

          {/* Notification Drawer Button */}
          <button
            onClick={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-none border border-slate-700 transition-colors cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {metrics.unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center animate-pulse">
                {metrics.unreadNotifications}
              </span>
            )}
          </button>

          {/* User Profile & Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-medium rounded-none transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-none cursor-pointer ml-1">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* --- BODY MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* --- LEFT SIDEBAR NAVIGATION --- */}
        <aside className={`
          w-64 bg-[#0A1D37] border-r border-[#0A1D37]/30 dark:border-slate-800 flex flex-col shrink-0 text-slate-300 transition-all z-30
          absolute md:static top-0 bottom-0 left-0 ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="flex-1 overflow-y-auto p-3 space-y-6 text-xs font-sans">
            
            {/* Executive Section */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Executive Control</p>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('overview'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'overview' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard Overview</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Client Engagement & CRM */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Consultations & CRM</p>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('consultations'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'consultations' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4" />
                    <span>Bookings & Calendar</span>
                  </div>
                  {metrics.pendingConsultations > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold text-[10px]">{metrics.pendingConsultations}</span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('crm_users'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'crm_users' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4" />
                    <span>Client CRM Directory</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{users.length}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('drafts'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'drafts' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock3 className="h-4 w-4" />
                    <span>Drafts & Progress</span>
                  </div>
                  {metrics.activeDrafts > 0 && (
                    <span className="px-1.5 py-0.2 bg-indigo-500 text-white font-bold text-[10px]">{metrics.activeDrafts}</span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('support_chat'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'support_chat' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="h-4 w-4" />
                    <span>Live Support Inbox</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Submissions & Comms */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Inquiries & Outreach</p>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('submissions'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'submissions' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4" />
                    <span>Submissions Center</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{metrics.totalEnquiries}</span>
                </button>

                <button
                  onClick={() => { setActiveTab('communications'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'communications' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4" />
                    <span>Email Dispatcher</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveTab('followups'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-none font-medium transition-colors text-left cursor-pointer ${activeTab === 'followups' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold shadow-md' : 'hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-4 w-4" />
                    <span>Follow-Up Scheduler</span>
                  </div>
                  {metrics.pendingFollowups > 0 && (
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-bold text-[10px]">{metrics.pendingFollowups}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Content & Portal */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Website Content</p>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('content'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors text-left cursor-pointer ${activeTab === 'content' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold' : 'hover:bg-slate-800/80'}`}
                >
                  <SettingsIcon className="h-4 w-4" /> <span>Website Content & FAQs</span>
                </button>
                <button
                  onClick={() => { setActiveTab('blogs'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors text-left cursor-pointer ${activeTab === 'blogs' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold' : 'hover:bg-slate-800/80'}`}
                >
                  <FileText className="h-4 w-4" /> <span>Market Insights ({blogs.length})</span>
                </button>
                <button
                  onClick={() => { setActiveTab('team'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors text-left cursor-pointer ${activeTab === 'team' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold' : 'hover:bg-slate-800/80'}`}
                >
                  <Users className="h-4 w-4" /> <span>Executive Officers ({team.length})</span>
                </button>
                <button
                  onClick={() => { setActiveTab('gallery'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors text-left cursor-pointer ${activeTab === 'gallery' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold' : 'hover:bg-slate-800/80'}`}
                >
                  <ImageIcon className="h-4 w-4" /> <span>Corporate Gallery ({gallery.length})</span>
                </button>
                <button
                  onClick={() => { setActiveTab('careers'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors text-left cursor-pointer ${activeTab === 'careers' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold' : 'hover:bg-slate-800/80'}`}
                >
                  <Briefcase className="h-4 w-4" /> <span>Vacancies ({careers.length})</span>
                </button>
              </div>
            </div>

            {/* System & Audit */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">System & Governance</p>
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveTab('settings'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors text-left cursor-pointer ${activeTab === 'settings' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold' : 'hover:bg-slate-800/80'}`}
                >
                  <Database className="h-4 w-4" /> <span>SEO & Global Settings</span>
                </button>
                <button
                  onClick={() => { setActiveTab('logs'); setIsMobileSidebarOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-none transition-colors text-left cursor-pointer ${activeTab === 'logs' ? 'bg-[#C5A02E] text-[#0A1D37] font-bold' : 'hover:bg-slate-800/80'}`}
                >
                  <ShieldAlert className="h-4 w-4" /> <span>System Audit Logs ({logs.length})</span>
                </button>
              </div>
            </div>

          </nav>

          {/* Quick Export Footer */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/60">
            <button
              onClick={() => handleExportCSV('consultations')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-none border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#C5A02E]" /> Export Bookings CSV
            </button>
          </div>
        </aside>

        {/* --- MAIN CONTENT CANVAS --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F4F7F9] dark:bg-slate-950 text-[#0A1D37] dark:text-slate-100">
          
          {/* TAB 1: EXECUTIVE DASHBOARD OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              
              {/* 10 Executive Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-gray-500 dark:text-slate-400">Total Consultations</span>
                    <Calendar className="h-4 w-4 text-[#C5A02E]" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#0A1D37] dark:text-white">{metrics.totalConsultations}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Booked briefings</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-amber-600 dark:text-amber-400">Pending Review</span>
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{metrics.pendingConsultations}</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Requires partner action</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Approved / Active</span>
                    <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{metrics.approvedConsultations}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Scheduled or under review</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Completed Briefs</span>
                    <UserCheck className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{metrics.completedConsultations}</p>
                  <p className="text-[10px] text-emerald-600 mt-1">Concluded advisory</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-rose-600 dark:text-rose-400">Cancelled / Declined</span>
                    <XCircle className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{metrics.cancelledConsultations}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Closed without session</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-gray-500 dark:text-slate-400">New Form Submissions</span>
                    <FileText className="h-4 w-4 text-[#C5A02E]" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-[#0A1D37] dark:text-white">{metrics.totalEnquiries}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Inquiries & Applications</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-purple-600 dark:text-purple-400">Active Form Drafts</span>
                    <Clock3 className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">{metrics.activeDrafts}</p>
                  <p className="text-[10px] text-purple-600 mt-1">Clients currently typing</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-blue-600 dark:text-blue-400">Upcoming Schedule</span>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{metrics.upcomingConsultations}</p>
                  <p className="text-[10px] text-slate-500 mt-1">Future date bookings</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-4 shadow-sm hover:border-[#C5A02E] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase font-bold text-amber-600 dark:text-amber-400">Follow-Ups Due</span>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{metrics.pendingFollowups}</p>
                </div>

              </div>

              {/* Chronological Activity Heatmap Widget (D3/Recharts) */}
              <ActivityHeatmapWidget 
                consultations={consultations} 
                messages={messages} 
                drafts={drafts} 
              />

              {/* Data Visualization Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart 1: Consultation Status Distribution */}
                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#0A1D37] dark:text-white">
                      <PieChart className="h-4 w-4 text-[#C5A02E]" /> Consultation Status Distribution
                    </div>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                        <span>Pending Partner Approval</span>
                        <span className="font-mono font-bold text-amber-600">{metrics.pendingConsultations} ({consultations.length ? Math.round((metrics.pendingConsultations / consultations.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                        <div className="bg-amber-500 h-2" style={{ width: `${consultations.length ? (metrics.pendingConsultations / consultations.length) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                        <span>Approved & In Progress</span>
                        <span className="font-mono font-bold text-indigo-600">{metrics.approvedConsultations} ({consultations.length ? Math.round((metrics.approvedConsultations / consultations.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                        <div className="bg-indigo-600 h-2" style={{ width: `${consultations.length ? (metrics.approvedConsultations / consultations.length) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                        <span>Completed Advisory Sessions</span>
                        <span className="font-mono font-bold text-emerald-600">{metrics.completedConsultations} ({consultations.length ? Math.round((metrics.completedConsultations / consultations.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                        <div className="bg-emerald-500 h-2" style={{ width: `${consultations.length ? (metrics.completedConsultations / consultations.length) * 100 : 0}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                        <span>Cancelled / Archived</span>
                        <span className="font-mono font-bold text-rose-600">{metrics.cancelledConsultations} ({consultations.length ? Math.round((metrics.cancelledConsultations / consultations.length) * 100) : 0}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2">
                        <div className="bg-rose-500 h-2" style={{ width: `${consultations.length ? (metrics.cancelledConsultations / consultations.length) * 100 : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Chart 2: Lead CRM Funnel Progression */}
                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#0A1D37] dark:text-white">
                      <BarChart2 className="h-4 w-4 text-[#C5A02E]" /> CRM Client Pipeline Funnel
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs font-sans">
                    {['New Lead', 'Contacted', 'Consultation Scheduled', 'Consultation Completed', 'Converted'].map((st) => {
                      const count = users.filter(u => u.leadStatus === st).length;
                      const pct = users.length ? Math.round((count / users.length) * 100) : 0;
                      return (
                        <div key={st} className="bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200 dark:border-slate-700/80">
                          <div className="flex justify-between items-center text-[11px] font-semibold">
                            <span className="text-[#0A1D37] dark:text-slate-200">{st}</span>
                            <span className="font-mono text-[#C5A02E]">{count} clients ({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Action & Notifications Hub */}
                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-slate-800">
                      <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#0A1D37] dark:text-white">
                        <Bell className="h-4 w-4 text-[#C5A02E]" /> Priority Executive Alerts
                      </div>
                      <span className="text-[10px] bg-rose-500/20 text-rose-500 px-2 py-0.5 font-mono font-bold">{notifications.filter(n => !n.read).length} Unread</span>
                    </div>

                    <div className="space-y-2.5 max-h-48 overflow-y-auto font-sans text-xs">
                      {notifications.length === 0 ? (
                        <p className="text-gray-400 text-center py-6">No administrative alerts logged.</p>
                      ) : (
                        notifications.slice(0, 4).map(notif => (
                          <div key={notif.id} className={`p-2.5 border text-xs ${notif.read ? 'bg-slate-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 text-gray-500' : 'bg-amber-500/10 border-amber-500/30 text-[#0A1D37] dark:text-white font-semibold'}`}>
                            <div className="flex justify-between items-center text-[10px] text-[#C5A02E] mb-0.5">
                              <span className="uppercase font-bold">{notif.type.replace('_', ' ')}</span>
                              <span>{notif.timestamp.split('T')[0]}</span>
                            </div>
                            <p className="text-xs">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800 flex gap-2">
                    <button
                      onClick={() => setActiveTab('consultations')}
                      className="flex-1 py-2 bg-[#0A1D37] hover:bg-[#071426] text-white text-xs font-bold text-center border border-[#C5A02E]/30 cursor-pointer"
                    >
                      Manage Bookings
                    </button>
                    <button
                      onClick={() => setActiveTab('crm_users')}
                      className="flex-1 py-2 bg-[#C5A02E] hover:bg-[#A68625] text-white text-xs font-bold text-center cursor-pointer"
                    >
                      View CRM Clients
                    </button>
                  </div>
                </div>

              </div>

              {/* Recent Consultation Bookings Table */}
              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">Recent Consultation Briefings</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Latest corporate advisory briefing requests submitted by prospective clients.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('consultations')}
                    className="text-xs font-bold text-[#C5A02E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All ({consultations.length}) <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-700">
                        <th className="py-3 px-3">Client / Entity</th>
                        <th className="py-3 px-3">Advisory Specialization</th>
                        <th className="py-3 px-3">Target Date & Period</th>
                        <th className="py-3 px-3">Method</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {consultations.slice(0, 5).map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#0A1D37] dark:text-white">{item.fullName}</div>
                            <div className="text-[11px] text-gray-500 dark:text-slate-400">{item.company || 'Individual'} • {item.email}</div>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">{item.serviceNeeded}</td>
                          <td className="py-3 px-3">
                            <div className="font-mono text-slate-800 dark:text-slate-200">{item.preferredDate}</div>
                            <div className="text-[10px] text-slate-400 uppercase">{item.preferredTime}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-block text-[10px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                              {item.consultationMethod || 'virtual'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              item.status === 'pending' ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                              item.status === 'approved' ? 'bg-indigo-500/20 text-indigo-600 border border-indigo-500/30' :
                              item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' :
                              'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => { setSelectedConsultation(item); setActiveTab('consultations'); }}
                              className="px-2.5 py-1 bg-[#0A1D37] hover:bg-[#071426] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CONSULTATION BOOKING MANAGEMENT & CALENDAR */}
          {activeTab === 'consultations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Consultation Booking & Calendar Hub</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Review, approve, reschedule, assign, and manage all corporate briefing appointments.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5">
                    <button
                      onClick={() => setConsultationViewMode('list')}
                      className={`px-3 py-1 text-xs font-semibold cursor-pointer ${consultationViewMode === 'list' ? 'bg-[#0A1D37] text-white' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Table List
                    </button>
                    <button
                      onClick={() => setConsultationViewMode('calendar')}
                      className={`px-3 py-1 text-xs font-semibold cursor-pointer ${consultationViewMode === 'calendar' ? 'bg-[#0A1D37] text-white' : 'text-slate-600 dark:text-slate-400'}`}
                    >
                      Calendar Grid
                    </button>
                  </div>

                  <button
                    onClick={() => handleExportCSV('consultations')}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-xs font-semibold text-[#0A1D37] dark:text-white flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5 text-[#C5A02E]" /> Export
                  </button>
                </div>
              </div>

              {/* Status Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Status:</span>
                {['all', 'pending', 'approved', 'in_progress', 'completed', 'rescheduled', 'cancelled', 'archived'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                      statusFilter === st ? 'bg-[#0A1D37] text-[#C5A02E] border border-[#C5A02E]/40' : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* VIEW 1: TABLE LIST VIEW */}
              {consultationViewMode === 'list' && (
                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-sm p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-700">
                          <th className="py-3 px-3">Client Profile</th>
                          <th className="py-3 px-3">Service Specialization</th>
                          <th className="py-3 px-3">Scheduled Date</th>
                          <th className="py-3 px-3">Method</th>
                          <th className="py-3 px-3">Assigned Advisor</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {consultations
                          .filter(c => statusFilter === 'all' || c.status === statusFilter)
                          .map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3.5 px-3">
                                <div className="font-bold text-[#0A1D37] dark:text-white">{item.fullName}</div>
                                <div className="text-[11px] text-gray-500 dark:text-slate-400">{item.company || 'Individual Client'} • {item.email}</div>
                                {item.phone && <div className="text-[10px] text-slate-400 font-mono">{item.phone}</div>}
                              </td>
                              <td className="py-3.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{item.serviceNeeded}</td>
                              <td className="py-3.5 px-3 font-mono">
                                <div className="text-slate-900 dark:text-white font-bold">{item.preferredDate}</div>
                                <div className="text-[10px] text-slate-400 uppercase">{item.preferredTime}</div>
                              </td>
                              <td className="py-3.5 px-3">
                                <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono uppercase border border-slate-300 dark:border-slate-700">
                                  {item.consultationMethod || 'virtual'}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                                {item.assignedTo || 'Michael Howard'}
                              </td>
                              <td className="py-3.5 px-3">
                                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                  item.status === 'pending' ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30' :
                                  item.status === 'approved' ? 'bg-indigo-500/20 text-indigo-600 border border-indigo-500/30' :
                                  item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30' :
                                  item.status === 'rescheduled' ? 'bg-blue-500/20 text-blue-600 border border-blue-500/30' :
                                  'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-right space-x-1.5">
                                <button
                                  onClick={() => setSelectedConsultation(item)}
                                  className="px-2.5 py-1 bg-[#0A1D37] hover:bg-[#071426] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => handleDeleteConsultation(item.id)}
                                  className="p-1 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/30 cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 2: INTERACTIVE CALENDAR GRID */}
              {consultationViewMode === 'calendar' && (
                <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200 dark:border-slate-800">
                    <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white">Consultation Calendar Schedule (Interactive)</h3>
                    <span className="text-xs font-mono text-slate-500">Upcoming Appointments</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2 text-center font-sans text-xs">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="p-2 bg-slate-100 dark:bg-slate-800 font-bold uppercase text-[10px] text-slate-500">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 35 }).map((_, idx) => {
                      const dayNum = (idx % 31) + 1;
                      const dateStr = `2026-11-${dayNum < 10 ? '0' + dayNum : dayNum}`;
                      const dayBookings = consultations.filter(c => c.preferredDate === dateStr);
                      return (
                        <div key={idx} className="min-h-24 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2 text-left space-y-1">
                          <span className="font-mono text-[10px] font-bold text-slate-400">{dayNum}</span>
                          {dayBookings.map(b => (
                            <button
                              key={b.id}
                              onClick={() => setSelectedConsultation(b)}
                              className="w-full text-left p-1 bg-[#0A1D37] text-white text-[9px] truncate border-l-2 border-[#C5A02E] block hover:opacity-90 cursor-pointer"
                            >
                              {b.fullName.split(' ')[0]} - {b.serviceNeeded.substring(0, 10)}...
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: CLIENT CRM DIRECTORY */}
          {activeTab === 'crm_users' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Centralized Client CRM Directory</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Manage client profiles, lead statuses, communication logs, and consultation activity histories.</p>
                </div>

                <button
                  onClick={() => handleExportCSV('users')}
                  className="px-3.5 py-2 bg-[#0A1D37] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="h-4 w-4 text-[#C5A02E]" /> Export CRM Database
                </button>
              </div>

              {/* CRM Lead Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-sans">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Lead Filter:</span>
                {['all', 'New Lead', 'Contacted', 'Awaiting Response', 'Consultation Scheduled', 'Consultation Completed', 'Converted', 'Closed'].map(st => (
                  <button
                    key={st}
                    onClick={() => setLeadFilter(st)}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                      leadFilter === st ? 'bg-[#0A1D37] text-[#C5A02E] border border-[#C5A02E]/40' : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Users CRM Table */}
              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-sm p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-700">
                        <th className="py-3 px-3">Client Identity</th>
                        <th className="py-3 px-3">Corporation / Entity</th>
                        <th className="py-3 px-3">Lead Status</th>
                        <th className="py-3 px-3">Assigned Officer</th>
                        <th className="py-3 px-3">History</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {users
                        .filter(u => leadFilter === 'all' || u.leadStatus === leadFilter)
                        .map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-[#0A1D37] dark:text-white flex items-center gap-1.5">
                                <User className="h-3.5 w-3.5 text-[#C5A02E]" /> {u.fullName}
                              </div>
                              <div className="text-[11px] text-gray-500 dark:text-slate-400">{u.email} • {u.phone || 'No phone'}</div>
                            </td>
                            <td className="py-3.5 px-3 font-medium text-slate-700 dark:text-slate-300">
                              {u.company || 'Individual Client'}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-[#0A1D37] dark:text-white border border-slate-300 dark:border-slate-700">
                                {u.leadStatus}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-[#0A1D37] dark:text-slate-300 text-[11px]">
                              {u.assignedAdmin || 'Michael Howard'}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="text-[11px] font-mono text-slate-500">
                                {u.consultationCount || 0} Briefings | {u.totalSubmissions || 0} Submissions
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right space-x-1.5">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="px-2.5 py-1 bg-[#0A1D37] hover:bg-[#071426] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                View CRM Profile
                              </button>
                              <button
                                onClick={() => { setEmailRecipient({ email: u.email, name: u.fullName }); setIsEmailModalOpen(true); }}
                                className="p-1 bg-[#C5A02E] text-white hover:bg-[#A68625] cursor-pointer"
                                title="Send Email"
                              >
                                <Mail className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CONSULTATION DRAFTS & INCOMPLETE FORMS */}
          {activeTab === 'drafts' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="pb-4 border-b border-gray-300 dark:border-slate-800">
                <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Consultation Drafts & Progress Monitor</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Track prospective clients who started completing consultation briefing forms but have not yet finalized submission.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-sm p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-gray-200 dark:border-slate-700">
                        <th className="py-3 px-3">Visitor Name / Email</th>
                        <th className="py-3 px-3">Specialization Selected</th>
                        <th className="py-3 px-3">Completed Fields</th>
                        <th className="py-3 px-3">Last Active</th>
                        <th className="py-3 px-3">Draft Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                      {drafts.length === 0 ? (
                        <tr><td colSpan={6} className="py-8 text-center text-gray-400">No active consultation drafts in progress.</td></tr>
                      ) : (
                        drafts.map(d => (
                          <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="py-3.5 px-3">
                              <div className="font-bold text-[#0A1D37] dark:text-white">{d.fullName}</div>
                              <div className="text-[11px] text-gray-500 font-mono">{d.email}</div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold">{d.serviceNeeded}</td>
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[#C5A02E]">{d.completedFieldsCount || 4} / 8</span>
                                <div className="w-20 bg-gray-200 dark:bg-slate-800 h-1.5">
                                  <div className="bg-[#C5A02E] h-1.5" style={{ width: `${((d.completedFieldsCount || 4)/8)*100}%` }}></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                              {d.lastTouchedAt?.split('T')[0]}
                            </td>
                            <td className="py-3.5 px-3">
                              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-600 font-bold text-[10px] uppercase">
                                {d.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <button
                                onClick={() => { setEmailRecipient({ email: d.email, name: d.fullName }); setIsEmailModalOpen(true); }}
                                className="px-2.5 py-1 bg-[#0A1D37] hover:bg-[#071426] text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Send Reminder Email
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CENTRALIZED SUBMISSIONS CENTER */}
          {activeTab === 'submissions' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Centralized Submissions & Inquiries</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">All contact messages, consultation briefs, and recruitment applications in one location.</p>
                </div>
              </div>

              {/* Submissions Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-sans">
                {['all', 'messages', 'applications', 'subscribers'].map(t => (
                  <button
                    key={t}
                    onClick={() => setSubmissionFilter(t)}
                    className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider cursor-pointer ${
                      submissionFilter === t ? 'bg-[#0A1D37] text-[#C5A02E] border border-[#C5A02E]/40' : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Contact Messages Column */}
                {(submissionFilter === 'all' || submissionFilter === 'messages') && (
                  <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white mb-3 pb-2 border-b">
                      Contact Inquiries ({messages.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto font-sans text-xs">
                      {messages.map(m => (
                        <div key={m.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                          <div className="flex justify-between text-[10px] text-[#C5A02E] font-bold">
                            <span>{m.fullName}</span>
                            <span>{m.createdAt.split('T')[0]}</span>
                          </div>
                          <p className="font-bold text-[#0A1D37] dark:text-white mt-1">{m.subject}</p>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 line-clamp-2">{m.message}</p>
                          <div className="mt-2 text-right">
                            <button
                              onClick={() => setSelectedSubmission({ type: 'message', data: m })}
                              className="px-2 py-0.5 bg-[#0A1D37] text-white text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Read Full
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Applications Column */}
                {(submissionFilter === 'all' || submissionFilter === 'applications') && (
                  <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white mb-3 pb-2 border-b">
                      Recruitment Applications ({applications.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto font-sans text-xs">
                      {applications.map(a => (
                        <div key={a.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                          <div className="flex justify-between text-[10px] text-[#C5A02E] font-bold">
                            <span>{a.fullName}</span>
                            <span>{a.createdAt.split('T')[0]}</span>
                          </div>
                          <p className="font-bold text-[#0A1D37] dark:text-white mt-1">Position: {a.jobTitle}</p>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">Resume: {a.resumeUrl}</p>
                          <div className="mt-2 text-right">
                            <button
                              onClick={() => setSelectedSubmission({ type: 'application', data: a })}
                              className="px-2 py-0.5 bg-[#0A1D37] text-white text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Inspect Record
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Newsletter Subscribers Column */}
                {(submissionFilter === 'all' || submissionFilter === 'subscribers') && (
                  <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm">
                    <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white mb-3 pb-2 border-b">
                      Newsletter Subscribers ({subscribers.length})
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto font-sans text-xs">
                      {subscribers.length === 0 ? (
                        <p className="text-gray-400 text-center py-6">No newsletter subscribers registered yet.</p>
                      ) : (
                        subscribers.map(s => (
                          <div key={s.id || s.email} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-[#0A1D37] dark:text-white font-mono">{s.email}</p>
                              <span className="text-[10px] text-gray-500 dark:text-slate-400">Subscribed: {s.createdAt ? s.createdAt.split('T')[0] : 'Recent'}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">
                              Active
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 6: EMAIL DISPATCHER & COMMUNICATIONS */}
          {activeTab === 'communications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Corporate Communication Center</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Transmit official executive correspondence, appointment notices, and follow-up emails directly to clients.</p>
                </div>

                <button
                  onClick={() => { setEmailRecipient({ email: '', name: '' }); setIsEmailModalOpen(true); }}
                  className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="h-4 w-4 text-[#C5A02E]" /> Compose Email Notice
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-sm p-6">
                <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white mb-4 pb-2 border-b">Communication History Log</h3>
                
                <div className="space-y-3 font-sans text-xs">
                  {communications.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No outward corporate emails logged yet.</p>
                  ) : (
                    communications.map(c => (
                      <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-[#C5A02E] font-bold">
                          <span>TO: {c.userName} ({c.userEmail})</span>
                          <span>{c.sentAt.split('T')[0]}</span>
                        </div>
                        <p className="font-bold text-[#0A1D37] dark:text-white text-xs">Subject: {c.subject}</p>
                        <p className="text-slate-600 dark:text-slate-300 text-xs whitespace-pre-wrap">{c.message}</p>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800 mt-2">
                          Template: {c.templateUsed} | Sender: {c.senderAdmin}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FOLLOW-UP SCHEDULER */}
          {activeTab === 'followups' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Follow-Up Task Scheduler</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Schedule administrative reminders to contact clients after consultation briefings.</p>
                </div>

                <button
                  onClick={() => setIsFollowupModalOpen(true)}
                  className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4 text-[#C5A02E]" /> Schedule Follow-Up
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-sm p-6">
                <div className="space-y-3 font-sans text-xs">
                  {followups.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No scheduled follow-up tasks.</p>
                  ) : (
                    followups.map(f => (
                      <div key={f.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] text-[#C5A02E] font-bold">
                            <Clock className="h-3.5 w-3.5" /> Due Date: {f.scheduledDate} at {f.scheduledTime}
                          </div>
                          <p className="font-bold text-[#0A1D37] dark:text-white text-sm mt-1">{f.userName} ({f.userEmail})</p>
                          <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">{f.note}</p>
                        </div>

                        <div>
                          {f.status === 'completed' ? (
                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-600 font-bold text-[10px] uppercase">Completed</span>
                          ) : (
                            <button
                              onClick={() => handleMarkFollowupDone(f.id)}
                              className="px-3 py-1.5 bg-[#0A1D37] hover:bg-[#071426] text-white text-[10px] font-bold uppercase cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: LIVE SUPPORT CHAT INBOX */}
          {activeTab === 'support_chat' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <SupportInbox />
            </div>
          )}

          {/* TAB 9: WEBSITE CONTENT & FAQS */}
          {activeTab === 'content' && settings && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="pb-4 border-b border-gray-300 dark:border-slate-800">
                <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Website Content & FAQ Management</h2>
                <p className="text-xs text-gray-500 dark:text-slate-400">Configure corporate messaging, hero headlines, about copy, and categorized FAQs.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white">Hero Section Copy</h3>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Hero Headline</label>
                  <input
                    type="text"
                    value={settings.content?.heroHeadline || ''}
                    onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroHeadline: e.target.value } })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={settings.content?.heroSubheadline || ''}
                    onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroSubheadline: e.target.value } })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white mt-1"
                  />
                </div>

                <button
                  onClick={async () => {
                    await fetch('/api/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(settings)
                    });
                    toastSuccess('Website parameters updated.', 'Saved');
                  }}
                  className="px-4 py-2 bg-[#0A1D37] text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Save Content Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 10: BLOGS */}
          {activeTab === 'blogs' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b">
                <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Market Insights & Blog Editor</h2>
                <button
                  onClick={() => { setIsBlogFormOpen(true); setBlogFormData({ id: '', title: '', category: 'Market Insights', shortDesc: '', content: '', image: '', author: 'Howard Homes Advisory', readTime: '5 min read' }); }}
                  className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-bold uppercase cursor-pointer"
                >
                  + New Publication
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogs.map(b => (
                  <div key={b.id} className="bg-white dark:bg-slate-900 border p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#C5A02E] uppercase">{b.category}</span>
                      <h4 className="font-bold text-[#0A1D37] dark:text-white text-sm mt-1">{b.title}</h4>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2">{b.shortDesc}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t flex justify-between items-center text-xs">
                      <span className="text-slate-400">{b.date}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => { setBlogFormData(b as any); setIsBlogFormOpen(true); }}
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(b.id)}
                          className="text-rose-600 font-bold hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: EXECUTIVE OFFICERS */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Executive Officers & Personnel</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Manage the corporate leadership profiles displayed on the Executive Advisory page.</p>
                </div>
                <button
                  onClick={() => {
                    setTeamFormData({ id: '', name: '', position: '', bio: '', image: '', linkedin: '', email: '' });
                    setIsTeamFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4 text-[#C5A02E]" /> Register Personnel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-800">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No executive profiles registered.</p>
                  </div>
                ) : (
                  team.map(member => (
                    <div key={member.id} className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 overflow-hidden flex flex-col">
                      <div className="aspect-square bg-gray-100 dark:bg-slate-800 relative group">
                        {member.image ? (
                          <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <User className="h-16 w-16" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#0A1D37]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            onClick={() => { setTeamFormData(member); setIsTeamFormOpen(true); }}
                            className="p-2 bg-white text-[#0A1D37] hover:text-[#C5A02E] transition-colors"
                            title="Edit Profile"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(member.id)}
                            className="p-2 bg-white text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Remove Profile"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <h4 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">{member.name}</h4>
                        <p className="text-[11px] font-bold text-[#C5A02E] uppercase tracking-wider mb-2">{member.position}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">{member.bio}</p>
                      </div>
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-mono">ID: {member.id.substring(0, 8)}</span>
                        <div className="flex gap-2">
                          {member.linkedin && <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />}
                          {member.email && <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 14: CORPORATE GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Corporate Gallery & Visual Assets</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Curate the visual portfolio of corporate offices, advisory sessions, and premium property assets.</p>
                </div>
                <button
                  onClick={() => {
                    setGalleryFormData({ title: '', category: 'Office', image: '' });
                    setIsGalleryFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4 text-[#C5A02E]" /> Upload Asset
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.length === 0 ? (
                  <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-800">
                    <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No gallery assets available.</p>
                  </div>
                ) : (
                  gallery.map(item => (
                    <div key={item.id} className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 group overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1D37] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-[10px] font-bold text-[#C5A02E] uppercase">{item.category}</p>
                        <p className="text-xs font-bold text-white mb-2">{item.title}</p>
                        <button
                          onClick={() => handleDeleteGallery(item.id)}
                          className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold uppercase tracking-tighter transition-colors"
                        >
                          Remove Asset
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 15: VACANCIES & RECRUITMENT */}
          {activeTab === 'careers' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-4 border-b border-gray-300 dark:border-slate-800">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Vacancies & Recruitment</h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Post and manage career opportunities within Howard Homes Advisory & Investment Hub.</p>
                </div>
                <button
                  onClick={() => {
                    setCareerFormData({ id: '', title: '', department: 'Investment Advisory', location: 'San Francisco, CA', type: 'Full-time', description: '', requirements: '' });
                    setIsCareerFormOpen(true);
                  }}
                  className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="h-4 w-4 text-[#C5A02E]" /> Post New Vacancy
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold text-[#0A1D37] dark:text-slate-300 uppercase tracking-wider">Position Title</th>
                      <th className="py-3 px-4 font-bold text-[#0A1D37] dark:text-slate-300 uppercase tracking-wider">Department</th>
                      <th className="py-3 px-4 font-bold text-[#0A1D37] dark:text-slate-300 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 font-bold text-[#0A1D37] dark:text-slate-300 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                    {careers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-gray-400">No active vacancies listed.</td>
                      </tr>
                    ) : (
                      careers.map(job => (
                        <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4">
                            <p className="font-bold text-[#0A1D37] dark:text-white">{job.title}</p>
                            <span className="text-[10px] px-1.5 py-0.5 bg-[#C5A02E]/20 text-[#C5A02E] font-bold uppercase mt-1 inline-block">{job.type}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{job.department}</td>
                          <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{job.location}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => { setCareerFormData(job); setIsCareerFormOpen(true); }}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCareer(job.id)}
                                className="p-2 text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}


          {/* TAB 11: SYSTEM LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="pb-4 border-b">
                <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">System Security & Audit Trail</h2>
                <p className="text-xs text-gray-500">Comprehensive audit records of all administrative actions and security events.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 border p-6 font-mono text-xs">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {logs.map(l => (
                    <div key={l.id} className="p-2 bg-slate-50 dark:bg-slate-800/50 border-b text-[11px]">
                      <span className="text-slate-400 mr-3">[{l.timestamp.replace('T', ' ').substring(0, 19)}]</span>
                      <span className="font-bold text-[#C5A02E] mr-3">{l.action}:</span>
                      <span className="text-slate-700 dark:text-slate-200">{l.details}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 12: SEO & SETTINGS */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="pb-4 border-b">
                <h2 className="font-serif font-bold text-2xl text-[#0A1D37] dark:text-white">Global SEO & Corporate Parameters</h2>
              </div>

              <div className="bg-white dark:bg-slate-900 border p-6 space-y-4 text-xs font-sans">
                <div>
                  <label className="font-bold uppercase text-[10px] text-gray-500">Company Legal Name</label>
                  <input
                    type="text"
                    value={settings.general.companyName}
                    onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })}
                    className="w-full border p-2 mt-1 bg-slate-50 dark:bg-slate-800 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div>
                  <label className="font-bold uppercase text-[10px] text-gray-500">SEO Meta Title</label>
                  <input
                    type="text"
                    value={settings.seo.metaTitle}
                    onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
                    className="w-full border p-2 mt-1 bg-slate-50 dark:bg-slate-800 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                      body: JSON.stringify(settings)
                    });
                    toastSuccess('SEO & Corporate Settings updated.', 'Saved');
                  }}
                  className="px-4 py-2 bg-[#0A1D37] text-white font-bold text-xs uppercase cursor-pointer"
                >
                  Save Global Parameters
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- MODAL 1: CONSULTATION / RENTAL APPLICATION DETAIL & EXPORT DRAWER --- */}
      {selectedConsultation && (() => {
        const extractAttachmentUrl = (text: string, key: string) => {
          if (!text) return null;
          const match = text.match(new RegExp(`\\[${key}:\\s*(.*?)\\]`));
          if (match && match[1] && match[1].startsWith('data:image')) {
            return match[1];
          }
          return null;
        };

        const idFrontUrl = extractAttachmentUrl(selectedConsultation.message, 'ATTACHMENT_ID_FRONT');
        const idBackUrl = extractAttachmentUrl(selectedConsultation.message, 'ATTACHMENT_ID_BACK');
        const incomeUrl = extractAttachmentUrl(selectedConsultation.message, 'ATTACHMENT_INCOME');

        return (
          <div className="fixed inset-0 z-50 bg-[#0A1D37]/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 font-sans text-xs animate-in zoom-in-95 duration-200 print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0">
              
              {/* Structured Print Header (Visible strictly when printing) */}
              <PrintHeader 
                title={selectedConsultation.serviceNeeded === 'Residential Rental Application' || selectedConsultation.message?.includes('OFFICIAL RESIDENTIAL RENTAL APPLICATION')
                  ? "Official Residential Rental Housing Application Record"
                  : "Client Real Estate Advisory & Consultation Record"
                }
                subtitle={`Client / Applicant: ${selectedConsultation.fullName} • Entity: ${selectedConsultation.company || 'Individual'}`}
                referenceNumber={selectedConsultation.refNumber || selectedConsultation.id}
                documentType="Administrative Property Record"
              />

              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#C5A02E] font-mono">Record ID: {selectedConsultation.refNumber || selectedConsultation.id}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                      Status: {selectedConsultation.status}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">
                    {selectedConsultation.serviceNeeded === 'Residential Rental Application' || selectedConsultation.message?.includes('OFFICIAL RESIDENTIAL RENTAL APPLICATION')
                      ? 'Official Housing Application Record & Client Form Data'
                      : 'Client Consultation Briefing Record'
                    }
                  </h3>
                </div>
                <div className="no-print flex items-center gap-2">
                <button
                    onClick={(e) => {
                      setIsPrintingRecord(true);
                      handleImmediatePrint(e, () => setIsPrintingRecord(false));
                      setTimeout(() => setIsPrintingRecord(false), 1500);
                    }}
                    disabled={isPrintingRecord}
                    className="px-3 py-1.5 bg-[#0A1D37] hover:bg-slate-800 active:scale-[0.98] text-[#C5A02E] font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-sm border border-[#C5A02E]/30 disabled:opacity-80"
                    title="Print Application Status (Instant PDF)"
                  >
                    {isPrintingRecord ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Opening Print...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="h-3.5 w-3.5" />
                        <span>Print Application Status</span>
                      </>
                    )}
                  </button>
                  <button onClick={() => setSelectedConsultation(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Main Fields Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 border text-xs">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Applicant / Client Name</p>
                  <p className="font-bold text-[#0A1D37] dark:text-white">{selectedConsultation.fullName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Company / Entity</p>
                  <p className="font-bold text-[#0A1D37] dark:text-white">{selectedConsultation.company || 'Individual Applicant'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Email Address</p>
                  <p className="font-mono text-slate-800 dark:text-slate-200">{selectedConsultation.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Contact Phone</p>
                  <p className="font-mono text-slate-800 dark:text-slate-200">{selectedConsultation.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Service Category</p>
                  <p className="font-bold text-[#C5A02E]">{selectedConsultation.serviceNeeded}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Submission Date</p>
                  <p className="font-mono">{selectedConsultation.preferredDate} ({selectedConsultation.preferredTime || '10:00 AM'})</p>
                </div>
              </div>

              {/* Complete Client Submitted Form Data Preview */}
              {selectedConsultation.message && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Client Form Field Transmittal Record</p>
                    <span className="text-[10px] text-[#C5A02E] font-semibold">Complete Unabridged Client Form Fields</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 border text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {selectedConsultation.message}
                  </div>
                </div>
              )}

              {/* Uploaded Document Attachments & Image Verification Gallery */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border space-y-3">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
                  <p className="text-[10px] text-[#C5A02E] uppercase font-bold tracking-wider">
                    Uploaded Document Attachments & Image Verification Gallery
                  </p>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 256-Bit Encrypted Files Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Driver's License Front */}
                  <div className="p-3 bg-white dark:bg-slate-900 border space-y-2 text-center">
                    <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                      Driver's License (Front Side)
                    </div>
                    {idFrontUrl ? (
                      <img
                        src={idFrontUrl}
                        alt="Driver License Front Side"
                        className="w-full h-28 object-cover border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(idFrontUrl, '_blank')}
                      />
                    ) : (
                      <div className="h-28 bg-slate-100 dark:bg-slate-800 border-2 border-dashed flex flex-col items-center justify-center p-2 text-center text-slate-500">
                        <Paperclip className="h-6 w-6 text-[#C5A02E] mb-1" />
                        <span className="text-[10px] font-bold">Front ID Image Attached</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">Supporting File #1</span>
                      </div>
                    )}
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">
                      ID Front Verified
                    </span>
                  </div>

                  {/* Driver's License Back */}
                  <div className="p-3 bg-white dark:bg-slate-900 border space-y-2 text-center">
                    <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                      Driver's License (Back Side)
                    </div>
                    {idBackUrl ? (
                      <img
                        src={idBackUrl}
                        alt="Driver License Back Side"
                        className="w-full h-28 object-cover border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(idBackUrl, '_blank')}
                      />
                    ) : (
                      <div className="h-28 bg-slate-100 dark:bg-slate-800 border-2 border-dashed flex flex-col items-center justify-center p-2 text-center text-slate-500">
                        <Paperclip className="h-6 w-6 text-[#C5A02E] mb-1" />
                        <span className="text-[10px] font-bold">Back ID Image Attached</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">Supporting File #2</span>
                      </div>
                    )}
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">
                      ID Back Verified
                    </span>
                  </div>

                  {/* Proof of Income (Paystubs) */}
                  <div className="p-3 bg-white dark:bg-slate-900 border space-y-2 text-center">
                    <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase">
                      Proof of Income (Paystubs)
                    </div>
                    {incomeUrl ? (
                      <img
                        src={incomeUrl}
                        alt="Paystub Document"
                        className="w-full h-28 object-cover border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(incomeUrl, '_blank')}
                      />
                    ) : (
                      <div className="h-28 bg-slate-100 dark:bg-slate-800 border-2 border-dashed flex flex-col items-center justify-center p-2 text-center text-slate-500">
                        <FileText className="h-6 w-6 text-[#C5A02E] mb-1" />
                        <span className="text-[10px] font-bold">Paystub Doc Attached</span>
                        <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">Supporting File #3</span>
                      </div>
                    )}
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase">
                      Income Doc Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions & Status Changes */}
              <div className="space-y-3 pt-3 border-t">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Update Administrative Record Status</label>
                <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleUpdateConsultation(selectedConsultation.id, { status: 'approved' })}
                    className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => handleUpdateConsultation(selectedConsultation.id, { status: 'completed' })}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => handleUpdateConsultation(selectedConsultation.id, { status: 'rescheduled' })}
                    className="py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                  >
                    Request Information
                  </button>
                  <button
                    onClick={() => handleUpdateConsultation(selectedConsultation.id, { status: 'cancelled' })}
                    className="py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] uppercase cursor-pointer"
                  >
                    Decline / Reject
                  </button>
                </div>
              </div>

              {/* Structured Print Footer (Visible strictly when printing) */}
              <PrintFooter />

            </div>
          </div>
        );
      })()}

      {/* --- MODAL 1B: SELECTED SUBMISSION DETAIL & EXPORT MODAL --- */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-[#0A1D37]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 font-sans text-xs animate-in zoom-in-95 duration-200 print:max-h-none print:overflow-visible print:border-none print:shadow-none print:p-0">
            
            {/* Structured Print Header (Visible strictly when printing) */}
            <PrintHeader 
              title={selectedSubmission.type === 'message' ? "Client Contact Inquiry Record" : "Recruitment Candidate Record"}
              subtitle={`Submitter: ${selectedSubmission.data.fullName} • Record ID: ${selectedSubmission.data.id || 'N/A'}`}
              referenceNumber={selectedSubmission.data.id}
              documentType="Administrative Corporate Record"
            />

            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C5A02E]">Submission Category: {selectedSubmission.type.toUpperCase()}</span>
                <h3 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">
                  {selectedSubmission.type === 'message' ? 'Contact Inquiry Record' : 'Recruitment Application Record'}
                </h3>
              </div>
              <div className="no-print flex items-center gap-2">
                <button
                  onClick={(e) => {
                    setIsPrintingRecord(true);
                    handleImmediatePrint(e, () => setIsPrintingRecord(false));
                    setTimeout(() => setIsPrintingRecord(false), 1500);
                  }}
                  disabled={isPrintingRecord}
                  className="px-3 py-1.5 bg-[#0A1D37] hover:bg-slate-800 active:scale-[0.98] text-[#C5A02E] font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer border border-[#C5A02E]/30 disabled:opacity-80"
                  title="Print Application Status (Instant PDF)"
                >
                  {isPrintingRecord ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Opening Print...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print Application Status</span>
                    </>
                  )}
                </button>
                <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 border">
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Submitter Name</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedSubmission.data.fullName}</p>
              </div>
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Email / Contact</span>
                <p className="font-mono text-slate-800 dark:text-slate-200">{selectedSubmission.data.email} | {selectedSubmission.data.phone || 'N/A'}</p>
              </div>
              {selectedSubmission.data.subject && (
                <div>
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Subject</span>
                  <p className="font-bold text-[#C5A02E]">{selectedSubmission.data.subject}</p>
                </div>
              )}
              {selectedSubmission.data.jobTitle && (
                <div>
                  <span className="text-gray-500 uppercase font-bold text-[10px] block">Target Position</span>
                  <p className="font-bold text-[#C5A02E]">{selectedSubmission.data.jobTitle}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500 uppercase font-bold text-[10px] block">Full Message Body / Submitted Details</span>
                <p className="p-3 bg-white dark:bg-slate-900 border text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {selectedSubmission.data.message || selectedSubmission.data.coverLetter || 'No additional notes.'}
                </p>
              </div>
            </div>

            {/* Structured Print Footer (Visible strictly when printing) */}
            <PrintFooter />

          </div>
        </div>
      )}

      {/* --- MODAL 2: CRM USER PROFILE MODAL --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-[#0A1D37]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 font-sans text-xs animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#C5A02E]">Client Profile Record</span>
                <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">{selectedUser.fullName}</h3>
                <p className="text-gray-500 text-xs">{selectedUser.email} • Registered {selectedUser.registrationDate?.split('T')[0]}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 border space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">CRM Lead Status</label>
                  <select
                    value={selectedUser.leadStatus}
                    onChange={(e) => handleUpdateUser(selectedUser.id, { leadStatus: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border p-2 text-xs font-bold text-[#0A1D37] dark:text-white cursor-pointer"
                  >
                    {['New Lead', 'Contacted', 'Awaiting Response', 'Consultation Scheduled', 'Consultation Completed', 'Converted', 'Closed'].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Assigned Partner</label>
                  <input
                    type="text"
                    value={selectedUser.assignedAdmin || ''}
                    onChange={(e) => handleUpdateUser(selectedUser.id, { assignedAdmin: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                  />
                </div>

                <button
                  onClick={() => { setEmailRecipient({ email: selectedUser.email, name: selectedUser.fullName }); setIsEmailModalOpen(true); }}
                  className="w-full py-2 bg-[#0A1D37] hover:bg-[#071426] text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5 text-[#C5A02E]" /> Dispatch Client Email
                </button>
              </div>

              <div className="md:col-span-2 space-y-3">
                <h4 className="font-serif font-bold text-sm text-[#0A1D37] dark:text-white pb-1 border-b">Client Activity Timeline & Briefing Records</h4>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedUser.consultations?.map((c: any) => (
                    <div key={c.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/50 border text-xs flex justify-between">
                      <div>
                        <span className="font-bold text-[#C5A02E]">{c.serviceNeeded}</span>
                        <p className="text-[10px] text-gray-500">Date: {c.preferredDate} ({c.preferredTime})</p>
                      </div>
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-600 font-bold text-[10px] uppercase h-fit">{c.status}</span>
                    </div>
                  ))}

                  {selectedUser.activities?.map((a: any) => (
                    <div key={a.id} className="p-2 border-b text-[11px]">
                      <span className="font-bold text-[#0A1D37] dark:text-white">{a.action}:</span> <span className="text-slate-600 dark:text-slate-300">{a.details}</span>
                      <span className="text-[9px] text-slate-400 block">{a.timestamp?.split('T')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: DIRECT EMAIL DISPATCHER MODAL --- */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A1D37]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 font-sans text-xs animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">Compose Corporate Email Correspondence</h3>
              <button onClick={() => setIsEmailModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Recipient Email</label>
                <input
                  type="email"
                  required
                  value={emailRecipient.email}
                  onChange={(e) => setEmailRecipient({ ...emailRecipient, email: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Email Subject</label>
                <input
                  type="text"
                  required
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="e.g. Howard Homes Advisory Consultation Confirmation"
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Message Body</label>
                <textarea
                  rows={5}
                  required
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  placeholder="Enter official briefing correspondence..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0A1D37] hover:bg-[#071426] text-white font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-4 w-4 text-[#C5A02E]" /> Transmit Email Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: FOLLOW-UP SCHEDULER MODAL --- */}
      {isFollowupModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A1D37]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 max-w-md w-full space-y-4 font-sans text-xs animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">Schedule Administrative Follow-Up</h3>
              <button onClick={() => setIsFollowupModalOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowup} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Client Email</label>
                <input
                  type="email"
                  required
                  value={followupForm.userEmail}
                  onChange={(e) => setFollowupForm({ ...followupForm, userEmail: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={followupForm.scheduledDate}
                  onChange={(e) => setFollowupForm({ ...followupForm, scheduledDate: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Follow-Up Note / Task Objective</label>
                <textarea
                  rows={3}
                  required
                  value={followupForm.note}
                  onChange={(e) => setFollowupForm({ ...followupForm, note: e.target.value })}
                  placeholder="Call client regarding RICS valuation underwriting progress..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0A1D37] hover:bg-[#071426] text-white font-bold text-xs uppercase cursor-pointer"
              >
                Schedule Follow-Up Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: BLOG FORM MODAL --- */}
      {isBlogFormOpen && (
        <div className="fixed inset-0 z-50 bg-[#0A1D37]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 p-6 max-w-xl w-full space-y-4 font-sans text-xs animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-[#0A1D37] dark:text-white">{blogFormData.id ? 'Edit Market Insight' : 'New Market Insight Article'}</h3>
              <button onClick={() => setIsBlogFormOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleBlogSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  value={blogFormData.title}
                  onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={blogFormData.category}
                  onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Short Description</label>
                <input
                  type="text"
                  value={blogFormData.shortDesc}
                  onChange={(e) => setBlogFormData({ ...blogFormData, shortDesc: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Article Content</label>
                <textarea
                  rows={6}
                  required
                  value={blogFormData.content}
                  onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border p-2 text-xs text-[#0A1D37] dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0A1D37] hover:bg-[#071426] text-white font-bold text-xs uppercase cursor-pointer"
              >
                Publish Market Insight
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: TEAM MEMBER FORM */}
      {isTeamFormOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0A1D37]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C5A02E]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">
                {teamFormData.id ? 'Modify Personnel Profile' : 'Register New Executive Officer'}
              </h3>
              <button onClick={() => setIsTeamFormOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleTeamSubmit} className="p-6 space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={teamFormData.name}
                    onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Corporate Position</label>
                  <input
                    type="text"
                    required
                    value={teamFormData.position}
                    onChange={(e) => setTeamFormData({ ...teamFormData, position: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Email Address</label>
                  <input
                    type="email"
                    value={teamFormData.email}
                    onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">LinkedIn URL</label>
                  <input
                    type="text"
                    value={teamFormData.linkedin}
                    onChange={(e) => setTeamFormData({ ...teamFormData, linkedin: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Profile Image URL</label>
                  <input
                    type="text"
                    required
                    value={teamFormData.image}
                    onChange={(e) => setTeamFormData({ ...teamFormData, image: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Professional Biography</label>
                  <textarea
                    required
                    rows={4}
                    value={teamFormData.bio}
                    onChange={(e) => setTeamFormData({ ...teamFormData, bio: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTeamFormOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold uppercase tracking-widest hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A1D37] text-white font-bold uppercase tracking-widest border border-[#C5A02E]/40 shadow-lg"
                >
                  {teamFormData.id ? 'Save Personnel Profile' : 'Authorize & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: GALLERY ASSET FORM */}
      {isGalleryFormOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0A1D37]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C5A02E]/30 w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">Register Visual Asset</h3>
              <button onClick={() => setIsGalleryFormOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleGallerySubmit} className="p-6 space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Asset Title</label>
                <input
                  type="text"
                  required
                  value={galleryFormData.title}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                  className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Category Classification</label>
                <select
                  required
                  value={galleryFormData.category}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, category: e.target.value as any })}
                  className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                >
                  <option value="Office">Corporate Headquarters</option>
                  <option value="Meetings">Executive Sessions</option>
                  <option value="Projects">Asset Portfolio</option>
                  <option value="Corporate Events">Corporate Events</option>
                  <option value="Site Visits">Site Visits</option>
                  <option value="Team Activities">Team Activities</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Image URL / Source</label>
                <input
                  type="text"
                  required
                  value={galleryFormData.image}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, image: e.target.value })}
                  className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsGalleryFormOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A1D37] text-white font-bold uppercase tracking-widest border border-[#C5A02E]/40 shadow-lg"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: CAREER VACANCY FORM */}
      {isCareerFormOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0A1D37]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#C5A02E]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-serif font-bold text-xl text-[#0A1D37] dark:text-white">
                {careerFormData.id ? 'Modify Vacancy Details' : 'Broadcast New Career Opportunity'}
              </h3>
              <button onClick={() => setIsCareerFormOpen(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCareerSubmit} className="p-6 space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Position Title</label>
                  <input
                    type="text"
                    required
                    value={careerFormData.title}
                    onChange={(e) => setCareerFormData({ ...careerFormData, title: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Department</label>
                  <select
                    required
                    value={careerFormData.department}
                    onChange={(e) => setCareerFormData({ ...careerFormData, department: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  >
                    <option value="Investment Advisory">Investment Advisory</option>
                    <option value="Property Management">Property Management</option>
                    <option value="Executive Operations">Executive Operations</option>
                    <option value="Corporate Finance">Corporate Finance</option>
                    <option value="Strategic Development">Strategic Development</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Geographic Location</label>
                  <input
                    type="text"
                    required
                    value={careerFormData.location}
                    onChange={(e) => setCareerFormData({ ...careerFormData, location: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Employment Type</label>
                  <select
                    required
                    value={careerFormData.type}
                    onChange={(e) => setCareerFormData({ ...careerFormData, type: e.target.value as any })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  >
                    <option value="Full-time">Full-time Engagement</option>
                    <option value="Part-time">Part-time Engagement</option>
                    <option value="Internship">Executive Internship</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Position Description</label>
                  <textarea
                    required
                    rows={4}
                    value={careerFormData.description}
                    onChange={(e) => setCareerFormData({ ...careerFormData, description: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-gray-600 dark:text-slate-300 uppercase text-[10px]">Candidate Requirements</label>
                  <textarea
                    required
                    rows={4}
                    value={careerFormData.requirements}
                    onChange={(e) => setCareerFormData({ ...careerFormData, requirements: e.target.value })}
                    className="w-full border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 p-2.5 text-[#0A1D37] dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCareerFormOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 dark:border-slate-800 text-gray-600 dark:text-slate-300 font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0A1D37] text-white font-bold uppercase tracking-widest border border-[#C5A02E]/40 shadow-lg"
                >
                  {careerFormData.id ? 'Authorize Updates' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NOTIFICATION SLIDE-OVER DRAWER --- */}

      {isNotificationDrawerOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-80 sm:w-96 bg-white dark:bg-slate-900 border-l border-gray-300 dark:border-slate-800 shadow-2xl p-6 font-sans text-xs flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <h3 className="font-serif font-bold text-base text-[#0A1D37] dark:text-white flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#C5A02E]" /> Notification Feed
              </h3>
              <button onClick={() => setIsNotificationDrawerOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No notifications logged.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-3 border text-xs ${n.read ? 'bg-slate-50 dark:bg-slate-800/40 text-gray-500 border-gray-200 dark:border-slate-800' : 'bg-amber-500/10 border-amber-500/30 text-[#0A1D37] dark:text-white font-semibold'}`}>
                    <div className="flex justify-between items-center text-[10px] text-[#C5A02E] mb-1 font-mono uppercase font-bold">
                      <span>{n.type.replace('_', ' ')}</span>
                      <span>{n.timestamp.split('T')[0]}</span>
                    </div>
                    <p className="text-xs">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleMarkNotificationsRead}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs uppercase cursor-pointer"
          >
            Mark All as Read
          </button>
        </div>
      )}

    </div>
  );
}
