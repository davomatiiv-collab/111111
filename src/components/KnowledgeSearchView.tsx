import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Shield,
  Layers,
  Copy,
  Check,
  X,
  Filter,
} from 'lucide-react';
import { KnowledgeDoc, User } from '../types';

interface KnowledgeSearchViewProps {
  currentUser: User | null;
}

export const KnowledgeSearchView: React.FC<KnowledgeSearchViewProps> = ({
  currentUser,
}) => {
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeDoc[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barchasi');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // RAG AI Question Answering State
  const [ragQuestion, setRagQuestion] = useState('');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragAnswer, setRagAnswer] = useState<string | null>(null);
  const [ragSources, setRagSources] = useState<any[]>([]);

  // Expanded document cards
  const [expandedDocIds, setExpandedDocIds] = useState<Record<string, boolean>>({});

  // Upload modal state (Admin / Rahbar)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<any>('Yo\'riqnoma');
  const [uploadNumber, setUploadNumber] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        setKnowledgeList(data);
        setSearchResults(data);
        // Expand first document by default
        if (data.length > 0) {
          setExpandedDocIds({ [data[0].id]: true });
        }
      }
    } catch (err) {
      console.error('Fetch knowledge error:', err);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(knowledgeList);
      setHasSearched(false);
      return;
    }

    setSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          query: searchQuery,
          category: selectedCategory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
        // Expand all matching documents
        const expanded: Record<string, boolean> = {};
        (data.results || []).forEach((d: any) => {
          expanded[d.id] = true;
        });
        setExpandedDocIds(expanded);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAskRAG = async () => {
    if (!ragQuestion.trim()) return;

    setRagLoading(true);
    setRagAnswer(null);
    setRagSources([]);

    try {
      const res = await fetch('/api/knowledge/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({ query: ragQuestion }),
      });

      if (res.ok) {
        const data = await res.json();
        setRagAnswer(data.answer);
        setRagSources(data.sources || []);
      }
    } catch (err) {
      console.error('Ask RAG error:', err);
    } finally {
      setRagLoading(false);
    }
  };

  const handleUploadNewDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadContent.trim()) {
      alert('Iltimos, hujjat nomi va matnini kiriting');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/knowledge/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          title: uploadTitle,
          category: uploadCategory,
          numberAndDate: uploadNumber,
          description: uploadDesc,
          rawContent: uploadContent,
        }),
      });

      if (res.ok) {
        alert('Hujjat muvaffaqiyatli indekslandi va qidiruv bazasiga kiritildi!');
        setUploadModalOpen(false);
        setUploadTitle('');
        setUploadContent('');
        setUploadNumber('');
        setUploadDesc('');
        fetchKnowledge();
      } else {
        const err = await res.json();
        alert(err.error || 'Yuklashda xatolik');
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedDocIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories = ['Barchasi', 'Qonun', 'Qaror', 'Buyruq', 'Yo\'riqnoma', 'Nizom'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Me’yoriy-Huquqiy Baza va Aqlli Qidiruv (RAG)
            </h1>
            <p className="text-xs text-slate-400">
              Qonunchilik, xizmat intizomi, yo‘riqnomalar va tasdiqlangan buyruqlar bo‘yicha aniq manbali tahlil
            </p>
          </div>
        </div>

        {/* Upload Doc button (Admin & Rahbar) */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'rahbar') && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>Yangi hujjat yuklash va indekslash</span>
          </button>
        )}
      </div>

      {/* AI RAG Smart Question Box */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-blue-800/40 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
              AI Aqlli Tahlil — Qonunchilik va Yo‘riqnomalar bo‘yicha Savol
            </h2>
          </div>
          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 font-semibold">
            RAG Grounding
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Xizmat faoliyatingizga oid savolni yozing. Tizim me’yoriy bazadagi aniq moddalarni qidiradi va tasdiqlangan manbalarga asoslanib tushuntirish beradi. To‘qib chiqarilgan ma’lumotlarga yo‘l qo‘yilmaydi.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={ragQuestion}
              onChange={(e) => setRagQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAskRAG();
              }}
              placeholder="Masalan: Jismoniy kuch ishlatishdan oldin qanday ogohlantirish berilishi kerak? (yoki xizmat intizomi Kodeksi bo‘yicha)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleAskRAG}
            disabled={ragLoading || !ragQuestion.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition shrink-0"
          >
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>{ragLoading ? 'Manbalar qidirilmoqda...' : 'Tahlil qilish'}</span>
          </button>
        </div>

        {/* Quick Sample Questions */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Namunaviy savollar:</span>
          {[
            'Jismoniy kuch ishlatish va o‘qotar qurol qo‘llash shartlari qanday?',
            'Bildirgi tuzishda qanday asosiy rekvizitlar kiritilishi shart?',
            'Fuqarolar bilan muloqotda odob-axloq Kodeksining asosiy talablari nimalardan iborat?',
            'Rasmiy ogohlantirish qanday tartibda e’lon qilinadi?',
          ].map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setRagQuestion(sample);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* RAG Answer Display */}
        {ragAnswer && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-700/80 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Me’yoriy asosga tayangan AI xulosasi:
              </span>
              <button
                onClick={() => handleCopyText('rag-ans', ragAnswer)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                {copiedId === 'rag-ans' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedId === 'rag-ans' ? 'Nusxalandi' : 'Nusxa olish'}</span>
              </button>
            </div>

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
              {ragAnswer}
            </div>

            {/* Citations Box */}
            {ragSources && ragSources.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Havola qilingan rasmiy manbalar:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ragSources.map((src, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300"
                    >
                      <div className="font-semibold text-blue-300 flex items-center justify-between">
                        <span>{src.docTitle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{src.article}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2 italic">
                        "{src.snippet}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full-text keyword search and category filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hujjatlar bo‘yicha qidiruv (so‘z, modda raqami, masalan: 21-modda, intizom, xizmat xati)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>Qidirish</span>
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs pt-1">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                // Trigger quick filter
                if (cat === 'Barchasi') {
                  setSearchResults(knowledgeList);
                } else {
                  setSearchResults(knowledgeList.filter((k) => k.category === cat));
                }
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Normative Documents List */}
      <div className="space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((doc) => {
            const isExpanded = !!expandedDocIds[doc.id];
            return (
              <div
                key={doc.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm transition"
              >
                {/* Document Header Bar */}
                <div
                  onClick={() => toggleExpand(doc.id)}
                  className="p-4 bg-slate-900 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition"
                >
                  <div className="flex items-start space-x-3 min-w-0 pr-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900/50 text-blue-200 border border-blue-700/50 uppercase">
                          {doc.category}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {doc.numberAndDate}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-100 mt-1 truncate">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {doc.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                      {doc.articles.length} ta modda/band
                    </span>
                    <button className="p-1 text-slate-400 hover:text-white transition">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Articles Content */}
                {isExpanded && (
                  <div className="border-t border-slate-800/80 p-4 bg-slate-950/40 space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                      {(doc.matchedArticles || doc.articles).map((art: any, aIdx: number) => (
                        <div
                          key={aIdx}
                          className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs space-y-1.5 transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sky-400 text-xs">
                              {art.number}: {art.title}
                            </span>
                            <button
                              onClick={() =>
                                handleCopyText(
                                  `${doc.id}-${aIdx}`,
                                  `${doc.title}, ${art.number}:\n${art.text}`
                                )
                              }
                              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedId === `${doc.id}-${aIdx}` ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>
                                {copiedId === `${doc.id}-${aIdx}` ? 'Nusxalandi' : 'Nusxa'}
                              </span>
                            </button>
                          </div>
                          <p className="text-slate-300 leading-relaxed font-sans">
                            {art.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Baza yangilangan sana: {new Date(doc.uploadedAt).toLocaleDateString('uz-UZ')}</span>
                      <span className="font-mono text-slate-500">Indeks ID: {doc.id}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">
              Qidiruv bo‘yicha me’yoriy hujjat topilmadi
            </p>
            <p className="text-xs text-slate-500">
              So‘rov so‘zlarini o‘zgartirib ko‘ring yoki AI aqlli tahlil maydonidan foydalaning.
            </p>
          </div>
        )}
      </div>

      {/* Upload & Index Modal for Authorized Personnel */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Yangi Me’yoriy Hujjat Yuklash va Indekslash
                </h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadNewDoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Hujjat Nomi
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Masalan: IIV Yo‘riqnomasi № 204 — Navbatchilik xizmati"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Kategoriya
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Yo'riqnoma">Yo‘riqnoma</option>
                    <option value="Buyruq">Buyruq</option>
                    <option value="Qaror">Qaror</option>
                    <option value="Nizom">Nizom</option>
                    <option value="Qonun">Qonun</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Raqami va sanasi
                  </label>
                  <input
                    type="text"
                    value={uploadNumber}
                    onChange={(e) => setUploadNumber(e.target.value)}
                    placeholder="№ 204, 2026-yil"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Qisqacha tavsif
                </label>
                <input
                  type="text"
                  value={uploadDesc}
                  onChange={(e) => setUploadDesc(e.target.value)}
                  placeholder="Hujjat nima haqidaligi qisqacha"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Hujjat matni (Moddalar yoki bandlar bo‘yicha: masalan "1-band: ...")
                </label>
                <textarea
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  rows={6}
                  placeholder={`1-band: Navbatchilik xizmati tartibi...\n2-band: Xodimlarning xizmat qurolini qabul qilish tartibi...`}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Indekslanmoqda...' : 'Indekslash va Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
