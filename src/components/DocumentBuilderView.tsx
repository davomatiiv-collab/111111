import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Sparkles,
  Save,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  History,
  Send,
  Eye,
  Trash2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
  FileCheck,
} from 'lucide-react';
import {
  DocumentItem,
  DocumentTemplate,
  DocumentType,
  DocumentStatus,
  User,
} from '../types';
import { DocumentPrintModal } from './DocumentPrintModal';

interface DocumentBuilderViewProps {
  currentUser: User | null;
  onRefreshDashboard?: () => void;
  incomingDraftText?: string | null;
  incomingDraftTitle?: string | null;
  initialSelectedDoc?: DocumentItem | null;
}

export const DocumentBuilderView: React.FC<DocumentBuilderViewProps> = ({
  currentUser,
  onRefreshDashboard,
  incomingDraftText,
  incomingDraftTitle,
  initialSelectedDoc,
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'versions'>('details');

  // Form states for active document
  const [docType, setDocType] = useState<DocumentType>('xizmat_xati');
  const [title, setTitle] = useState('');
  const [docNumber, setDocNumber] = useState('');
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<DocumentStatus>('Qoralama');
  const [aiAssisted, setAiAssisted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // AI Generator prompt modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiBackground, setAiBackground] = useState('');
  const [aiFacts, setAiFacts] = useState('');
  const [aiProposals, setAiProposals] = useState('');
  const [aiCustomReqs, setAiCustomReqs] = useState('');

  // Print modal
  const [printDoc, setPrintDoc] = useState<DocumentItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Review comment modal for Rahbar
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'Tasdiqlangan' | 'Qaytarilgan'>('Tasdiqlangan');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    fetchDocuments();
    fetchTemplates();
  }, [currentUser?.id]);

  useEffect(() => {
    if (initialSelectedDoc) {
      handleSelectDocument(initialSelectedDoc);
    }
  }, [initialSelectedDoc]);

  // Handle incoming draft sent from chat
  useEffect(() => {
    if (incomingDraftText) {
      handleCreateNew();
      setContent(incomingDraftText);
      if (incomingDraftTitle) {
        setTitle(incomingDraftTitle);
      }
      setAiAssisted(true);
    }
  }, [incomingDraftText, incomingDraftTitle]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents', {
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Fetch documents error:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/documents/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Fetch templates error:', err);
    }
  };

  const handleCreateNew = (template?: DocumentTemplate) => {
    setSelectedDoc(null);
    setDocType(template ? template.docType : 'xizmat_xati');
    setTitle(template ? template.title : 'Yangi xizmat xati');
    setDocNumber(`IIV-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
    setRecipient('Toshkent shahar IIBB HPB boshlig‘i mayor A.X. Rustamovga');
    setContent(template ? template.defaultStructure : '');
    setSummary('');
    setStatus('Qoralama');
    setAiAssisted(false);
    setViewMode('editor');
  };

  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setDocType(doc.docType);
    setTitle(doc.title);
    setDocNumber(doc.docNumber);
    setRecipient(doc.recipient);
    setContent(doc.content);
    setSummary(doc.summary);
    setStatus(doc.status);
    setAiAssisted(doc.aiAssisted);
    setViewMode('editor');
  };

  const handleSaveDocument = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Iltimos, sarlavha va hujjat matnini to‘ldiring');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        docType,
        docNumber,
        recipient,
        content,
        summary: summary || title,
        aiAssisted,
      };

      let res;
      if (selectedDoc) {
        res = await fetch(`/api/documents/${selectedDoc.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser?.id || '',
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/documents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUser?.id || '',
          },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        const savedDoc = await res.json();
        setSelectedDoc(savedDoc);
        fetchDocuments();
        if (onRefreshDashboard) onRefreshDashboard();
      }
    } catch (err) {
      console.error('Save document error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangeStatus = async (newStatus: DocumentStatus, comment?: string) => {
    if (!selectedDoc) return;

    try {
      const res = await fetch(`/api/documents/${selectedDoc.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          status: newStatus,
          reviewComment: comment,
          reviewerId: currentUser?.role === 'rahbar' ? currentUser.id : undefined,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedDoc(updated);
        setStatus(updated.status);
        fetchDocuments();
        if (onRefreshDashboard) onRefreshDashboard();
      }
    } catch (err) {
      console.error('Change status error:', err);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Haqiqatdan ham ushbu hujjatni o‘chirmoqchimisiz?')) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (res.ok) {
        fetchDocuments();
        if (selectedDoc?.id === docId) {
          setViewMode('list');
          setSelectedDoc(null);
        }
        if (onRefreshDashboard) onRefreshDashboard();
      }
    } catch (err) {
      console.error('Delete doc error:', err);
    }
  };

  const handleGenerateAiDraft = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/documents/generate-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          docType,
          title,
          recipient,
          sender: `${currentUser?.rank} ${currentUser?.fullName}`,
          background: aiBackground,
          facts: aiFacts,
          proposals: aiProposals,
          customRequirements: aiCustomReqs,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setContent(data.draftText);
        setAiAssisted(true);
        setShowAiModal(false);
      }
    } catch (err) {
      console.error('Generate AI draft error:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleExportTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_')}_${docNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filtered documents
  const filteredDocs = documents.filter((doc) => {
    const matchesStatus = filterStatus === 'Barchasi' || doc.status === filterStatus;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.creatorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Hujjatlar Boshqaruvi va Konstruktori
            </h1>
            <p className="text-xs text-slate-400">
              Xizmat xatlari, bildirgi, ma’lumotnoma va hisobotlar qoralamalarini tayyorlash
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {viewMode === 'editor' && (
            <button
              onClick={() => setViewMode('list')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
            >
              &larr; Hujjatlar ro‘yxati
            </button>
          )}
          <button
            onClick={() => handleCreateNew()}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Yangi qoralama tuzish
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* ==================== LIST VIEW ==================== */
        <div className="space-y-4">
          {/* Official Templates Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Tasdiqlangan Hujjat Shablonlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleCreateNew(tpl)}
                  className="bg-slate-950/60 border border-slate-800 hover:border-blue-600/60 hover:bg-blue-950/20 p-3 rounded-xl cursor-pointer transition group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-blue-300 block mb-1">
                      {tpl.title}
                    </span>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-blue-400 font-semibold">
                    <span>Shablonni tanlash</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hujjat nomi, raqami yoki xodim bo‘yicha qidiruv..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filter by status */}
            <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
              {['Barchasi', 'Qoralama', 'Tekshiruvda', 'Tasdiqlangan', 'Qaytarilgan'].map(
                (st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                      filterStatus === st
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Hujjat Raqami & Nomi</th>
                    <th className="py-3 px-4">Turi</th>
                    <th className="py-3 px-4">Ijrochi / Bo‘lim</th>
                    <th className="py-3 px-4">Holati</th>
                    <th className="py-3 px-4">Sana</th>
                    <th className="py-3 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-800/40 transition group cursor-pointer"
                        onClick={() => handleSelectDocument(doc)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {doc.docNumber}
                            </span>
                            <span className="font-semibold text-slate-200 group-hover:text-sky-300 transition">
                              {doc.title}
                            </span>
                            {doc.aiAssisted && (
                              <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
                                AI
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 capitalize">
                          {doc.docType.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div>{doc.creatorRank} {doc.creatorName}</div>
                          <div className="text-[10px] text-slate-400">{doc.department}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] border ${
                              doc.status === 'Tasdiqlangan'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : doc.status === 'Tekshiruvda'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : doc.status === 'Qaytarilgan'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(doc.createdAt).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div
                            className="flex items-center justify-end space-x-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setPrintDoc(doc)}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                              title="Chop etish ko‘rinishi"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSelectDocument(doc)}
                              className="p-1.5 text-slate-400 hover:text-sky-400 rounded hover:bg-slate-800 transition"
                              title="Tahrirlash"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {(currentUser?.role === 'admin' ||
                              (doc.creatorId === currentUser?.id && doc.status === 'Qoralama')) && (
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
                                title="O‘chirish"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        Hujjatlar topilmadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== EDITOR VIEW ==================== */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 spans): Document Editor */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              {/* Form fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Hujjat Turi
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="xizmat_xati">Xizmat xati (Bildirgi)</option>
                    <option value="tushuntirish_xati">Tushuntirish xati</option>
                    <option value="malumotnoma">Ma’lumotnoma (Spravka)</option>
                    <option value="hisobot">Xizmat hisoboti</option>
                    <option value="yigilish_bayonnomasi">Yig‘ilish bayonnomasi loyihasi</option>
                    <option value="qaror_loyihasi">Qaror loyihasi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Ro‘yxatga olish raqami
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Hujjat Sarlavhasi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Yunusobod tumani tungi reyd natijalari bo‘yicha bildirgi"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Qabul qiluvchi (Kimga)
                </label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Toshkent shahar IIBB HPB boshlig‘i mayor A.X. Rustamovga"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Editor Content Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Hujjat Asosiy Matni
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAiModal(true)}
                      className="px-2.5 py-1 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI bilan qoralama tuzish</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs sm:text-sm text-slate-100 font-serif leading-relaxed focus:outline-none focus:border-blue-500 resize-y"
                  placeholder="Hujjat rasmiy matnini kiriting..."
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                  <span>Belgilar soni: {content.length} | So‘zlar: {content.trim().split(/\s+/).filter(Boolean).length}</span>
                  {aiAssisted && (
                    <span className="text-sky-400 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3" />
                      AI ko‘magida tuzilgan
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveDocument}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saqlanmoqda...' : 'Saqlash'}</span>
                  </button>

                  <button
                    onClick={handleCopyContent}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Nusxalandi' : 'Nusxa olish'}</span>
                  </button>

                  <button
                    onClick={handleExportTxt}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>TXT yuklash</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrintDoc({
                        id: selectedDoc?.id || 'doc-preview',
                        title,
                        docType,
                        docNumber,
                        recipient,
                        content,
                        summary: summary || title,
                        status,
                        creatorId: currentUser?.id || 'usr-2',
                        creatorName: currentUser?.fullName || '',
                        creatorRank: currentUser?.rank || '',
                        department: currentUser?.department || '',
                        aiAssisted,
                        createdAt: selectedDoc?.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        tags: [],
                        versions: [],
                      });
                    }}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Chop etish / PDF</span>
                  </button>
                </div>

                {/* Workflow Transitions */}
                <div className="flex items-center space-x-2">
                  {status === 'Qoralama' && (
                    <button
                      onClick={() => handleChangeStatus('Tekshiruvda')}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Send className="w-4 h-4" />
                      <span>Tekshiruvga yuborish</span>
                    </button>
                  )}

                  {/* Rahbar Actions */}
                  {currentUser?.role === 'rahbar' && status === 'Tekshiruvda' && (
                    <>
                      <button
                        onClick={() => {
                          setReviewAction('Tasdiqlangan');
                          setReviewModalOpen(true);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Tasdiqlash</span>
                      </button>
                      <button
                        onClick={() => {
                          setReviewAction('Qaytarilgan');
                          setReviewModalOpen(true);
                        }}
                        className="px-3 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        <span>Qaytarish</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (1 span): Document Metadata & Versions */}
          <div className="space-y-4">
            {/* Document Status & Details Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Hujjat Maqomi
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                    status === 'Tasdiqlangan'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : status === 'Tekshiruvda'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : status === 'Qaytarilgan'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Ijrochi:</span>
                  <span className="font-semibold">{selectedDoc?.creatorRank || currentUser?.rank} {selectedDoc?.creatorName || currentUser?.fullName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Bo‘lim:</span>
                  <span className="text-right text-slate-300">{currentUser?.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Yaratilgan:</span>
                  <span className="font-mono text-slate-400">
                    {selectedDoc
                      ? new Date(selectedDoc.createdAt).toLocaleDateString('uz-UZ')
                      : 'Hozir'}
                  </span>
                </div>
                {selectedDoc?.reviewerName && (
                  <div className="py-2 px-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-semibold text-blue-300">
                      Ko‘rib chiquvchi: {selectedDoc.reviewerName}
                    </p>
                    {selectedDoc.reviewComment && (
                      <p className="text-[11px] text-slate-400 italic">
                        "{selectedDoc.reviewComment}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Legal Warning Notice */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/40 text-[11px] text-amber-200/90 leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Eslatma:</strong> AI yordamida shakllantirilgan har qanday matn dastlabki qoralama hisoblanadi. Hujjat rasmiy hisoblanishi uchun bo‘lim boshlig‘ining elektron imzosi va tasdig‘i olinishi shart.
                </span>
              </div>
            </div>

            {/* Version History */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4 text-slate-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Tahrirlar Tarixi (Versiyalar)
                  </h4>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                  {selectedDoc?.versions?.length || 0} ta
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedDoc?.versions && selectedDoc.versions.length > 0 ? (
                  selectedDoc.versions.map((ver) => (
                    <div
                      key={ver.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-sky-400">
                          Versiya #{ver.versionNumber}
                        </span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          {new Date(ver.modifiedAt).toLocaleTimeString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{ver.changeSummary}</p>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Tahrirchi: {ver.modifiedBy}
                      </div>
                      <button
                        onClick={() => {
                          setContent(ver.content);
                          alert(`Versiya #${ver.versionNumber} muharrirga yuklandi`);
                        }}
                        className="text-[10px] text-blue-400 hover:underline pt-1 block"
                      >
                        Ushbu versiyani qayta tiklash
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Oldingi versiyalar mavjud emas. Hujjat saqlanganda yangi versiya avtomatik yoziladi.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Draft Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  AI Aqlli Hujjat Qoralamasini Yaratish
                </h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Quyidagi parametrlarni kiriting. Server-side AI model O‘zbekiston IIV idoraviy hujjat talablari asosida to‘liq va savodli qoralama matnini shakllantiradi.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Asos va sabab (Tadbir, topshiriq yoki sana)
                </label>
                <input
                  type="text"
                  value={aiBackground}
                  onChange={(e) => setAiBackground(e.target.value)}
                  placeholder="Masalan: 2026-yil 22-oktyabr tungi profilaktik reyd tadbiri"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Asosiy faktlar va aniqlangan holatlar
                </label>
                <textarea
                  value={aiFacts}
                  onChange={(e) => setAiFacts(e.target.value)}
                  rows={3}
                  placeholder="Masalan: 4 ta obekt tekshirildi, 3 nafar fuqaro bilan profilaktik suhbat o‘tkazildi va rasmiy ogohlantirildi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Xulosalar va takliflar
                </label>
                <input
                  type="text"
                  value={aiProposals}
                  onChange={(e) => setAiProposals(e.target.value)}
                  placeholder="Masalan: Nazorat tadbirlarini reja asosida davom ettirish"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleGenerateAiDraft}
                disabled={aiGenerating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4 text-sky-300" />
                <span>{aiGenerating ? 'AI shakllantirmoqda...' : 'Qoralamani yaratish'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal (Rahbar tasdiqlash/qaytarish) */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>
                {reviewAction === 'Tasdiqlangan'
                  ? 'Hujjatni Tasdiqlash'
                  : 'Hujjatni Kamchiliklar Bilan Qaytarish'}
              </span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Rahbar xulosasi / izohi
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
                placeholder={
                  reviewAction === 'Tasdiqlangan'
                    ? 'Hujjat talablarga muvofiq, ijroga yo‘naltirildi.'
                    : 'Aniqlangan kamchiliklarni ko‘rsating...'
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  handleChangeStatus(reviewAction, reviewComment);
                  setReviewModalOpen(false);
                }}
                className={`px-4 py-2 text-white rounded-lg text-xs font-semibold ${
                  reviewAction === 'Tasdiqlangan'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {reviewAction === 'Tasdiqlangan' ? 'Tasdiqlash' : 'Qaytarish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {printDoc && (
        <DocumentPrintModal document={printDoc} onClose={() => setPrintDoc(null)} />
      )}
    </div>
  );
};
