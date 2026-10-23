import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Shield,
  AlertTriangle,
  Radio,
  Car,
  Phone,
  CheckCircle2,
  AlertOctagon,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  Filter,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import {
  User,
  MahallaRiskZone,
  PatrolUnit,
  EmergencyAlert,
} from '../types';

interface CrimeMapViewProps {
  currentUser: User | null;
  onSendToDocumentBuilder: (text: string, title?: string) => void;
}

export const CrimeMapView: React.FC<CrimeMapViewProps> = ({
  currentUser,
  onSendToDocumentBuilder,
}) => {
  const [mahallas, setMahallas] = useState<MahallaRiskZone[]>([]);
  const [patrols, setPatrols] = useState<PatrolUnit[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'qizil' | 'sariq' | 'yashil'>('all');
  const [selectedMahalla, setSelectedMahalla] = useState<MahallaRiskZone | null>(null);
  const [dispatchAlertId, setDispatchAlertId] = useState<string | null>(null);
  const [selectedPatrolCallSign, setSelectedPatrolCallSign] = useState<string>('Patrul-104');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchGisData();
  }, []);

  const fetchGisData = async () => {
    try {
      const res = await fetch('/api/gis/data');
      if (res.ok) {
        const data = await res.json();
        setMahallas(data.mahallas || []);
        setPatrols(data.patrols || []);
        setAlerts(data.alerts || []);
        if (data.mahallas && data.mahallas.length > 0 && !selectedMahalla) {
          setSelectedMahalla(data.mahallas[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch GIS data:', err);
    }
  };

  const handleDispatch = async (alertId: string) => {
    setIsDispatching(true);
    try {
      const res = await fetch(`/api/gis/alerts/${alertId}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patrolCallSign: selectedPatrolCallSign }),
      });
      if (res.ok) {
        setDispatchSuccessMsg(`${selectedPatrolCallSign} ekipaji voqea joyiga yo‘naltirildi!`);
        setTimeout(() => setDispatchSuccessMsg(null), 3500);
        setDispatchAlertId(null);
        fetchGisData();
      }
    } catch (err) {
      console.error('Dispatch error:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSendReportToDraft = (m: MahallaRiskZone) => {
    const text = `KRIMINOGEN VAZIYAT TO‘G‘RISIDA MA’LUMOTNOMA

Hudud: Toshkent shahar, ${m.district}
Mahalla: "${m.mahallaName}"
Kriminogen toifasi: ${m.category.toUpperCase()} TOIFA
Xavfsizlik indeksi: ${m.safetyScore} / 100
Aholisi: ${m.population.toLocaleString()} nafar
Mas’ul profilaktika inspektori: ${m.inspectorRank} ${m.inspectorName} (Tel: ${m.inspectorPhone})
Biriktirilgan patrul xizmati: ${m.assignedPatrol}

QAYD ETILGAN HODISALAR STATISTIKASI:
- Jami qayd etilgan hodisalar: ${m.incidentCount} ta
- Oldi olingan va bartaraf etilgan: ${m.preventedCount} ta
- Asosiy xavf omili: ${m.topOffenseType}
- So‘nggi tendensiya: ${m.recentTrends}

KO‘RILGAN VA AMALGA OSHIRILAYOTGAN PROFILAKTIK CHORALAR:
${m.preventativeMeasures.map((pm, i) => `${i + 1}. ${pm}`).join('\n')}

XULOSA VA TAKLIFLAR:
Mahallada jamoat xavfsizligini yanada mustahkamlash maqsadida tungi vaqt oralig‘ida (22:00 - 06:00) qo‘shma patrul yo‘nalishlarini davom ettirish hamda profilaktik hisobda turgan shaxslar bilan tizimli muloqotni kuchaytirish maqsadga muvofiq deb hisoblanadi.

Axborotni tayyorladi: ${currentUser?.rank} ${currentUser?.fullName}
Sana: ${new Date().toLocaleDateString('uz-UZ')}`;

    onSendToDocumentBuilder(text, `${m.mahallaName} kriminogen tahlili`);
  };

  const filteredMahallas = mahallas.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const redCount = mahallas.filter((m) => m.category === 'qizil').length;
  const yellowCount = mahallas.filter((m) => m.category === 'sariq').length;
  const greenCount = mahallas.filter((m) => m.category === 'yashil').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
              <Compass className="w-4 h-4 text-sky-400" />
              <span>Interaktiv Kriminogen GIS Xarita & Situatsion Markaz</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Toshkent Shahri Mahallalar Kriminogen Toifalari (Qizil / Sariq / Yashil)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Ichki ishlar vazirligi metodikasi asosida mahallalarning xavfsizlik darajasi, jonli patrul ekipajlari va 102/SOS signallarini real vaqtda boshqarish.
            </p>
          </div>

          {/* Mahalla Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Barchasi</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {mahallas.length}
              </span>
            </button>
            <button
              onClick={() => setSelectedCategory('qizil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCategory === 'qizil'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              <span>Qizil toifa</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {redCount}
              </span>
            </button>
            <button
              onClick={() => setSelectedCategory('sariq')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCategory === 'sariq'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Sariq toifa</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {yellowCount}
              </span>
            </button>
            <button
              onClick={() => setSelectedCategory('yashil')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedCategory === 'yashil'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Yashil toifa</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/30">
                {greenCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dispatch Success Alert */}
      {dispatchSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Interactive Map Visual + Mahalla Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================= MAP CANVAS CONTAINER (7 COLS) ================= */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Toshkent Shahar Raqamli GIS Sxemasi
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Qizil
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sariq
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Yashil
              </span>
            </div>
          </div>

          {/* Interactive SVG Radar & Mahalla Coordinates Board */}
          <div className="relative w-full aspect-[4/3] bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-inner flex items-center justify-center p-2">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-30 pointer-events-none" />

            {/* Radar Circular Grid Overlay */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50%"
                cy="50%"
                r="40%"
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="25%"
                fill="none"
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
              {/* Connector lines between mahallas */}
              <path
                d="M 34% 24% L 42% 44% L 26% 64% L 30% 74% L 45% 70% L 55% 62% L 62% 28%"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.25"
              />
            </svg>

            {/* Interactive Mahalla Pins */}
            {filteredMahallas.map((m) => {
              const isSelected = selectedMahalla?.id === m.id;
              const isRed = m.category === 'qizil';
              const isYellow = m.category === 'sariq';
              const isGreen = m.category === 'yashil';

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMahalla(m)}
                  style={{ left: `${m.coordinates.x}%`, top: `${m.coordinates.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all cursor-pointer z-20 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                  }`}
                >
                  {/* Pulsing ring for red zones */}
                  {isRed && (
                    <span className="absolute -inset-1.5 rounded-full bg-rose-500/40 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-lg border transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 border-white ring-2 ring-blue-500 shadow-blue-500/40'
                        : isRed
                        ? 'bg-rose-950/90 text-rose-200 border-rose-500'
                        : isYellow
                        ? 'bg-amber-950/90 text-amber-200 border-amber-500'
                        : 'bg-emerald-950/90 text-emerald-200 border-emerald-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        isRed
                          ? 'bg-rose-500'
                          : isYellow
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span className="whitespace-nowrap">{m.mahallaName}</span>
                  </div>
                </button>
              );
            })}

            {/* Patrol Units Moving Markers */}
            {patrols.map((pat) => (
              <div
                key={pat.id}
                style={{ left: `${pat.location.x}%`, top: `${pat.location.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none transition-all duration-1000"
              >
                <div className="bg-blue-600/90 text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow flex items-center gap-1 border border-sky-400">
                  <Car className="w-3 h-3 text-sky-200" />
                  <span>{pat.callSign}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Mahalla Selector Strip */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {filteredMahallas.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMahalla(m)}
                className={`px-3 py-2 rounded-xl text-left border shrink-0 transition text-xs ${
                  selectedMahalla?.id === m.id
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">{m.mahallaName}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {m.district} &bull; {m.category.toUpperCase()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ================= MAHALLA DOSSIER (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
          {selectedMahalla ? (
            <div className="space-y-4">
              {/* Mahalla Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        selectedMahalla.category === 'qizil'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : selectedMahalla.category === 'sariq'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {selectedMahalla.category} toifa
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {selectedMahalla.district}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    "{selectedMahalla.mahallaName}" MFY
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Xavfsizlik indeksi</div>
                  <div
                    className={`text-xl font-bold font-mono ${
                      selectedMahalla.safetyScore >= 80
                        ? 'text-emerald-400'
                        : selectedMahalla.safetyScore >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {selectedMahalla.safetyScore}/100
                  </div>
                </div>
              </div>

              {/* Stats 3-Col Box */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Aholisi</span>
                  <span className="font-bold text-white text-sm">
                    {selectedMahalla.population.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Jami hodisalar</span>
                  <span className="font-bold text-rose-400 text-sm">
                    {selectedMahalla.incidentCount}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Oldi olingan</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {selectedMahalla.preventedCount}
                  </span>
                </div>
              </div>

              {/* Responsible Inspector */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Mas’ul profilaktika inspektori:
                </span>
                <div className="flex items-center justify-between font-semibold text-white">
                  <span>{selectedMahalla.inspectorRank} {selectedMahalla.inspectorName}</span>
                  <a
                    href={`tel:${selectedMahalla.inspectorPhone}`}
                    className="flex items-center gap-1 text-sky-400 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{selectedMahalla.inspectorPhone}</span>
                  </a>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                  <span>Biriktirilgan patrul:</span>
                  <span className="font-mono text-sky-300 font-bold">{selectedMahalla.assignedPatrol}</span>
                </div>
              </div>

              {/* Main Offense & Trends */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Asosiy huquqbuzarlik turi:
                </span>
                <p className="text-slate-200 bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                  {selectedMahalla.topOffenseType}
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  Tendensiya: {selectedMahalla.recentTrends}
                </p>
              </div>

              {/* Action Measures */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Amaldagi profilaktik choralar:
                </span>
                <ul className="space-y-1">
                  {selectedMahalla.preventativeMeasures.map((pm, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-1.5 text-slate-300 bg-slate-950/40 p-1.5 rounded"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{pm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Xaritadan mahallani tanlang
            </div>
          )}

          {selectedMahalla && (
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => handleSendReportToDraft(selectedMahalla)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <FileText className="w-4 h-4" />
                <span>Kriminogen Tahliliy Hujjat Qoralamasini Tuzish</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ================= 102 CALLS & SOS BEACONS DISPATCHER ================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              102 Tezkor Chaqiruvlar & SOS Trevoga Signallari ({alerts.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Ekipajni zudlik bilan yo‘llash va xizmat nazorati
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {alerts.map((al) => {
            const isDispatched = al.status === 'Ekipaj_Biriktirildi';
            const isResolved = al.status === 'Bartaraf_Etildi';
            const isNew = al.status === 'Yangi';

            return (
              <div
                key={al.id}
                className={`bg-slate-950/80 border rounded-xl p-4 flex flex-col justify-between transition-all ${
                  isNew
                    ? 'border-rose-500/60 ring-1 ring-rose-500/20'
                    : isDispatched
                    ? 'border-sky-500/40'
                    : 'border-slate-800 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        al.code === 'TUGMA_SOS'
                          ? 'bg-rose-600 text-white'
                          : al.code === '102_CHAQIRUV'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {al.code.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400">{al.timestamp}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug mb-1">
                    {al.title}
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2 mb-2">
                    {al.description}
                  </p>

                  <div className="text-[10px] text-slate-400 space-y-0.5 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-1 text-slate-300 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{al.address} ({al.mahalla})</span>
                    </div>
                    {al.callerPhone && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3" />
                        <span>Tel: {al.callerPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800">
                  {isResolved ? (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Bartaraf etildi
                    </span>
                  ) : isDispatched ? (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-sky-400 flex items-center gap-1">
                        <Car className="w-3.5 h-3.5" /> {al.assignedPatrol}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                        Harakatda
                      </span>
                    </div>
                  ) : dispatchAlertId === al.id ? (
                    <div className="space-y-1.5">
                      <select
                        value={selectedPatrolCallSign}
                        onChange={(e) => setSelectedPatrolCallSign(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded p-1"
                      >
                        {patrols.map((p) => (
                          <option key={p.id} value={p.callSign}>
                            {p.callSign} ({p.vehiclePlate}) - {p.assignedMahalla}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDispatch(al.id)}
                          disabled={isDispatching}
                          className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                        >
                          {isDispatching ? 'Yo‘llanmoqda...' : 'Tasdiqlash'}
                        </button>
                        <button
                          onClick={() => setDispatchAlertId(null)}
                          className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px]"
                        >
                          Bekor
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDispatchAlertId(al.id)}
                      className="w-full py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Ekipaj yo‘llash
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
