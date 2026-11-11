import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, ChevronLeft } from 'lucide-react';
import { 
  collection, addDoc, serverTimestamp, query, orderBy, 
  onSnapshot, doc, updateDoc, getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SupportThread, SupportMessage } from '../types';

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'welcome' | 'form' | 'chat'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(localStorage.getItem('support_thread_id'));
  const [threadData, setThreadData] = useState<SupportThread | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef(0);

  const adminReplySound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'));
  const userSendSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'));

  useEffect(() => {
    if (activeThreadId) {
      setStep('chat');
      const threadRef = doc(db, 'supportThreads', activeThreadId);
      
      const unsubscribeThread = onSnapshot(threadRef, (doc) => {
        if (doc.exists()) {
          setThreadData({ id: doc.id, ...doc.data() } as SupportThread);
        }
      });

      const q = query(
        collection(db, 'supportThreads', activeThreadId, 'messages'),
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SupportMessage));
        
        // Play sound if new message from admin
        if (msgs.length > lastMessageCountRef.current) {
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg.sender === 'admin') {
            adminReplySound.current.play().catch(() => {});
          }
          lastMessageCountRef.current = msgs.length;
        }
        
        setMessages(msgs);
      });

      return () => {
        unsubscribeThread();
        unsubscribeMessages();
      };
    }
  }, [activeThreadId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    try {
      const threadRef = await addDoc(collection(db, 'supportThreads'), {
        visitorName: name,
        visitorEmail: email,
        status: 'open',
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        lastMessageText: 'Conversation started'
      });

      localStorage.setItem('support_thread_id', threadRef.id);
      setActiveThreadId(threadRef.id);
      setStep('chat');
    } catch (err) {
      console.error("Error starting chat:", err);
    }
  };

  useEffect(() => {
    if (!activeThreadId || step !== 'chat') return;

    const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes in ms
    const checkInterval = setInterval(async () => {
      try {
        const threadDoc = await getDoc(doc(db, 'supportThreads', activeThreadId));
        if (!threadDoc.exists()) return;

        const data = threadDoc.data() as SupportThread;
        if (data.status === 'resolved') {
          setActiveThreadId(null);
          localStorage.removeItem('support_thread_id');
          setStep('welcome');
          return;
        }

        const lastActive = data.lastMessageAt?.toMillis() || Date.now();
        const now = Date.now();

        if (now - lastActive > INACTIVITY_LIMIT) {
          await updateDoc(doc(db, 'supportThreads', activeThreadId), {
            status: 'resolved',
            lastMessageText: '[System: Chat closed due to inactivity]'
          });
          setActiveThreadId(null);
          localStorage.removeItem('support_thread_id');
          setStep('welcome');
        }
      } catch (err) {
        console.error("Auto-close check failed:", err);
      }
    }, 30000); // Check every 30s

    return () => clearInterval(checkInterval);
  }, [activeThreadId, step]);

  const handleTyping = () => {
    if (!activeThreadId) return;
    
    if (!isTyping) {
      setIsTyping(true);
      updateDoc(doc(db, 'supportThreads', activeThreadId), { visitorTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (activeThreadId) {
        updateDoc(doc(db, 'supportThreads', activeThreadId), { visitorTyping: false });
      }
    }, 3000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeThreadId) return;

    const currentMsg = message;
    setMessage('');
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);

    try {
      userSendSound.current.play().catch(() => {});
      
      await addDoc(collection(db, 'supportThreads', activeThreadId, 'messages'), {
        text: currentMsg,
        sender: 'visitor',
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'supportThreads', activeThreadId), {
        lastMessageAt: serverTimestamp(),
        lastMessageText: currentMsg,
        status: 'active',
        visitorTyping: false
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const toggleWidget = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 rounded-none overflow-hidden">
          {/* Header */}
          <div className="bg-[#0A1D37] text-white p-4 flex items-center justify-between border-b border-[#C5A02E]/30 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-[#C5A02E] rounded-none flex items-center justify-center shadow">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0A1D37] animate-pulse"></span>
              </div>
              <div>
                <h4 className="font-serif font-extrabold text-sm uppercase tracking-wider text-white">Customer Support</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                  <span className="text-[10px] text-emerald-300 font-sans font-bold uppercase tracking-widest">Live • RICS Certified Advisory</span>
                </div>
              </div>
            </div>
            <button onClick={toggleWidget} className="text-gray-400 hover:text-white transition-colors cursor-pointer p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative">
            {step === 'welcome' && (
              <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-none flex items-center justify-center shadow-inner">
                  <MessageCircle className="h-8 w-8 text-[#C5A02E]" />
                </div>
                <div className="space-y-2">
                  <h5 className="font-serif font-bold text-[#0A1D37] dark:text-white text-lg uppercase tracking-tight">How can we assist your enterprise?</h5>
                  <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-sans px-4">
                    Connect instantly with our managing directors and chartered surveyors for real-time portfolio inquiries.
                  </p>
                </div>
                <button 
                  onClick={() => setStep('form')}
                  className="w-full bg-[#C5A02E] hover:bg-[#A68625] text-white font-bold text-xs py-3.5 rounded-none transition-all uppercase tracking-widest cursor-pointer shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                >
                  Start Live Session
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 dark:text-slate-500 font-sans">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  <span>Typical response time: Under 2 minutes</span>
                </div>
              </div>
            )}

            {step === 'form' && (
              <div className="absolute inset-0 p-8 flex flex-col justify-center animate-in slide-in-from-right-4 duration-300">
                <button onClick={() => setStep('welcome')} className="absolute top-4 left-4 text-gray-400 hover:text-[#0A1D37] dark:hover:text-white flex items-center gap-1 text-[10px] uppercase font-bold cursor-pointer">
                  <ChevronLeft className="h-3 w-3" /> Back
                </button>
                <form onSubmit={handleStartChat} className="space-y-4">
                  <h5 className="font-serif font-bold text-[#0A1D37] dark:text-white text-sm uppercase tracking-tight mb-2">Visitor Identification</h5>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-sans font-bold tracking-wider text-gray-500 dark:text-slate-400">Full Name <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Johnathan Richards"
                      className="w-full bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-xs text-[#0A1D37] dark:text-white focus:outline-none focus:border-[#C5A02E] rounded-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-sans font-bold tracking-wider text-gray-500 dark:text-slate-400">Professional Email <span className="text-rose-500">*</span></label>
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="w-full bg-[#F4F7F9] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3 py-2.5 text-xs text-[#0A1D37] dark:text-white focus:outline-none focus:border-[#C5A02E] transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-[#0A1D37] dark:bg-[#C5A02E] hover:bg-[#1a2f4d] dark:hover:bg-[#A68625] text-white font-bold text-xs py-3.5 rounded-none transition-all uppercase tracking-widest cursor-pointer shadow-lg mt-4"
                  >
                    Enter Secure Chat Room
                  </button>
                </form>
              </div>
            )}

            {step === 'chat' && (
              <div className="flex flex-col h-full animate-in fade-in duration-300">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F4F7F9]/30 dark:bg-slate-950/30">
                  {messages.length === 0 && (
                    <div className="text-center py-10 opacity-60 space-y-2">
                      <div className="w-8 h-8 bg-[#C5A02E]/20 text-[#C5A02E] rounded-full flex items-center justify-center mx-auto">
                        <MessageCircle className="h-4 w-4" />
                      </div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 tracking-widest">Connected with Richards Advisory</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.sender === 'visitor' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] p-3.5 text-xs leading-relaxed shadow-sm ${
                        msg.sender === 'visitor' 
                          ? 'bg-[#C5A02E] text-white rounded-none font-sans font-medium' 
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-[#0A1D37] dark:text-white rounded-none font-sans font-medium'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-gray-400 dark:text-slate-500 mt-1 uppercase font-sans tracking-wider tabular-nums">
                        {msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                      </span>
                    </div>
                  ))}
                  {threadData?.adminTyping && (
                    <div className="flex flex-col items-start">
                      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-2.5 rounded-none shadow-sm flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-[#C5A02E] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-[#C5A02E] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-[#C5A02E] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[10px] text-gray-400 ml-1 font-sans italic font-semibold">Advisory agent typing...</span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900 shadow-xl">
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type your message to the advisor..."
                    className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-3.5 py-2.5 text-xs text-[#0A1D37] dark:text-white focus:outline-none focus:border-[#C5A02E] rounded-none font-sans"
                  />
                  <button 
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-[#0A1D37] dark:bg-[#C5A02E] hover:bg-[#1a2f4d] dark:hover:bg-[#A68625] disabled:opacity-45 text-white px-4 py-2.5 rounded-none transition-all cursor-pointer flex items-center justify-center shadow-md font-bold text-xs uppercase tracking-wider"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={toggleWidget}
        className="w-14 h-14 bg-[#C5A02E] hover:bg-[#A68625] text-white rounded-none shadow-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer group"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7 group-hover:rotate-12 transition-transform" />}
      </button>
    </div>
  );
}
