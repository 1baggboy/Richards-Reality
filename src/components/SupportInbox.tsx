import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, query, orderBy, onSnapshot, doc, 
  updateDoc, addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { SupportThread, SupportMessage } from '../types';
import { Send, User, CheckCircle2, Clock, Search, MessageSquare, ChevronRight, ShieldAlert, X, Download } from 'lucide-react';

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function SupportInbox() {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [authError, setAuthError] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  const visitorMsgSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));
  const adminSendSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));

  const handleDownloadTranscript = () => {
    const activeThread = threads.find(t => t.id === activeThreadId);
    if (!activeThread || messages.length === 0) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(10, 29, 55); // #0A1D37
    doc.text("RICHARDS REALTY LLC", 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(197, 160, 46); // #C5A02E
    doc.text("CUSTOMER SUPPORT TRANSCRIPT", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`ID: ${activeThread.id}`, 14, 40);
    doc.text(`Visitor: ${activeThread.visitorName} (${activeThread.visitorEmail})`, 14, 45);
    doc.text(`Created: ${activeThread.createdAt ? new Date(activeThread.createdAt.toDate()).toLocaleString() : 'N/A'}`, 14, 50);
    doc.text(`Status: ${activeThread.status.toUpperCase()}`, 14, 55);
    
    const tableData = messages.map(msg => [
      msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleString() : 'Pending',
      msg.sender === 'admin' ? 'Richards Advisory' : activeThread.visitorName,
      msg.text
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['Timestamp', 'Sender', 'Message']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [10, 29, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40 },
        2: { cellWidth: 'auto' }
      },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    doc.save(`Transcript_${activeThread.visitorName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setAuthError(true);
        return;
      }

      const path = 'supportThreads';
      const q = query(collection(db, path), orderBy('lastMessageAt', 'desc'));
      const unsubscribeSnap = onSnapshot(q, (snapshot) => {
        const threadList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SupportThread));
        setThreads(threadList);
        setAuthError(false);
      }, (error) => {
        if (error.code === 'permission-denied') {
          setAuthError(true);
        } else {
          try {
            handleFirestoreError(error, OperationType.LIST, path);
          } catch (e) {
            // Logged to console via handleFirestoreError
          }
        }
      });

      return () => unsubscribeSnap();
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (activeThreadId) {
      const q = query(
        collection(db, 'supportThreads', activeThreadId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SupportMessage));
        
        // Play sound for incoming visitor messages
        if (msgs.length > lastMessageCountRef.current) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.sender === 'visitor') {
            visitorMsgSound.current.play().catch(() => {});
          }
          lastMessageCountRef.current = msgs.length;
        }
        
        setMessages(msgs);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, `supportThreads/${activeThreadId}/messages`);
      });
      return () => unsubscribe();
    } else {
      lastMessageCountRef.current = 0;
    }
  }, [activeThreadId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const activeThread = threads.find(t => t.id === activeThreadId);

  const handleTyping = () => {
    if (!activeThreadId) return;
    
    if (!isAdminTyping) {
      setIsAdminTyping(true);
      updateDoc(doc(db, 'supportThreads', activeThreadId), { adminTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsAdminTyping(false);
      if (activeThreadId) {
        updateDoc(doc(db, 'supportThreads', activeThreadId), { adminTyping: false });
      }
    }, 3000);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !activeThreadId) return;

    const currentReply = reply;
    setReply('');
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsAdminTyping(false);

    try {
      adminSendSound.current.play().catch(() => {});
      
      await addDoc(collection(db, 'supportThreads', activeThreadId, 'messages'), {
        text: currentReply,
        sender: 'admin',
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'supportThreads', activeThreadId), {
        lastMessageAt: serverTimestamp(),
        lastMessageText: currentReply,
        status: 'active',
        adminTyping: false
      });
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  useEffect(() => {
    const INACTIVITY_LIMIT = 5 * 60 * 1000;
    const interval = setInterval(async () => {
      const now = Date.now();
      const inactiveThreads = threads.filter(t => {
        if (t.status === 'resolved' || !t.lastMessageAt) return false;
        return (now - t.lastMessageAt.toMillis()) > INACTIVITY_LIMIT;
      });

      for (const thread of inactiveThreads) {
        try {
          await updateDoc(doc(db, 'supportThreads', thread.id), {
            status: 'resolved',
            lastMessageText: '[System: Auto-resolved due to inactivity]'
          });
        } catch (err) {
          console.error("Auto-close failed for thread:", thread.id, err);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [threads]);

  const handleResolveThread = async (threadId: string) => {
    try {
      await updateDoc(doc(db, 'supportThreads', threadId), {
        status: 'resolved'
      });
    } catch (err) {
      console.error("Error resolving thread:", err);
    }
  };

  const handleCloseThread = async (threadId: string) => {
    try {
      await updateDoc(doc(db, 'supportThreads', threadId), {
        status: 'resolved',
        lastMessageText: '[System: Admin closed inactive session]'
      });
      if (activeThreadId === threadId) {
        setActiveThreadId(null);
      }
    } catch (err) {
      console.error("Error closing thread:", err);
    }
  };

  const filteredThreads = threads.filter(t => 
    t.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full bg-[#F4F7F9] dark:bg-slate-950 border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in duration-200 rounded-none">
      {/* Threads Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-slate-800 space-y-3">
          <h3 className="font-serif font-bold text-[#0A1D37] dark:text-white text-sm uppercase tracking-tight">Support Threads</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-8 py-2 text-[11px] text-[#0A1D37] dark:text-white focus:outline-none focus:border-[#C5A02E] rounded-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 mx-auto flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-gray-300 dark:text-slate-600" />
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-relaxed">No conversations found</p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <button 
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full p-4 border-b border-gray-100 dark:border-slate-800 text-left transition-all flex items-start gap-3 hover:bg-[#F4F7F9] dark:hover:bg-slate-800 cursor-pointer ${activeThreadId === thread.id ? 'bg-[#F4F7F9] dark:bg-slate-800 border-r-4 border-r-[#C5A02E]' : ''}`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-none flex items-center justify-center text-[10px] font-bold ${activeThreadId === thread.id ? 'bg-[#C5A02E] text-white' : 'bg-[#0A1D37] text-white'}`}>
                  {thread.visitorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-[#0A1D37] dark:text-slate-200 truncate">{thread.visitorName}</span>
                    <span className="text-[9px] text-gray-400 uppercase font-sans">
                      {thread.lastMessageAt ? new Date(thread.lastMessageAt.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mb-2">{thread.lastMessageText || 'No messages'}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-wider ${
                      thread.status === 'open' ? 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-900' :
                      thread.status === 'active' ? 'bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-900' :
                      'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-900'
                    }`}>
                      {thread.status}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-900">
        {authError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 p-12 bg-white dark:bg-slate-900 z-20">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-none flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-rose-500" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h5 className="font-serif font-bold text-[#0A1D37] dark:text-white text-lg uppercase tracking-tight">Access Denied</h5>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-sans">
                Your account does not have sufficient permissions to view live support threads. Please ensure you are signed in with an authorized corporate administrator account via Google SSO.
              </p>
            </div>
          </div>
        ) : activeThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-slate-800 bg-[#F4F7F9]/30 dark:bg-slate-800/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#0A1D37] dark:bg-[#C5A02E] text-white flex items-center justify-center text-xs font-bold">
                  {activeThread.visitorName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#0A1D37] dark:text-white text-sm uppercase tracking-tight">{activeThread.visitorName}</h4>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-sans">{activeThread.visitorEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleDownloadTranscript}
                  disabled={messages.length === 0}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#0A1D37] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 text-[10px] font-bold uppercase transition-all cursor-pointer disabled:opacity-50"
                  title="Download PDF Transcript"
                >
                  <Download className="h-3.5 w-3.5" /> Transcript
                </button>
                {activeThread.status !== 'resolved' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResolveThread(activeThread.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-[10px] font-bold uppercase transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
                    </button>
                    <button 
                      onClick={() => handleCloseThread(activeThread.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-[10px] font-bold uppercase transition-all cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" /> Close Session
                    </button>
                  </div>
                )}
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 block uppercase font-bold">Inquiry Start</span>
                  <span className="text-[10px] text-[#0A1D37] dark:text-slate-300 font-sans">
                    {activeThread.createdAt ? new Date(activeThread.createdAt.toDate()).toLocaleString() : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-[9px] font-bold text-[#0A1D37] dark:text-slate-300 uppercase tracking-widest">
                      {msg.sender === 'admin' ? 'Richards Advisory Team' : activeThread.visitorName}
                    </span>
                    <span className="text-[9px] text-gray-400 font-sans">•</span>
                    <span className="text-[9px] text-gray-400 font-sans">
                      {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString() : '...'}
                    </span>
                  </div>
                  <div className={`max-w-[70%] p-4 text-xs leading-relaxed shadow-sm border ${
                    msg.sender === 'admin' 
                      ? 'bg-[#0A1D37] dark:bg-[#C5A02E] text-white border-[#0A1D37] dark:border-[#C5A02E] rounded-none' 
                      : 'bg-[#F4F7F9] dark:bg-slate-800 text-[#0A1D37] dark:text-white border-gray-200 dark:border-slate-700 rounded-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {activeThread.visitorTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-2 rounded-none shadow-sm flex gap-1 items-center">
                    <div className="w-1 h-1 bg-[#C5A02E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-[#C5A02E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-[#C5A02E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] text-gray-400 dark:text-slate-500 ml-1 font-sans italic">Visitor typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl relative z-10">
              {activeThread.status === 'resolved' ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 p-3 text-center text-emerald-700 dark:text-emerald-400 text-xs font-medium font-sans flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> This conversation has been marked as resolved.
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="flex gap-2">
                  <textarea 
                    rows={2}
                    value={reply}
                    onChange={(e) => {
                      setReply(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your official response here..."
                    className="flex-1 bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-4 py-3 text-xs text-[#0A1D37] dark:text-white focus:outline-none focus:border-[#C5A02E] rounded-none resize-none"
                  />
                  <button 
                    type="submit"
                    disabled={!reply.trim()}
                    className="bg-[#C5A02E] hover:bg-[#A68625] disabled:bg-gray-300 dark:disabled:bg-slate-800 text-white px-6 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer flex flex-col items-center justify-center gap-1"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send</span>
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 p-12">
            <div className="w-20 h-20 bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-none flex items-center justify-center">
              <MessageSquare className="h-10 w-10 text-[#C5A02E] opacity-50" />
            </div>
            <div className="space-y-2 max-w-md">
              <h5 className="font-serif font-bold text-[#0A1D37] dark:text-white text-lg uppercase tracking-tight">Support Terminal</h5>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-sans">
                Select a conversation thread from the sidebar to view visitor details and provide real-time assistance. New incoming inquiries will appear at the top.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm pt-4">
              <div className="p-4 bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Unresolved</span>
                <p className="text-2xl font-bold text-[#C5A02E] font-sans">{threads.filter(t => t.status !== 'resolved').length}</p>
              </div>
              <div className="p-4 bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-gray-400 block uppercase font-bold">Resolved Today</span>
                <p className="text-2xl font-bold text-[#0A1D37] dark:text-white font-sans">{threads.filter(t => t.status === 'resolved').length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
