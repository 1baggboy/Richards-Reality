import React, { useState, useEffect } from 'react';
import { 
  Lock, User, LogOut, LayoutDashboard, Settings as SettingsIcon, 
  FileText, MessageSquare, Briefcase, Users, Image as ImageIcon, 
  Mail, Activity, ShieldCheck, Database, Check, Trash2, Edit2, 
  Plus, X, ChevronRight, Eye, ShieldAlert, RefreshCw, Upload, Download
} from 'lucide-react';
import { 
  ConsultationRequest, ContactMessage, BlogPost, TeamMember, 
  GalleryItem, Testimonial, JobListing, JobApplication, 
  NewsletterSubscriber, WebsiteSettings, SystemLog 
} from '../types';
import { useToast } from './ui/Toast';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();
  const [token, setToken] = useState<string | null>(localStorage.getItem('richards_admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsTab, setSettingsTab] = useState('general');

  // Database lists
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [careers, setCareers] = useState<JobListing[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Editing UI states
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);
  const [blogFormData, setBlogFormData] = useState({ id: '', title: '', category: 'Market Insights', shortDesc: '', content: '', image: '', author: 'Richards Realty Advisory', readTime: '5 min read' });
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [teamFormData, setTeamFormData] = useState({ id: '', name: '', position: '', bio: '', image: '', linkedin: '', email: '' });
  const [isGalleryFormOpen, setIsGalleryFormOpen] = useState(false);
  const [galleryFormData, setGalleryFormData] = useState({ title: '', category: 'Office' as any, image: '' });
  const [isCareerFormOpen, setIsCareerFormOpen] = useState(false);
  const [careerFormData, setCareerFormData] = useState({ id: '', title: '', department: 'Investment Advisory', location: 'San Francisco, CA', type: 'Full-time' as any, description: '', requirements: '' });
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Active readers
  const [readingMessage, setReadingMessage] = useState<ContactMessage | null>(null);
  const [readingApplication, setReadingApplication] = useState<JobApplication | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load backend data
  const loadAdminData = async (adminToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${adminToken}` };
      
      const [
        resSettings, resConsultations, resMessages, resBlogs, 
        resTeam, resGallery, resCareers, resApps, resSubs, resLogs
      ] = await Promise.all([
        fetch('/api/settings').then(r => r.json()),
        fetch('/api/consultations', { headers }).then(r => r.json()),
        fetch('/api/messages', { headers }).then(r => r.json()),
        fetch('/api/blogs').then(r => r.json()),
        fetch('/api/team').then(r => r.json()),
        fetch('/api/gallery').then(r => r.json()),
        fetch('/api/careers').then(r => r.json()),
        fetch('/api/applications', { headers }).then(r => r.json()),
        fetch('/api/subscribers', { headers }).then(r => r.json()),
        fetch('/api/logs', { headers }).then(r => r.json())
      ]);

      if (resSettings && !resSettings.error) setSettings(resSettings);
      if (Array.isArray(resConsultations)) setConsultations(resConsultations);
      if (Array.isArray(resMessages)) setMessages(resMessages);
      if (Array.isArray(resBlogs)) setBlogs(resBlogs);
      if (Array.isArray(resTeam)) setTeam(resTeam);
      if (Array.isArray(resGallery)) setGallery(resGallery);
      if (Array.isArray(resCareers)) setCareers(resCareers);
      if (Array.isArray(resApps)) setApplications(resApps);
      if (Array.isArray(resSubs)) setSubscribers(resSubs);
      if (Array.isArray(resLogs)) setLogs(resLogs);
    } catch (err) {
      console.error("Failed loading administrative data:", err);
    }
  };

  const handleRefresh = async () => {
    if (!token || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        console.error("Failed to sync from Firestore");
      }
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
        localStorage.setItem('richards_admin_token', data.token);
        setToken(data.token);
      } else {
        setAuthError(data.error || 'Invalid administrator password.');
      }
    } catch (err) {
      setAuthError('Connection failed. Backend server not running.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('richards_admin_token');
    setToken(null);
  };

  // Actions
  const handleUpdateConsultationStatus = async (id: string, status: 'pending' | 'contacted' | 'completed') => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!window.confirm("Delete consultation booking record?")) return;
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMessageStatus = async (id: string, status: 'unread' | 'read') => {
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm("Delete message history record?")) return;
    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
    }
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
        setBlogFormData({ id: '', title: '', category: 'Market Insights', shortDesc: '', content: '', image: '', author: 'Richards Realty Advisory', readTime: '5 min read' });
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Withdraw this insight publication permanently?")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
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
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm("Remove this personnel record?")) return;
    try {
      const res = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
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
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm("Remove this gallery asset?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
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
        loadAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCareer = async (id: string) => {
    if (!window.confirm("Withdraw this active job opening?")) return;
    try {
      const res = await fetch(`/api/careers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) loadAdminData(token!);
    } catch (err) {
      console.error(err);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSettingsLoading(true);
    setSettingsSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSettingsLoading(false);
    }
  };

  // Backup restore
  const handleBackupDownload = () => {
    window.open(`/api/admin/backup?token=${token}`, '_blank');
  };

  const handleRestoreUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.settings) throw new Error("Invalid structure.");
        const res = await fetch('/api/admin/restore', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(parsed)
        });
        if (res.ok) {
          toastSuccess("Database restored successfully!", "Database Restore");
          loadAdminData(token!);
        } else {
          toastError("Restore rejected by server.", "Restore Failed");
        }
      } catch (err) {
        toastError("Restoring failed. Ensure the JSON file is correct.", "Restore Error");
      }
    };
    reader.readAsText(file);
  };

  // Login view
  if (!token) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#F4F7F9] border border-gray-300 p-8 rounded-none shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-[#C5A02E]/10 text-[#C5A02E] rounded-full">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-serif font-black text-xl text-[#0A1D37] uppercase tracking-wider">ADMINISTRATIVE PORTAL</h3>
            <p className="text-xs text-slate-500">Secure credential verification required for Richards Realty LLC administrators.</p>
          </div>

          {authError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-3 rounded-none text-xs font-sans flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Security Email</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  required
                  placeholder="admin@richardsrealty.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-none pl-9 pr-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Access Keycode</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-600" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-none pl-9 pr-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#C5A02E] hover:bg-[#A68625] text-white font-sans font-bold text-xs tracking-wider py-2.5 rounded-none transition-all cursor-pointer"
            >
              VERIFY CREDENTIALS
            </button>
          </form>

          <div className="pt-4 border-t border-slate-805 flex justify-between text-[10px] text-slate-500 font-sans">
            <span>Root account: admin@richardsrealty.com</span>
            <span>Password: richardsadmin</span>
          </div>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-gray-500 hover:text-[#0A1D37] hover:underline pt-2 cursor-pointer"
          >
            Cancel and Return to Website
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-[#F4F7F9] border-b border-gray-300 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#C5A02E] rounded-none text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-base tracking-wide text-[#0A1D37] block leading-none">ADMINISTRATIVE HQ</h1>
            <span className="text-[10px] font-sans text-slate-500 uppercase">Richards Realty LLC • Global System Manager</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-500 hover:text-[#0A1D37] bg-white rounded-none border border-gray-200 hover:bg-[#F4F7F9] cursor-pointer disabled:opacity-50"
            title={isRefreshing ? "Refreshing..." : "Refresh Data"}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-[#C5A02E]" : ""}`} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 rounded-none cursor-pointer transition-all"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
          <button
            onClick={onClose}
            className="bg-[#C5A02E] text-white hover:bg-[#A68625] px-4 py-1.5 rounded-none text-xs font-bold cursor-pointer transition-all"
          >
            EXIT PANEL
          </button>
        </div>
      </header>

      {/* Main Panel split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#F4F7F9] border-r border-gray-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            <p className="text-[9px] uppercase font-sans tracking-widest text-slate-500 px-3 mb-2">Operations</p>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'overview' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <LayoutDashboard className="h-4 w-4" /> Overview Dashboard
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'consultations' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <FileText className="h-4 w-4" /> Consultations ({consultations.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'messages' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <MessageSquare className="h-4 w-4" /> Contact Messages ({messages.filter(m => m.status === 'unread').length})
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'subscribers' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <Mail className="h-4 w-4" /> Newsletter Subscribers
            </button>

            <p className="text-[9px] uppercase font-sans tracking-widest text-slate-500 px-3 pt-6 mb-2">Content CMS</p>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'blogs' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <FileText className="h-4 w-4" /> Blog Insights
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'team' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <Users className="h-4 w-4" /> Corporate Team
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'gallery' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <ImageIcon className="h-4 w-4" /> Media Gallery
            </button>
            <button
              onClick={() => setActiveTab('careers')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'careers' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <Briefcase className="h-4 w-4" /> Careers & Applicants ({applications.length})
            </button>

            <p className="text-[9px] uppercase font-sans tracking-widest text-slate-500 px-3 pt-6 mb-2">System</p>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <SettingsIcon className="h-4 w-4" /> Website Settings
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'logs' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <Activity className="h-4 w-4" /> Security Logs
            </button>
            <button
              onClick={() => setActiveTab('backup')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-none text-left transition-colors cursor-pointer ${activeTab === 'backup' ? 'bg-[#C5A02E] text-white' : 'text-slate-450 hover:bg-gray-200 hover:text-[#0A1D37]'}`}
            >
              <Database className="h-4 w-4" /> Database Backup
            </button>
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-8 bg-white">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Overview Dashboard</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-2">
                  <p className="text-xs text-slate-500 uppercase font-sans">Pending Bookings</p>
                  <p className="text-3xl font-bold text-[#C5A02E] font-sans">{consultations.filter(c => c.status === 'pending').length}</p>
                  <p className="text-[10px] text-gray-500">Total requests logged: {consultations.length}</p>
                </div>
                <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-2">
                  <p className="text-xs text-slate-500 uppercase font-sans">Unread Messages</p>
                  <p className="text-3xl font-bold text-[#C5A02E] font-sans">{messages.filter(m => m.status === 'unread').length}</p>
                  <p className="text-[10px] text-gray-500">Total history: {messages.length}</p>
                </div>
                <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-2">
                  <p className="text-xs text-slate-500 uppercase font-sans">Newsletter Subscribers</p>
                  <p className="text-3xl font-bold text-[#C5A02E] font-sans">{subscribers.length}</p>
                  <p className="text-[10px] text-gray-500">Unique mailing list records</p>
                </div>
                <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-2">
                  <p className="text-xs text-slate-500 uppercase font-sans">Active Vacancies</p>
                  <p className="text-3xl font-bold text-[#C5A02E] font-sans">{careers.filter(c => c.status === 'active').length}</p>
                  <p className="text-[10px] text-gray-500">Job applications logged: {applications.length}</p>
                </div>
              </div>

              {/* Activity Log Split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                <div className="bg-[#F4F7F9]/50 border border-gray-200 p-6 rounded-none space-y-4">
                  <h3 className="font-serif font-bold text-sm text-[#0A1D37] uppercase tracking-wider">Latest System Actions</h3>
                  <div className="divide-y divide-slate-850 max-h-[300px] overflow-y-auto pr-2">
                    {logs.slice(0, 8).map(log => (
                      <div key={log.id} className="py-2.5 text-xs flex justify-between gap-4 font-sans">
                        <div>
                          <span className="text-[#C5A02E] font-semibold">{log.action}:</span>
                          <p className="text-gray-500 mt-0.5 text-[11px]">{log.details}</p>
                        </div>
                        <span className="text-slate-500 text-[10px] whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#F4F7F9]/50 border border-gray-200 p-6 rounded-none space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-sm text-[#0A1D37] uppercase tracking-wider">Database Safeguard</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      All consultation inquiries, corporate messages, blog postings, and configurations are stored securely inside your sandbox environment filesystem (`server_data.json`). Download daily snapshot backups or restore database states instantly.
                    </p>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button onClick={handleBackupDownload} className="flex-1 bg-white border border-gray-300 hover:border-[#C5A02E] hover:text-[#C5A02E] px-4 py-2.5 rounded-none text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <Download className="h-4 w-4" /> Download Backup JSON
                    </button>
                    <label className="flex-1 bg-[#C5A02E] hover:bg-[#A68625] text-white px-4 py-2.5 rounded-none text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                      <Upload className="h-4 w-4" /> Restore JSON DB
                      <input type="file" accept=".json" onChange={handleRestoreUpload} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONSULTATIONS TAB */}
          {activeTab === 'consultations' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Consultation Request Database</h2>
                <span className="bg-[#C5A02E]/10 text-[#C5A02E] border border-[#C5A02E]/20 px-3 py-1 rounded-none text-xs font-sans">{consultations.length} total</span>
              </div>

              <div className="bg-[#F4F7F9] border border-gray-200 rounded-none overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-800">
                  <thead className="bg-white text-slate-500 font-sans uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Client Detail</th>
                      <th className="px-6 py-4">Target Service</th>
                      <th className="px-6 py-4">Appointment</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-gray-600">
                    {consultations.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-sans">No consultations logged yet.</td>
                      </tr>
                    ) : (
                      consultations.map(c => (
                        <tr key={c.id} className="hover:bg-gray-200/20 transition-colors">
                          <td className="px-6 py-4 space-y-1">
                            <p className="font-bold text-[#0A1D37]">{c.fullName}</p>
                            <p className="text-[11px] font-sans text-gray-500">{c.email}</p>
                            <p className="text-[11px] font-sans text-slate-450">{c.phone}</p>
                            {c.company && <p className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded-none text-[#C5A02E] inline-block">{c.company}</p>}
                          </td>
                          <td className="px-6 py-4 font-sans font-medium text-[#C5A02E]">{c.serviceNeeded}</td>
                          <td className="px-6 py-4 space-y-0.5">
                            <p className="font-semibold text-[#0A1D37]">{c.preferredDate}</p>
                            <p className="text-[10px] text-slate-500 font-sans uppercase">{c.preferredTime}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-none text-[10px] font-sans uppercase border ${
                              c.status === 'pending' ? 'bg-[#C5A02E]/10 text-[#C5A02E] border-[#C5A02E]/20 animate-pulse' :
                              c.status === 'contacted' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' :
                              'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {c.status !== 'contacted' && c.status !== 'completed' && (
                                <button onClick={() => handleUpdateConsultationStatus(c.id, 'contacted')} className="bg-sky-500/10 text-sky-500 border border-sky-500/20 p-1.5 rounded-none hover:bg-sky-500 hover:text-[#0A1D37] transition-all cursor-pointer" title="Mark contacted">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {c.status !== 'completed' && (
                                <button onClick={() => handleUpdateConsultationStatus(c.id, 'completed')} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 p-1.5 rounded-none hover:bg-emerald-500 hover:text-[#0A1D37] transition-all cursor-pointer" title="Mark completed">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteConsultation(c.id)} className="bg-rose-500/10 text-rose-500 border border-rose-500/20 p-1.5 rounded-none hover:bg-rose-500 hover:text-[#0A1D37] transition-all cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
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

          {/* CONTACT MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Contact Message Dossier</h2>
                <span className="bg-[#C5A02E]/10 text-[#C5A02E] border border-[#C5A02E]/20 px-3 py-1 rounded-none text-xs font-sans">{messages.length} total</span>
              </div>

              <div className="bg-[#F4F7F9] border border-gray-200 rounded-none overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-800">
                  <thead className="bg-white text-slate-500 font-sans uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Sender</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Received At</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-gray-600">
                    {messages.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-sans">No contact form messages logged.</td>
                      </tr>
                    ) : (
                      messages.map(m => (
                        <tr key={m.id} className="hover:bg-gray-200/20 transition-colors">
                          <td className="px-6 py-4 space-y-1">
                            <p className="font-bold text-[#0A1D37]">{m.fullName}</p>
                            <p className="text-[11px] font-sans text-gray-500">{m.email}</p>
                            <p className="text-[11px] font-sans text-slate-450">{m.phone}</p>
                          </td>
                          <td className="px-6 py-4 font-medium text-[#0A1D37] max-w-[200px] truncate">{m.subject}</td>
                          <td className="px-6 py-4 font-sans text-slate-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded-none text-[10px] font-sans uppercase border ${
                              m.status === 'unread' ? 'bg-[#C5A02E]/10 text-[#C5A02E] border-[#C5A02E]/20 animate-pulse' : 'bg-white text-slate-500 border-gray-200'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setReadingMessage(m)} className="bg-[#C5A02E]/10 text-[#C5A02E] border border-[#C5A02E]/20 p-1.5 rounded-none hover:bg-[#C5A02E] hover:text-white transition-all cursor-pointer" title="Read message">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              {m.status === 'unread' && (
                                <button onClick={() => handleUpdateMessageStatus(m.id, 'read')} className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 p-1.5 rounded-none hover:bg-emerald-500 hover:text-[#0A1D37] transition-all cursor-pointer" title="Mark Read">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button onClick={() => handleDeleteMessage(m.id)} className="bg-rose-500/10 text-rose-500 border border-rose-500/20 p-1.5 rounded-none hover:bg-rose-500 hover:text-[#0A1D37] transition-all cursor-pointer">
                                <Trash2 className="h-3.5 w-3.5" />
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

          {/* NEWSLETTER SUBSCRIBERS */}
          {activeTab === 'subscribers' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Newsletter Mailing List</h2>
                <span className="bg-[#C5A02E]/10 text-[#C5A02E] border border-[#C5A02E]/20 px-3 py-1 rounded-none text-xs font-sans">{subscribers.length} total subscribers</span>
              </div>

              <div className="bg-[#F4F7F9] border border-gray-200 rounded-none max-w-xl overflow-hidden shadow-xl">
                <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center text-xs font-sans text-gray-500">
                  <span>Registered Emails</span>
                  <button onClick={() => {
                    const emails = subscribers.map(s => s.email).join('\n');
                    navigator.clipboard.writeText(emails);
                    toastSuccess("All email addresses copied to clipboard!", "Clipboard Copied");
                  }} className="text-[#C5A02E] hover:underline">Copy All Addresses</button>
                </div>
                <div className="divide-y divide-slate-850 max-h-[400px] overflow-y-auto">
                  {subscribers.length === 0 ? (
                    <p className="p-8 text-center text-slate-500 font-sans text-xs">No email subscribers registered.</p>
                  ) : (
                    subscribers.map((sub, i) => (
                      <div key={sub.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-200/10 font-sans">
                        <span className="text-[#0A1D37] font-semibold">{i + 1}. {sub.email}</span>
                        <span className="text-slate-500 text-[10px]">{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BLOGS CMS TAB */}
          {activeTab === 'blogs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Blog Insight CMS</h2>
                <button
                  onClick={() => {
                    setBlogFormData({ id: '', title: '', category: 'Market Insights', shortDesc: '', content: '', image: '', author: 'Richard V. Henderson, Managing Partner', readTime: '5 min read' });
                    setIsBlogFormOpen(true);
                  }}
                  className="bg-[#C5A02E] hover:bg-[#A68625] text-white px-4 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> CREATE PUBLICATION
                </button>
              </div>

              {/* Blogs List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map(blog => (
                  <div key={blog.id} className="bg-[#F4F7F9] border border-gray-200 rounded-none p-5 flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] text-[#C5A02E] font-sans uppercase tracking-wider">{blog.category}</span>
                        <span className="text-[10px] text-slate-500 font-sans">{blog.date}</span>
                      </div>
                      <h4 className="font-serif font-bold text-[#0A1D37] line-clamp-1">{blog.title}</h4>
                      <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">{blog.shortDesc}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-sans">By {blog.author.split(',')[0]}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBlogFormData({ ...blog });
                            setIsBlogFormOpen(true);
                          }}
                          className="p-1.5 bg-white hover:bg-gray-200 text-slate-450 hover:text-[#0A1D37] rounded-none border border-gray-300 transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-[#0A1D37] rounded-none border border-rose-500/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEAM CMS TAB */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Personnel CMS</h2>
                <button
                  onClick={() => {
                    setTeamFormData({ id: '', name: '', position: '', bio: '', image: '', linkedin: '', email: '' });
                    setIsTeamFormOpen(true);
                  }}
                  className="bg-[#C5A02E] hover:bg-[#A68625] text-white px-4 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> ADD TEAM MEMBER
                </button>
              </div>

              {/* Team list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.map(member => (
                  <div key={member.id} className="bg-[#F4F7F9] border border-gray-200 rounded-none p-5 flex gap-4 items-start shadow-xl">
                    <img src={member.image} alt={member.name} className="h-16 w-16 rounded-none object-cover border border-gray-200 bg-white shrink-0" referrerPolicy="no-referrer" />
                    <div className="space-y-2 flex-grow overflow-hidden">
                      <div className="space-y-0.5">
                        <h4 className="font-serif font-bold text-[#0A1D37] text-sm leading-tight truncate">{member.name}</h4>
                        <p className="text-[11px] text-[#C5A02E] font-sans tracking-wide leading-tight truncate">{member.position}</p>
                      </div>
                      <p className="text-slate-450 text-[11px] line-clamp-2 leading-relaxed">{member.bio}</p>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-sans truncate max-w-[120px]">{member.email}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setTeamFormData({ ...member });
                              setIsTeamFormOpen(true);
                            }}
                            className="p-1 bg-white hover:bg-gray-200 text-gray-500 hover:text-[#0A1D37] rounded-none border border-gray-300 cursor-pointer"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(member.id)}
                            className="p-1 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-[#0A1D37] rounded-none border border-rose-500/20 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MEDIA GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Media Library CMS</h2>
                <button
                  onClick={() => {
                    setGalleryFormData({ title: '', category: 'Office', image: '' });
                    setIsGalleryFormOpen(true);
                  }}
                  className="bg-[#C5A02E] hover:bg-[#A68625] text-white px-4 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> REGISTER GALLERY ASSET
                </button>
              </div>

              {/* Gallery List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {gallery.map(item => (
                  <div key={item.id} className="bg-[#F4F7F9] border border-gray-200 rounded-none overflow-hidden flex flex-col justify-between shadow-xl group">
                    <div className="h-32 w-full overflow-hidden bg-white relative">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                      <span className="absolute top-2 left-2 bg-white/90 text-[#C5A02E] border border-gray-300 text-[8px] font-sans uppercase px-1.5 py-0.5 rounded-none">{item.category}</span>
                    </div>
                    <div className="p-3 space-y-2 flex-grow flex flex-col justify-between">
                      <p className="text-[11px] font-sans font-semibold text-[#0A1D37] leading-tight line-clamp-1">{item.title}</p>
                      <div className="flex justify-end pt-1">
                        <button onClick={() => handleDeleteGallery(item.id)} className="p-1 text-rose-500 hover:bg-rose-500 hover:text-[#0A1D37] rounded-none transition-colors border border-rose-500/10 cursor-pointer text-xs flex items-center gap-1 font-sans uppercase tracking-wider">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAREERS TAB */}
          {activeTab === 'careers' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Careers Opportunity Manager</h2>
                <button
                  onClick={() => {
                    setCareerFormData({ id: '', title: '', department: 'Investment Advisory', location: 'San Francisco, CA', type: 'Full-time', description: '', requirements: '' });
                    setIsCareerFormOpen(true);
                  }}
                  className="bg-[#C5A02E] hover:bg-[#A68625] text-white px-4 py-2 rounded-none text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> CREATE OPPORTUNITY
                </button>
              </div>

              {/* Opportunity vacancies split with candidates */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <span className="text-xs text-[#0A1D37] font-bold uppercase tracking-wider block">Active Vacancies</span>
                  <div className="space-y-4">
                    {careers.map(job => (
                      <div key={job.id} className="bg-[#F4F7F9] border border-gray-200 p-5 rounded-none flex justify-between gap-6 shadow-xl">
                        <div className="space-y-1 overflow-hidden">
                          <span className={`px-2 py-0.5 rounded-none text-[8px] font-sans border uppercase ${job.status === 'active' ? 'bg-[#C5A02E]/10 text-[#C5A02E] border-[#C5A02E]/10' : 'bg-white text-slate-500 border-gray-200'}`}>{job.status}</span>
                          <h4 className="font-serif font-bold text-[#0A1D37] text-sm pt-1">{job.title}</h4>
                          <p className="text-[11px] text-[#C5A02E] font-sans">{job.department} • {job.location}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setCareerFormData({
                                id: job.id,
                                title: job.title,
                                department: job.department,
                                location: job.location,
                                type: job.type,
                                description: job.description,
                                requirements: job.requirements.join('\n')
                              });
                              setIsCareerFormOpen(true);
                            }}
                            className="p-1.5 bg-white hover:bg-gray-200 text-gray-500 hover:text-[#0A1D37] rounded-none border border-gray-300 cursor-pointer"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCareer(job.id)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-[#0A1D37] rounded-none border border-rose-500/20 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <span className="text-xs text-[#0A1D37] font-bold uppercase tracking-wider block">Applicants Database</span>
                  <div className="bg-[#F4F7F9] border border-gray-200 rounded-none overflow-hidden">
                    <div className="divide-y divide-slate-850">
                      {applications.length === 0 ? (
                        <p className="p-8 text-center text-slate-500 font-sans text-xs">No job applications submitted yet.</p>
                      ) : (
                        applications.map(app => (
                          <div key={app.id} className="p-4 hover:bg-gray-200/10 flex items-center justify-between text-xs font-sans">
                            <div className="space-y-0.5 max-w-[70%]">
                              <p className="font-bold text-[#0A1D37] truncate">{app.fullName}</p>
                              <p className="text-[10px] text-[#C5A02E] font-sans truncate">{app.jobTitle}</p>
                            </div>
                            <button onClick={() => setReadingApplication(app)} className="bg-white hover:bg-gray-200 border border-gray-300 text-[#0A1D37] px-3 py-1.5 rounded-none text-[10px] uppercase font-semibold cursor-pointer">
                              View Dossier
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          
          {activeTab === 'settings' && settings && (
            <div className="space-y-6 max-w-5xl animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Corporate Parameter Settings</h2>
                <div className="flex items-center gap-3">
                  {settingsSuccess && <span className="text-xs text-emerald-500 font-sans">Parameters Saved!</span>}
                  <button
                    type="button"
                    onClick={handleSaveSettings}
                    disabled={isSettingsLoading}
                    className="bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-slate-800 text-white px-6 py-2 rounded-none text-xs font-bold transition-all cursor-pointer"
                  >
                    {isSettingsLoading ? "SAVING..." : "SAVE PARAMETERS"}
                  </button>
                </div>
              </div>

              {/* Sub-Tabs for Settings */}
              <div className="flex space-x-6 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'general', label: 'General & Social' },
                  { id: 'styling', label: 'Styling & Brand' },
                  { id: 'home', label: 'Home Page' },
                  { id: 'about', label: 'About Page' },
                  { id: 'mission', label: 'Mission Page' },
                  { id: 'other', label: 'Other Pages' },
                  { id: 'faqs', label: 'FAQs' },
                  { id: 'legal', label: 'Legal Pages' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSettingsTab(tab.id)}
                    className={`py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${settingsTab === tab.id ? 'border-[#C5A02E] text-[#0A1D37]' : 'border-transparent text-gray-400 hover:text-[#C5A02E]'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {settingsTab === 'general' && (
                  <>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">HQ Contact Credentials</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Corporate Name</label>
                        <input
                          type="text"
                          value={settings.general.companyName}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, companyName: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Email Address</label>
                        <input
                          type="email"
                          value={settings.general.email}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, email: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Phone Number</label>
                        <input
                          type="text"
                          value={settings.general.phone}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, phone: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">WhatsApp Number (e.g. 14155552671)</label>
                        <input
                          type="text"
                          value={settings.general.whatsappNumber || ''}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, whatsappNumber: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">HQ Address</label>
                        <textarea
                          rows={2}
                          value={settings.general.address}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, address: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"
                        ></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Operating Hours</label>
                        <input
                          type="text"
                          value={settings.general.workingHours}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, workingHours: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Google Map IFrame URL</label>
                        <textarea
                          rows={3}
                          value={settings.general.googleMapIframe}
                          onChange={(e) => setSettings({ ...settings, general: { ...settings.general, googleMapIframe: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] font-mono text-[10px] focus:outline-none resize-none"
                        ></textarea>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                        <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">SEO Metadata</span>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Global Meta Title</label>
                          <input
                            type="text"
                            value={settings.seo.metaTitle}
                            onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaTitle: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Global Meta Description</label>
                          <textarea
                            rows={3}
                            value={settings.seo.metaDescription}
                            onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, metaDescription: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"
                          ></textarea>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Open Graph Image URL</label>
                          <input
                            type="text"
                            value={settings.seo.openGraphImage}
                            onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, openGraphImage: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                        <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Digital Social Integrations</span>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">LinkedIn URL</label>
                          <input
                            type="text"
                            value={settings.social.linkedin}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, linkedin: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Twitter URL</label>
                          <input
                            type="text"
                            value={settings.social.twitter}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, twitter: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Facebook URL</label>
                          <input
                            type="text"
                            value={settings.social.facebook}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Instagram URL</label>
                          <input
                            type="text"
                            value={settings.social.instagram}
                            onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === 'styling' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Website Styling (Brand Identity)</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Primary Color (Hex)</label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 border border-gray-300" style={{ backgroundColor: settings.styling?.primaryColor || '#0A1D37' }}></div>
                          <input
                            type="text"
                            value={settings.styling?.primaryColor || '#0A1D37'}
                            onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, primaryColor: e.target.value } })}
                            className="flex-1 bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Accent Color (Hex)</label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 border border-gray-300" style={{ backgroundColor: settings.styling?.accentColor || '#C5A02E' }}></div>
                          <input
                            type="text"
                            value={settings.styling?.accentColor || '#C5A02E'}
                            onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, accentColor: e.target.value } })}
                            className="flex-1 bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Background Color (Hex)</label>
                        <div className="flex gap-2">
                          <div className="w-8 h-8 border border-gray-300" style={{ backgroundColor: settings.styling?.backgroundColor || '#ffffff' }}></div>
                          <input
                            type="text"
                            value={settings.styling?.backgroundColor || '#ffffff'}
                            onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, backgroundColor: e.target.value } })}
                            className="flex-1 bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Typography Font</label>
                        <select
                          value={settings.styling?.fontFamily || 'font-sans'}
                          onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, fontFamily: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                        >
                          <option value="font-sans">Modern (Sans-serif)</option>
                          <option value="font-serif">Traditional (Serif)</option>
                          <option value="font-mono">Technical (Monospace)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Component Borders</label>
                        <select
                          value={settings.styling?.borderRadius || 'rounded-none'}
                          onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, borderRadius: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                        >
                          <option value="rounded-none">Sharp Corners (0px)</option>
                          <option value="rounded-sm">Slightly Rounded (2px)</option>
                          <option value="rounded-md">Rounded (6px)</option>
                          <option value="rounded-xl">Highly Rounded (12px)</option>
                          <option value="rounded-full">Pill (Full)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Animation Style</label>
                        <select
                          value={settings.styling?.animationStyle || 'animate-in fade-in duration-200'}
                          onChange={(e) => setSettings({ ...settings, styling: { ...settings.styling, animationStyle: e.target.value } })}
                          className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                        >
                          <option value="none">No Animations</option>
                          <option value="animate-in fade-in duration-200">Subtle Fade</option>
                          <option value="animate-in fade-in slide-in-from-bottom-4 duration-500">Slide Up</option>
                          <option value="animate-in fade-in zoom-in-95 duration-300">Zoom In</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'home' && (
                  <>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Hero Section</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Hero Headline</label>
                        <input type="text" value={settings.content?.heroHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Hero Subheadline</label>
                        <textarea rows={3} value={settings.content?.heroSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Hero Background Image</label>
                        <input type="text" value={settings.content?.heroImage || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, heroImage: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Home - About Section</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">About Headline</label>
                        <input type="text" value={settings.content?.aboutHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">About Text</label>
                        <textarea rows={3} value={settings.content?.aboutText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">About Image URL</label>
                        <input type="text" value={settings.content?.aboutImage || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutImage: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Home - Services Section</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Services Headline</label>
                        <input type="text" value={settings.content?.servicesHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, servicesHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Services Subheadline</label>
                        <textarea rows={3} value={settings.content?.servicesSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, servicesSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Home - Mission & Team</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Mission Headline</label>
                        <input type="text" value={settings.content?.missionHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Mission Text</label>
                        <textarea rows={3} value={settings.content?.missionText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5 mt-4">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Team Headline</label>
                        <input type="text" value={settings.content?.teamHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, teamHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Team Subheadline</label>
                        <textarea rows={3} value={settings.content?.teamSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, teamSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === 'about' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">About Page Content</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Main Headline</label>
                          <input type="text" value={settings.content?.aboutPageHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Introductory Text</label>
                          <textarea rows={3} value={settings.content?.aboutPageText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Story Headline</label>
                          <input type="text" value={settings.content?.aboutPageStoryHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageStoryHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Story Text</label>
                          <textarea rows={6} value={settings.content?.aboutPageStoryText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageStoryText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Message Headline</label>
                          <input type="text" value={settings.content?.aboutPageMessageHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageMessageHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Message Text</label>
                          <textarea rows={6} value={settings.content?.aboutPageMessageText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageMessageText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Message Author</label>
                          <input type="text" value={settings.content?.aboutPageMessageAuthor || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, aboutPageMessageAuthor: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'mission' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Mission Page Content</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Core Mission Headline</label>
                          <input type="text" value={settings.content?.missionCoreHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCoreHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Core Mission Text</label>
                          <textarea rows={3} value={settings.content?.missionCoreText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCoreText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Vision Headline</label>
                          <input type="text" value={settings.content?.missionVisionHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionVisionHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Vision Text</label>
                          <textarea rows={3} value={settings.content?.missionVisionText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionVisionText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Approach Headline</label>
                          <input type="text" value={settings.content?.missionApproachHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionApproachHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Approach Text</label>
                          <textarea rows={3} value={settings.content?.missionApproachText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionApproachText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                        <div className="space-y-1.5 mt-4">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Commitment Headline</label>
                          <input type="text" value={settings.content?.missionCommitmentHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCommitmentHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Commitment Text</label>
                          <textarea rows={3} value={settings.content?.missionCommitmentText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, missionCommitmentText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'other' && (
                  <>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Gallery & Blog Pages</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Gallery Headline</label>
                        <input type="text" value={settings.content?.galleryHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, galleryHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Gallery Subheadline</label>
                        <textarea rows={2} value={settings.content?.gallerySubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, gallerySubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5 mt-4">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Blog Headline</label>
                        <input type="text" value={settings.content?.blogHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, blogHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Blog Subheadline</label>
                        <textarea rows={2} value={settings.content?.blogSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, blogSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                    <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Careers & Contact Pages</span>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Careers Headline</label>
                        <input type="text" value={settings.content?.careersHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, careersHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Careers Subheadline</label>
                        <textarea rows={2} value={settings.content?.careersSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, careersSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5 mt-4">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Contact Headline</label>
                        <input type="text" value={settings.content?.contactHeadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, contactHeadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Contact Subheadline</label>
                        <textarea rows={2} value={settings.content?.contactSubheadline || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, contactSubheadline: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </>
                )}

                {settingsTab === 'legal' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block border-b border-gray-200 pb-2">Legal Pages & Footer Content</span>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Footer Text</label>
                        <textarea rows={3} value={settings.content?.footerText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, footerText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Privacy Policy Text</label>
                        <textarea rows={4} value={settings.content?.privacyPolicyText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, privacyPolicyText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Terms of Service Text</label>
                        <textarea rows={4} value={settings.content?.termsOfServiceText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, termsOfServiceText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Cookie Policy Text</label>
                        <textarea rows={3} value={settings.content?.cookiePolicyText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, cookiePolicyText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Disclaimer Text</label>
                        <textarea rows={3} value={settings.content?.disclaimerText || ''} onChange={(e) => setSettings({ ...settings, content: { ...settings.content, disclaimerText: e.target.value } })} className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {settingsTab === 'faqs' && (
                  <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-4 md:col-span-2">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-xs text-[#C5A02E] font-bold uppercase tracking-wider block">Frequently Asked Questions</span>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newFaqs = [...(settings.content?.faqs || []), { q: 'New Question', a: 'Answer...' }];
                          setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                        }}
                        className="text-xs text-[#0A1D37] hover:text-[#C5A02E] font-bold cursor-pointer"
                      >
                        + ADD FAQ
                      </button>
                    </div>
                    
                    <div className="space-y-6 pt-2">
                      {settings.content?.faqs?.map((faq, idx) => (
                        <div key={idx} className="space-y-2 border border-gray-200 p-4 bg-white relative">
                          <button 
                            type="button"
                            onClick={() => {
                              const newFaqs = settings.content!.faqs!.filter((_, i) => i !== idx);
                              setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                          >
                            REMOVE
                          </button>
                          <div className="space-y-1.5 pr-16">
                            <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Question {idx + 1}</label>
                            <input
                              type="text"
                              value={faq.q}
                              onChange={(e) => {
                                const newFaqs = [...settings.content!.faqs!];
                                newFaqs[idx].q = e.target.value;
                                setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                              }}
                              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E]"
                            />
                          </div>
                          <div className="space-y-1.5 pr-16">
                            <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Answer</label>
                            <textarea
                              rows={2}
                              value={faq.a}
                              onChange={(e) => {
                                const newFaqs = [...settings.content!.faqs!];
                                newFaqs[idx].a = e.target.value;
                                setSettings({ ...settings, content: { ...settings.content, faqs: newFaqs } });
                              }}
                              className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none focus:border-[#C5A02E] resize-none"
                            ></textarea>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

{activeTab === 'logs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Security Auditing Logs</h2>
                <span className="text-xs text-slate-500 font-sans">Latest 500 actions registered</span>
              </div>

              <div className="bg-[#F4F7F9] border border-gray-200 rounded-none overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-slate-800 font-sans">
                  <thead className="bg-white text-slate-500 uppercase text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Security Operation</th>
                      <th className="px-6 py-4">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 text-gray-500">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-200/10">
                        <td className="px-6 py-3 text-slate-550 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-3 font-semibold text-[#C5A02E]">{log.action}</td>
                        <td className="px-6 py-3 text-[#0A1D37]">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BACKUP RESTORE TAB */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-xl animate-in fade-in duration-200">
              <h2 className="font-serif text-xl font-bold text-[#0A1D37] uppercase tracking-tight">Global System Restoration</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Download a comprehensive database backup file in standard JSON format containing all corporate parameters, active job listing pipelines, personnel grids, gallery indices, consultations registry, and correspondence histories.
              </p>

              <div className="bg-[#F4F7F9] border border-gray-200 p-6 rounded-none space-y-6 shadow-xl">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-[#0A1D37] uppercase font-sans tracking-wider block">Backup Export</span>
                  <p className="text-[11px] text-slate-500">Generate and download a snapshot copy of the filesystem storage file instantly.</p>
                  <button onClick={handleBackupDownload} className="bg-[#C5A02E] hover:bg-[#A68625] text-white text-xs font-bold py-2 px-4 rounded-none transition-all cursor-pointer">
                    EXPORT FILESYSTEM DATA
                  </button>
                </div>

                <div className="space-y-2 border-t border-gray-200 pt-6">
                  <span className="text-xs font-semibold text-[#0A1D37] uppercase font-sans tracking-wider block">State Recovery</span>
                  <p className="text-[11px] text-slate-500">Restore your dashboard from a previously generated backup JSON file. Drag and drop or browse below.</p>
                  <label className="inline-flex items-center justify-center bg-white border border-gray-300 hover:border-[#C5A02E] text-[#0A1D37] hover:text-[#C5A02E] px-4 py-2 rounded-none text-xs font-bold transition-all cursor-pointer">
                    UPLOAD AND RESTORE BACKUP
                    <input type="file" accept=".json" onChange={handleRestoreUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: READ MESSAGE POPUP */}
      {readingMessage && (
        <div className="fixed inset-0 z-55 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F4F7F9] border border-gray-300 max-w-xl w-full p-6 rounded-none space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] text-[#C5A02E] uppercase font-sans tracking-wider">Contact Form Record</span>
                <h4 className="font-serif font-bold text-[#0A1D37] text-lg">{readingMessage.subject}</h4>
              </div>
              <button onClick={() => setReadingMessage(null)} className="text-gray-500 hover:text-[#0A1D37] p-1 rounded-full cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-white p-4 rounded-none border border-gray-200 text-xs space-y-1 font-sans">
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">From:</span> {readingMessage.fullName}</p>
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Email:</span> {readingMessage.email}</p>
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Phone:</span> {readingMessage.phone || "Not provided"}</p>
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Date:</span> {new Date(readingMessage.createdAt).toLocaleString()}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase font-sans tracking-wider text-slate-500">Inquiry Body Message</p>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{readingMessage.message}</p>
            </div>
            <div className="pt-4 border-t border-slate-805 flex justify-end gap-2">
              {readingMessage.status === 'unread' && (
                <button
                  onClick={() => {
                    handleUpdateMessageStatus(readingMessage.id, 'read');
                    setReadingMessage(null);
                  }}
                  className="bg-emerald-500 text-[#0A1D37] font-semibold text-xs py-2 px-4 rounded-none cursor-pointer hover:bg-emerald-600 transition-colors"
                >
                  Mark as Read
                </button>
              )}
              <button onClick={() => setReadingMessage(null)} className="bg-white border border-gray-300 text-[#0A1D37] px-4 py-2 rounded-none text-xs cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: READ APPLICATION POPUP */}
      {readingApplication && (
        <div className="fixed inset-0 z-55 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F4F7F9] border border-gray-300 max-w-xl w-full p-6 rounded-none space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] text-[#C5A02E] uppercase font-sans tracking-wider">Candidate Profile Folder</span>
                <h4 className="font-serif font-bold text-[#0A1D37] text-lg">{readingApplication.fullName}</h4>
              </div>
              <button onClick={() => setReadingApplication(null)} className="text-gray-500 hover:text-[#0A1D37] p-1 rounded-full cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-white p-4 rounded-none border border-gray-200 text-xs space-y-1 font-sans">
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Job Position:</span> {readingApplication.jobTitle}</p>
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Email:</span> {readingApplication.email}</p>
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Phone:</span> {readingApplication.phone}</p>
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Resume Attachment:</span> <span className="text-[#C5A02E] underline">{readingApplication.resumeUrl}</span></p>
              <p className="text-slate-500"><span className="text-gray-600 font-semibold">Date Logged:</span> {new Date(readingApplication.createdAt).toLocaleString()}</p>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs uppercase font-sans tracking-wider text-slate-500">Applicant Cover Narrative</p>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{readingApplication.coverLetter || "Candidate did not submit a cover narrative."}</p>
            </div>
            <div className="pt-4 border-t border-slate-805 flex justify-end">
              <button onClick={() => setReadingApplication(null)} className="bg-white border border-gray-300 text-[#0A1D37] px-5 py-2 rounded-none text-xs cursor-pointer">
                Close Candidate Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BLOG CMS FORM OVERLAY */}
      {isBlogFormOpen && (
        <div className="fixed inset-0 z-55 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleBlogSubmit} className="bg-[#F4F7F9] border border-gray-300 max-w-2xl w-full p-6 rounded-none space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h4 className="font-serif font-bold text-[#0A1D37] text-base uppercase tracking-tight">{blogFormData.id ? 'Edit Insight Publication' : 'Create Insight Publication'}</h4>
              <button type="button" onClick={() => setIsBlogFormOpen(false)} className="text-gray-500 hover:text-[#0A1D37] cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Publication Title</label>
                <input
                  type="text"
                  required
                  value={blogFormData.title}
                  onChange={(e) => setBlogFormData({ ...blogFormData, title: e.target.value })}
                  placeholder="e.g. Q3 Capital Markets Report"
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Sub-Category</label>
                <select
                  value={blogFormData.category}
                  onChange={(e) => setBlogFormData({ ...blogFormData, category: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                >
                  <option value="Market Insights">Market Insights</option>
                  <option value="Valuation & Advisory">Valuation & Advisory</option>
                  <option value="Corporate Solutions">Corporate Solutions</option>
                  <option value="Regulatory Updates">Regulatory Updates</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Author Credit</label>
                <input
                  type="text"
                  required
                  value={blogFormData.author}
                  onChange={(e) => setBlogFormData({ ...blogFormData, author: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Reading Time Metric</label>
                <input
                  type="text"
                  required
                  value={blogFormData.readTime}
                  onChange={(e) => setBlogFormData({ ...blogFormData, readTime: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Visual Cover URL</label>
              <input
                type="text"
                required
                value={blogFormData.image}
                onChange={(e) => setBlogFormData({ ...blogFormData, image: e.target.value })}
                placeholder="Unsplash absolute link recommended"
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Abstract Summary (Short Description)</label>
              <input
                type="text"
                required
                value={blogFormData.shortDesc}
                onChange={(e) => setBlogFormData({ ...blogFormData, shortDesc: e.target.value })}
                placeholder="Brief meta description (approx 150 characters)"
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Full Editorial Content</label>
              <textarea
                required
                rows={6}
                value={blogFormData.content}
                onChange={(e) => setBlogFormData({ ...blogFormData, content: e.target.value })}
                placeholder="Editorial narrative split by paragraph..."
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => setIsBlogFormOpen(false)} className="bg-white border border-gray-300 text-[#0A1D37] px-4 py-2 rounded-none text-xs cursor-pointer">Cancel</button>
              <button type="submit" className="bg-[#C5A02E] hover:bg-[#A68625] text-white font-bold px-4 py-2 rounded-none text-xs cursor-pointer">SUBMIT ARTICLE</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: TEAM CMS FORM OVERLAY */}
      {isTeamFormOpen && (
        <div className="fixed inset-0 z-55 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleTeamSubmit} className="bg-[#F4F7F9] border border-gray-300 max-w-xl w-full p-6 rounded-none space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h4 className="font-serif font-bold text-[#0A1D37] text-base uppercase tracking-tight">{teamFormData.id ? 'Edit Consultant Profile' : 'Register Partner Profile'}</h4>
              <button type="button" onClick={() => setIsTeamFormOpen(false)} className="text-gray-500 hover:text-[#0A1D37] cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={teamFormData.name}
                  onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Corporate Position</label>
                <input
                  type="text"
                  required
                  value={teamFormData.position}
                  onChange={(e) => setTeamFormData({ ...teamFormData, position: e.target.value })}
                  placeholder="e.g. Executive VP, Advisory"
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Professional Email</label>
                <input
                  type="email"
                  value={teamFormData.email}
                  onChange={(e) => setTeamFormData({ ...teamFormData, email: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">LinkedIn Profile Link</label>
                <input
                  type="text"
                  value={teamFormData.linkedin}
                  onChange={(e) => setTeamFormData({ ...teamFormData, linkedin: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Portrait Image URL</label>
              <input
                type="text"
                required
                value={teamFormData.image}
                onChange={(e) => setTeamFormData({ ...teamFormData, image: e.target.value })}
                placeholder="Unsplash portrait relative/absolute link"
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Short Professional Biography</label>
              <textarea
                rows={3}
                value={teamFormData.bio}
                onChange={(e) => setTeamFormData({ ...teamFormData, bio: e.target.value })}
                placeholder="Summary of experience, past transactions, credentials..."
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => setIsTeamFormOpen(false)} className="bg-white border border-gray-300 text-[#0A1D37] px-4 py-2 rounded-none text-xs cursor-pointer">Cancel</button>
              <button type="submit" className="bg-[#C5A02E] hover:bg-[#A68625] text-white font-bold px-4 py-2 rounded-none text-xs cursor-pointer">ADD MEMBER</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: GALLERY CMS FORM OVERLAY */}
      {isGalleryFormOpen && (
        <div className="fixed inset-0 z-55 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleGallerySubmit} className="bg-[#F4F7F9] border border-gray-300 max-w-md w-full p-6 rounded-none space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h4 className="font-serif font-bold text-[#0A1D37] text-base uppercase tracking-tight">Register Gallery Asset</h4>
              <button type="button" onClick={() => setIsGalleryFormOpen(false)} className="text-gray-500 hover:text-[#0A1D37] cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Asset Title</label>
              <input
                type="text"
                required
                value={galleryFormData.title}
                onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Asset Category Tag</label>
              <select
                value={galleryFormData.category}
                onChange={(e) => setGalleryFormData({ ...galleryFormData, category: e.target.value as any })}
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
              >
                <option value="Office">Office</option>
                <option value="Meetings">Meetings</option>
                <option value="Projects">Projects</option>
                <option value="Corporate Events">Corporate Events</option>
                <option value="Site Visits">Site Visits</option>
                <option value="Team Activities">Team Activities</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Media URL</label>
              <input
                type="text"
                required
                value={galleryFormData.image}
                onChange={(e) => setGalleryFormData({ ...galleryFormData, image: e.target.value })}
                placeholder="Absolute path or premium Unsplash address"
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => setIsGalleryFormOpen(false)} className="bg-white border border-gray-300 text-[#0A1D37] px-4 py-2 rounded-none text-xs cursor-pointer">Cancel</button>
              <button type="submit" className="bg-[#C5A02E] hover:bg-[#A68625] text-white font-bold px-4 py-2 rounded-none text-xs cursor-pointer">REGISTER ASSET</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: CAREER CMS FORM OVERLAY */}
      {isCareerFormOpen && (
        <div className="fixed inset-0 z-55 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCareerSubmit} className="bg-[#F4F7F9] border border-gray-300 max-w-2xl w-full p-6 rounded-none space-y-4 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h4 className="font-serif font-bold text-[#0A1D37] text-base uppercase tracking-tight">{careerFormData.id ? 'Edit Vacancy' : 'Create Career Opportunity'}</h4>
              <button type="button" onClick={() => setIsCareerFormOpen(false)} className="text-gray-500 hover:text-[#0A1D37] cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Job Title</label>
                <input
                  type="text"
                  required
                  value={careerFormData.title}
                  onChange={(e) => setCareerFormData({ ...careerFormData, title: e.target.value })}
                  placeholder="e.g. Principal Investment Underwriter"
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Department</label>
                <select
                  value={careerFormData.department}
                  onChange={(e) => setCareerFormData({ ...careerFormData, department: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                >
                  <option value="Investment Advisory">Investment Advisory</option>
                  <option value="Property Valuation">Property Valuation</option>
                  <option value="Corporate Solutions">Corporate Solutions</option>
                  <option value="Legal & zoning">Legal & Zoning</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Geographical Location</label>
                <input
                  type="text"
                  required
                  value={careerFormData.location}
                  onChange={(e) => setCareerFormData({ ...careerFormData, location: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Contract Type</label>
                <select
                  value={careerFormData.type}
                  onChange={(e) => setCareerFormData({ ...careerFormData, type: e.target.value as any })}
                  className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Opportunity Description Summary</label>
              <textarea
                required
                rows={3}
                value={careerFormData.description}
                onChange={(e) => setCareerFormData({ ...careerFormData, description: e.target.value })}
                placeholder="Overview of day-to-day operations and team context..."
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none"
              ></textarea>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-sans tracking-wider text-gray-500">Required Skills & Requirements (One per line)</label>
              <textarea
                required
                rows={4}
                value={careerFormData.requirements}
                onChange={(e) => setCareerFormData({ ...careerFormData, requirements: e.target.value })}
                placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3..."
                className="w-full bg-white border border-gray-300 rounded-none px-3 py-2 text-xs text-[#0A1D37] focus:outline-none resize-none font-sans"
              ></textarea>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => setIsCareerFormOpen(false)} className="bg-white border border-gray-300 text-[#0A1D37] px-4 py-2 rounded-none text-xs cursor-pointer">Cancel</button>
              <button type="submit" className="bg-[#C5A02E] hover:bg-[#A68625] text-white font-bold px-4 py-2 rounded-none text-xs cursor-pointer">PUBLISH VACANCY</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
