import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Plus,
  Sparkles,
  Search,
  Calendar,
  Clock,
  User as UserIcon,
  Phone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { CitizenAppeal, User } from '../types';

interface CitizenAppealsViewProps {
  currentUser: User | null;
  onSendToDocumentBuilder: (draftText: string, title?: string) => void;
}

export const CitizenAppealsView: React.FC<CitizenAppealsViewProps> = ({
  currentUser,
  onSendToDocumentBuilder,
}) => {
  const [appeals, setAppeals] = useState<CitizenAppeal[]>([]);
  const [selectedAppeal, setSelectedAppeal] = useState<CitizenAppeal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Appeal Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCitizenName, setNewCitizenName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newAppealText, setNewAppealText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const res = await fetch('/api/citizen-appeals');
      if (res.ok) {
        const data = await res.json();
        setAppeals(data);
        if (data.length > 0 && !selectedAppeal) {
          setSelectedAppeal(data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch appeals error:', err);
    }
  };

  const handleCreateAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCitizenName.trim() || !newAppealText.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/citizen-appeals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          citizenName: newCitizenName,
          address: newAddress,
          phone: newPhone,
          topic: newTopic,
          appealText: newAppealText,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setAppeals([created, ...appeals]);
        setSelectedAppeal(created);
        setCreateModalOpen(false);
        setNewCitizenName('');
        setNewAddress('');
        setNewPhone('');
        setNewTopic('');
        setNewAppealText('');
      }
    } catch (err) {
      console.error('Create appeal error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyzeAppeal = async () => {
    if (!selectedAppeal) return;

    setAnalyzing(true);
    try {
      const res = await fetch('/api/citizen-appeals/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          appealId: selectedAppeal.id,
          appealText: selectedAppeal.appealText,
          citizenName: selectedAppeal.citizenName,
          applicantAddress: selectedAppeal.address,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated = {
          ...selectedAppeal,
          summaryPoints: data.analysis.summaryPoints,
          responseDraft: data.analysis.responseDraft,
          recommendedActions: data.analysis.recommendedActions,
          status: 'O\'rganilmoqda' as const,
        };
        setSelectedAppeal(updated);
        setAppeals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (err) {
      console.error('Analyze appeal error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredAppeals = appeals.filter(
    (a) =>
      a.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Fuqarolar Murojaatlari va AI Javob Xati Generatori
            </h1>
            <p className="text-xs text-slate-400">
              Arizalar va shikoyatlarni qonuniy tahlil qilish, muddatlarni nazorat qilish va rasmiy javob xati loyihasini tayyorlash
            </p>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi murojaat qabul qilish</span>
        </button>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Appeals List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Fuqaro ismi yoki murojaat raqami..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-2 max-h-[calc(100vh-18rem)] overflow-y-auto">
            {filteredAppeals.map((appeal) => {
              const isSelected = selectedAppeal?.id === appeal.id;
              const isOverdue = new Date(appeal.deadlineDate).getTime() < Date.now();
              return (
                <div
                  key={appeal.id}
                  onClick={() => setSelectedAppeal(appeal)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-600 shadow-sm'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {appeal.registrationNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        appeal.status === 'Javob berildi'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : appeal.status === 'O\'rganilmoqda'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {appeal.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-200 line-clamp-1">
                    {appeal.citizenName}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {appeal.topic}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 font-mono">
                    <span>Qabul: {new Date(appeal.receivedDate).toLocaleDateString('uz-UZ')}</span>
                    <span className={isOverdue ? 'text-rose-400 font-bold' : ''}>
                      Muddat: {new Date(appeal.deadlineDate).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 spans): Appeal Detail & AI Generator */}
        <div className="lg:col-span-2 space-y-4">
          {selectedAppeal ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
              {/* Appeal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs bg-slate-950 px-2 py-0.5 rounded text-blue-300 border border-slate-800">
                      {selectedAppeal.registrationNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Ijro muddati: {new Date(selectedAppeal.deadlineDate).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-white mt-1">
                    {selectedAppeal.citizenName}
                  </h2>
                </div>

                <button
                  onClick={handleAnalyzeAppeal}
                  disabled={analyzing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-sky-300" />
                  <span>{analyzing ? 'AI tahlil qilmoqda...' : 'AI Tahlil & Javob Xati'}</span>
                </button>
              </div>

              {/* Citizen Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center space-x-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="truncate">{selectedAppeal.address}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="font-mono">{selectedAppeal.phone}</span>
                </div>
              </div>

              {/* Appeal Text */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Fuqaroning Murojaat Matni:
                </label>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedAppeal.appealText}
                </div>
              </div>

              {/* AI Analysis Result (if generated) */}
              {selectedAppeal.summaryPoints && (
                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AI Tahlil Xulosasi (Murojaat Mohiyati):</span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedAppeal.summaryPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedAppeal.recommendedActions && (
                    <div className="pt-2 border-t border-slate-800 space-y-1">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">
                        Tavsiya etiladigan tekshiruv harakatlari:
                      </span>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {selectedAppeal.recommendedActions.map((act, aIdx) => (
                          <li key={aIdx} className="flex items-center gap-1.5 text-slate-300">
                            <span className="text-emerald-400">&check;</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Official Response Letter Draft */}
              {selectedAppeal.responseDraft && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>Fuqaroga Yo‘llanadigan Rasmiy Javob Xati Loyihasi:</span>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedAppeal.responseDraft || '');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
                      </button>

                      <button
                        onClick={() =>
                          onSendToDocumentBuilder(
                            selectedAppeal.responseDraft || '',
                            `Javob xati: ${selectedAppeal.citizenName}`
                          )
                        }
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                      >
                        <span>Hujjatga o‘tkazish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                    {selectedAppeal.responseDraft}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              Murojaat tanlanmagan
            </div>
          )}
        </div>
      </div>

      {/* Create New Appeal Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-sky-400" />
                Yangi Fuqaro Murojaatini Ro‘yxatga Olish
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppeal} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Fuqaroning F.I.Sh.</label>
                <input
                  type="text"
                  value={newCitizenName}
                  onChange={(e) => setNewCitizenName(e.target.value)}
                  placeholder="Masalan: Karimov Alisher Baxtiyorovich"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Manzili</label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Yunusobod 12-mavze, 2-uy"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Telefon raqami</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+998 90 123-45-67"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Murojaat mavzusi</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Masalan: Tungi shovqin va jamoat tartibini buzish"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Murojaatning to‘liq matni</label>
                <textarea
                  value={newAppealText}
                  onChange={(e) => setNewAppealText(e.target.value)}
                  rows={4}
                  placeholder="Fuqaroning yozma arizasi matnini kiriting..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{saving ? 'Saqlanmoqda...' : 'Ro‘yxatga olish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
