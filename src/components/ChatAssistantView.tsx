import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileText,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Paperclip,
  Share2,
  ExternalLink,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { Conversation, ChatMessage, User } from '../types';

interface ChatAssistantViewProps {
  currentUser: User | null;
  onSendToDocumentBuilder: (text: string, title?: string) => void;
  initialPrompt?: string;
}

export const ChatAssistantView: React.FC<ChatAssistantViewProps> = ({
  currentUser,
  onSendToDocumentBuilder,
  initialPrompt,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    fetchConversations();
  }, [currentUser?.id]);

  useEffect(() => {
    if (initialPrompt) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
        } else if (data.length === 0) {
          handleNewConversation();
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages, loading]);

  const handleNewConversation = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({ title: 'Yangi xizmat suhbati' }),
      });
      if (res.ok) {
        const newConv = await res.json();
        setConversations([newConv, ...conversations]);
        setActiveConvId(newConv.id);
      }
    } catch (err) {
      console.error('New conversation error:', err);
    }
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/conversations/${convId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (res.ok) {
        const filtered = conversations.filter((c) => c.id !== convId);
        setConversations(filtered);
        if (activeConvId === convId) {
          setActiveConvId(filtered.length > 0 ? filtered[0].id : null);
        }
      }
    } catch (err) {
      console.error('Delete conversation error:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId || loading) return;

    setInputText('');
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConvId ? data.conversation : c))
        );
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyHelper = (helperType: 'proofread' | 'formalize' | 'summarize' | 'explain') => {
    setActionMenuOpen(false);
    let promptPrefix = '';
    switch (helperType) {
      case 'proofread':
        promptPrefix = 'Iltimos, quyidagi xizmat matnini imlo, grammatika va tinish belgilari bo‘yicha tekshirib to‘g‘rilab ber:\n\n';
        break;
      case 'formalize':
        promptPrefix = 'Quyidagi matnni Ichki ishlar organlarining rasmiy-idoraviy tiliga moslashtirib qayta yozib ber:\n\n';
        break;
      case 'summarize':
        promptPrefix = 'Quyidagi uzun xizmat matnini qisqartirib, asosiy tezislar va faktlarni ajratib ber:\n\n';
        break;
      case 'explain':
        promptPrefix = 'Quyidagi me’yoriy band yoki yo‘riqnoma mohiyatini xodimga tushunarli tarzda tushuntirib ber:\n\n';
        break;
    }
    setInputText(promptPrefix);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col md:flex-row bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Sidebar: Conversation history */}
      <div className="w-full md:w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={handleNewConversation}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Yangi suhbat ochish
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Suhbatlar tarixi
          </div>
          {conversations.map((conv) => {
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className={`group px-3 py-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition ${
                  isActive
                    ? 'bg-blue-900/40 text-blue-200 border border-blue-700/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{conv.title}</span>
                </div>
                {conversations.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteConversation(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition"
                    title="Suhbatni o‘chirish"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Security & AI Model indicator */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-sky-400">
              <Sparkles className="w-3 h-3" />
              Gemini 3.8 Flash
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Server-Side</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Me’yoriy hujjatlar va IIV talablari asosida sinxronlangan
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
        {/* Chat Header with Quick Actions Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activeConv?.title || 'Xizmat muloqoti'}</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Lotin yozuvi
              </span>
            </h2>
          </div>

          {/* Quick AI Tools Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => handleApplyHelper('proofread')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5 shrink-0"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Imlo tekshirish</span>
            </button>
            <button
              onClick={() => handleApplyHelper('formalize')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Rasmiy uslub</span>
            </button>
            <button
              onClick={() => handleApplyHelper('summarize')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5 shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Qisqartirish</span>
            </button>
            <button
              onClick={() => handleApplyHelper('explain')}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5 shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>Moddani tushuntirish</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConv?.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 border border-blue-500/40 text-sky-400'
                  }`}
                >
                  {isUser ? currentUser?.avatar || 'X' : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-md w-full'
                  }`}
                >
                  {/* Sender & Time */}
                  <div className="flex items-center justify-between text-[11px] mb-2 text-slate-400 pb-1 border-b border-slate-800/60">
                    <span className="font-semibold text-slate-300">
                      {isUser ? `${currentUser?.rank} ${currentUser?.fullName}` : 'IIV AI Yordamchi'}
                    </span>
                    <span className="font-mono text-[10px]">
                      {new Date(msg.timestamp).toLocaleTimeString('uz-UZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Body text */}
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>

                  {/* RAG Sources Card */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Tasdiqlangan me’yoriy manbalar:
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.sources.map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300"
                          >
                            <div className="font-semibold text-blue-300 flex items-center justify-between">
                              <span>{src.docTitle}</span>
                              <span className="font-mono text-slate-400 text-[10px]">{src.article}</span>
                            </div>
                            <p className="text-slate-400 mt-0.5 text-[10px] italic">
                              "{src.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Bar for AI Messages */}
                  {!isUser && (
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center gap-1 text-[11px]"
                          title="Matndan nusxa olish"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Nusxalandi</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Nusxa olish</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleSendMessage(activeConv?.messages.slice(-2)[0]?.text || '')}
                          className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center gap-1 text-[11px]"
                          title="Javobni qayta shakllantirish"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Qayta yaratish</span>
                        </button>
                      </div>

                      {/* Send to Document Builder */}
                      <button
                        onClick={() => onSendToDocumentBuilder(msg.text, activeConv?.title)}
                        className="px-2.5 py-1 rounded bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border border-blue-700/60 transition flex items-center gap-1.5 text-[11px] font-semibold"
                        title="Ushbu matnni Hujjat yaratish moduliga o‘tkazish"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-400" />
                        <span>Hujjatga o‘tkazish &rarr;</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-4xl">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-blue-500/40 text-sky-400 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-4 text-xs text-slate-400 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>IIV me’yoriy bazasi va talablari asosida tahlil qilinmoqda...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form & Legal Disclaimer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Savolingizni yoki xizmat matnini o‘zbek tilida (lotin yozuvida) yozing..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="h-12 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition shadow-sm font-semibold shrink-0"
              title="Yuborish"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Institutional Compliance Disclaimer */}
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
            <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
            <span>
              AI tomonidan berilgan javoblar va hujjat qoralamalari rasmiy tasdiq hisoblanmaydi; vakolatli rahbar imzosi zarur. AI faktlarni to‘qib chiqarmaydi.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
