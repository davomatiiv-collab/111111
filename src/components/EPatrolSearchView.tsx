import React, { useState, useEffect } from 'react';
import {
  Search,
  Car,
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  FileText,
  BadgeAlert,
  ArrowRight,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  AlertOctagon,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { User, VehicleRecord, CitizenDossier } from '../types';

interface EPatrolSearchViewProps {
  currentUser: User | null;
  onSendToDocumentBuilder: (text: string, title?: string) => void;
}

export const EPatrolSearchView: React.FC<EPatrolSearchViewProps> = ({
  currentUser,
  onSendToDocumentBuilder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'vehicle' | 'citizen'>('all');
  const [vehicles, setVehicles] = useState<VehicleRecord[]>([]);
  const [citizens, setCitizens] = useState<CitizenDossier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRecord | null>(null);
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenDossier | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);

  // Perform initial search
  useEffect(() => {
    executeSearch('');
  }, []);

  const executeSearch = async (queryToSearch: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/epatrol/search?query=${encodeURIComponent(queryToSearch)}&type=${filterType}`
      );
      if (res.ok) {
        const data = await res.json();
        setVehicles(data.vehicles || []);
        setCitizens(data.citizens || []);
      }
    } catch (err) {
      console.error('E-Patrol search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleQuickFilter = (plateOrPinfl: string) => {
    setSearchQuery(plateOrPinfl);
    executeSearch(plateOrPinfl);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateAiOperationalAdvice = (targetName: string, situation: string) => {
    setAiAdviceLoading(true);
    setAiAdvice(null);
    setTimeout(() => {
      let advice = '';
      if (situation.includes('Qidiruvda')) {
        advice = `DIQQAT - TEZKOR XIZMAT YO'RIQNOMASI (O‘RQ-407, 21-23 moddalar):
1. Zudlik bilan xavfsiz masofa saqlangan holda navbatchilik qismi (102) va yaqin atrofdagi qo‘shni patrul ekipajiga (radiostansiya orqali) xabar bering.
2. Fuqaro/haydovchi bilan muloyim, qat’iy va ehtiyotkorona muomalada bo‘ling. Huquqbuzarga ehtiyot choralari to‘g‘risida ochiq oshkor qilmasdan, hujjatlarni ko‘zdan kechirish bahonasida qo‘shimcha kuch kelguncha ushlab turing.
3. Shaxsiy xavfsizlik choralariga rioya qiling. Zarur hollarda jismoniy kuch yoki maxsus vositalarni (kishan) qo‘llash shartlari qonuniy asoslanishi shart (JK 168/267-moddalar bo‘yicha qidiruvdagi shaxs).
4. Olib kelish va ushlab turish bayonnomasi (MJtK 287-modda) rasmiylashtirilib, navbatchilik qismiga topshirilsin.`;
      } else if (situation.includes('Jarima_Bor')) {
        advice = `XIZMAT HARAKATLARI TARTIBI (MJtK 291-modda):
1. Transport vositasining to‘lanmagan ma’muriy jarimalari (jami ${targetName}) 60 kundan ortiq muddatda to‘lanmaganligi tekshirilsin.
2. Agar jarimalar bo‘yicha transport vositasini ushlab turish qarori mavjud bo‘lsa, transport vositasini vaqtinchalik jarima maydonchasiga joylashtirish to‘g‘risida bayonnoma rasmiylashtirilsin.
3. Haydovchiga Yagona interaktiv davlat xizmatlari portali yoki Click/Payme orqali to‘lov qilish imkoniyati tushuntirilsin.`;
      } else {
        advice = `STANDART TEKSHIRUV PROTOKOLI:
1. Fuqaroning shaxsini tasdiqlovchi hujjati (Pasport/ID-karta) va haydovchilik guvohnomasi elektron bazadan o‘tkazildi.
2. Sudlanganlik, profilaktik hisob yoki qidiruv belgilari mavjud emas.
3. Hurmat bilan xizmat o‘tash talablariga muvofiq, xushmuomala munosabatda bo‘lib, yo‘lda davom etishiga ruxsat berilsin.`;
      }
      setAiAdvice(advice);
      setAiAdviceLoading(false);
    }, 600);
  };

  const handleSendVehicleToDraft = (v: VehicleRecord) => {
    const text = `BILDIRGI

Kimga: Toshkent shahar IIBB YPX boshlig‘i nomiga
Kimdan: ${currentUser?.rank || 'Katta leytenant'} ${currentUser?.fullName || 'Karimov S.B.'}

XIZMAT BILDIRGISI

Ma’lum qilamanki, 2025-yil xizmat vazifalarini bajarish (E-Patrul tizimi) davomida davlat raqam belgisi ${v.plateNumber} bo‘lgan "${v.model}" rusumli avtotransport vositasi ko‘zdan kechirildi.

Avtotransport ma’lumotlari:
- Davlat raqami: ${v.plateNumber}
- Rusumi: ${v.model} (${v.color}, ${v.year}-yil)
- Egasi: ${v.ownerFullName} (JSHSHIR: ${v.ownerPinfl})
- Texnik pasport: ${v.techPassportNumber}
- Tizimdagi holati: ${v.status}
- Qoidabuzarliklar soni: ${v.violationsCount} ta
- To‘lanmagan jarimalar summasi: ${v.unpaidFinesAmount.toLocaleString()} so‘m
${v.stolenReport ? `- Qidiruv ma’lumoti: ${v.stolenReport.details} (Ish raqami: ${v.stolenReport.caseNumber})` : ''}

Mazkur holat yuzasidan qonuniy chora ko‘rish va ma’lumotlar bazasiga qayd etish uchun taqdim etilmoqda.

Xodim: ${currentUser?.rank} ${currentUser?.fullName}
Sana: ${new Date().toLocaleDateString('uz-UZ')}`;

    onSendToDocumentBuilder(text, `${v.plateNumber} bo‘yicha xizmat bildirgisi`);
  };

  const handleSendCitizenToDraft = (c: CitizenDossier) => {
    const text = `MA’LUMOTNOMA

Fuqaro: ${c.fullName}
Tug‘ilgan sanasi: ${c.birthDate}
JSHSHIR (PINFL): ${c.pinfl}
Pasport seriya va raqami: ${c.passportNumber}
Yashash manzili: ${c.address} (${c.mahalla}, ${c.district})
Hisobdagi holati: ${c.status}
Profilaktik toifa: ${c.preventativeCategory || 'Mavjud emas'}
Mas’ul profilaktika inspektori: ${c.assignedInspector}

SUDLANGANLIK VA QIDIRUV MA’LUMOTLARI:
${c.criminalRecords.length > 0 ? c.criminalRecords.map((r, i) => `${i + 1}. Sana: ${r.date} | Modda: ${r.article} | Sud: ${r.court} | Jazo: ${r.punishment}`).join('\n') : '- Muqaddam sudlanmagan.'}

${c.warrants.length > 0 ? `QIDIRUV VA EHTIYOT CHORALARI:\n` + c.warrants.map((w, i) => `${i + 1}. Qidiruv ishi: ${w.warrantNumber} (${w.crimeArticle}), Kim tomonidan: ${w.issuedBy}, Shoshilinchlik: ${w.urgency}`).join('\n') : '- Faol qidiruv ishi mavjud emas.'}

${c.protectionOrdersCount > 0 ? `Rasmiylashtirilgan himoya orderlari: ${c.protectionOrdersCount} ta` : ''}

Ushbu ma’lumotnoma IIV Yagona axborot tizimi orqali xizmat zarurati yuzasidan taqdim etildi.

Ma’lumotnomani shakllantirdi: ${currentUser?.rank} ${currentUser?.fullName}
Sana: ${new Date().toLocaleDateString('uz-UZ')}`;

    onSendToDocumentBuilder(text, `${c.fullName} shaxsiy dosye ma’lumotnomasi`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400 mb-1">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              <span>E-Patrul & Tezkor Qidiruv Integratsiyasi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Avtotransport & Fuqarolar Dosyesi Qidiruv Tizimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Davlat raqam belgisi, JSHSHIR (PINFL), pasport seriyasi yoki F.I.Sh. bo‘yicha IIV markaziy bazasidan bir zumda tekshirish.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Baza onlayn: 24/7 sinxron
            </span>
          </div>
        </div>

        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Davlat raqami (01 A 777 AA), JSHSHIR (14 raqam), Pasport (FA 1234567) yoki F.I.Sh..."
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Barcha obyektlar</option>
              <option value="vehicle">Faqat Avtomashinalar</option>
              <option value="citizen">Faqat Fuqarolar</option>
            </select>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
            >
              {isLoading ? (
                <span>Qidirilmoqda...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Qidirish</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Tag Searches */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Tezkor namunalar:</span>
          <button
            onClick={() => handleQuickFilter('01 707 ABC')}
            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition font-mono font-bold"
          >
            01 707 ABC (Qidiruvdagi avto)
          </button>
          <button
            onClick={() => handleQuickFilter('31508920120014')}
            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition font-mono font-bold"
          >
            31508920120014 (Qidiruvdagi shaxs)
          </button>
          <button
            onClick={() => handleQuickFilter('10 B 456 BA')}
            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition font-mono"
          >
            10 B 456 BA (Jarimalar)
          </button>
          <button
            onClick={() => handleQuickFilter('40 A 123 AA')}
            className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 transition font-mono"
          >
            40 A 123 AA (MIB Taqiqi)
          </button>
          <button
            onClick={() => handleQuickFilter('01 A 777 AA')}
            className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition font-mono"
          >
            01 A 777 AA (Toza)
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              executeSearch('');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Filtrni tozalash
          </button>
        </div>
      </div>

      {/* AI Advice Popup Banner if generated */}
      {aiAdvice && (
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/40 rounded-2xl p-5 shadow-lg relative animate-fade-in">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>IIV AI Operativ Harakat Tavsiyanomasi</span>
            </div>
            <button
              onClick={() => setAiAdvice(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Yopish &times;
            </button>
          </div>
          <pre className="text-xs text-slate-200 font-sans whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {aiAdvice}
          </pre>
        </div>
      )}

      {/* Main Grid: Vehicles & Citizens Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ================= COLUMN 1: VEHICLES ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-sky-400" />
              <h2 className="text-base font-bold text-white">
                Avtotransport vositalari ({vehicles.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">YPX va Ro‘yxatga olish bazasi</span>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              Qidiruv bo‘yicha avtotransport vositasi topilmadi.
            </div>
          ) : (
            vehicles.map((v) => {
              const isWanted = v.status === 'Qidiruvda';
              const hasFines = v.status === 'Jarima_Bor';
              const hasArrest = v.status === 'Taqiq_Qoyilgan';

              return (
                <div
                  key={v.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md relative overflow-hidden ${
                    isWanted
                      ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                      : hasFines
                      ? 'border-amber-500/40'
                      : hasArrest
                      ? 'border-purple-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar with Plate Number */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    {/* Official Uzbekistan License Plate Graphic */}
                    <div className="inline-flex items-center bg-white text-black font-mono font-bold rounded-md px-3 py-1.5 border-2 border-slate-400 shadow-inner tracking-wider text-base">
                      <div className="flex items-center gap-1 mr-2 pr-2 border-r border-slate-300">
                        <span className="text-[10px] text-blue-800 font-bold">UZ</span>
                      </div>
                      <span>{v.plateNumber}</span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isWanted && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm animate-pulse">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          QIDIRUVDA
                        </span>
                      )}
                      {hasFines && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {v.violationsCount} ta Jarima ({v.unpaidFinesAmount.toLocaleString()} so‘m)
                        </span>
                      )}
                      {hasArrest && (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1">
                          <BadgeAlert className="w-3.5 h-3.5" />
                          MIB TAQIQI MAVJUD
                        </span>
                      )}
                      {v.status === 'Toza' && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          QIDIRUV YO‘Q (TOZA)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stolen Case Notification Box */}
                  {v.stolenReport && (
                    <div className="mb-4 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-300">
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                        <span>O‘G‘IRLANGAN AVTOTRANSPORT MA’LUMOTI</span>
                      </div>
                      <p className="text-slate-200">{v.stolenReport.details}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Ish №: {v.stolenReport.caseNumber}</span>
                        <span>Qayd etgan: {v.stolenReport.reportedByDepartment}</span>
                      </div>
                    </div>
                  )}

                  {/* Vehicle Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs mb-4">
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Model & Yil</span>
                      <span className="font-semibold text-white">{v.model} ({v.year})</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Rangi</span>
                      <span className="font-semibold text-white">{v.color}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Tex. pasport</span>
                      <span className="font-mono text-slate-300">{v.techPassportNumber}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Mulkdor</span>
                      <span className="font-semibold text-white truncate block">{v.ownerFullName}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">JSHSHIR (PINFL)</span>
                      <span className="font-mono text-slate-300">{v.ownerPinfl}</span>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block">Sug‘urta muddati</span>
                      <span
                        className={`font-mono ${
                          new Date(v.insuranceValidUntil) < new Date()
                            ? 'text-rose-400 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {v.insuranceValidUntil}
                      </span>
                    </div>
                  </div>

                  {v.notes && (
                    <p className="text-[11px] text-slate-400 italic mb-4 bg-slate-950/40 p-2 rounded border border-slate-800">
                      Izoh: {v.notes}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleGenerateAiOperationalAdvice(v.model, v.status)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600/20 text-sky-300 border border-sky-500/30 hover:bg-sky-600/30 transition flex items-center gap-1.5 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      AI Operativ Tavsiya
                    </button>

                    <button
                      onClick={() => handleSendVehicleToDraft(v)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 font-semibold shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Bildirgi tuzish &rarr;
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ================= COLUMN 2: CITIZENS DOSSIER ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">
                Fuqarolar dosyesi ({citizens.length})
              </h2>
            </div>
            <span className="text-xs text-slate-400">JSHSHIR & Sudlanganlik reyestri</span>
          </div>

          {citizens.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
              Qidiruv bo‘yicha fuqaro topilmadi.
            </div>
          ) : (
            citizens.map((c) => {
              const isWanted = c.status === 'Qidiruvda';
              const isPreventative = c.status === 'Profilaktik_Hisobda';
              const isProbation = c.status === 'Probatsiya_Nazoratida';

              return (
                <div
                  key={c.id}
                  className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md relative overflow-hidden ${
                    isWanted
                      ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                      : isPreventative
                      ? 'border-amber-500/40'
                      : isProbation
                      ? 'border-indigo-500/40'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Bar with Name & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{c.fullName}</span>
                        <span className="text-xs text-slate-400 font-normal">
                          ({c.birthDate}, {c.gender})
                        </span>
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span className="font-mono text-sky-400">JSHSHIR: {c.pinfl}</span>
                        <span>&bull;</span>
                        <span className="font-mono text-slate-300">Pasport: {c.passportNumber}</span>
                      </div>
                    </div>

                    <div>
                      {isWanted && (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm animate-pulse">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          QIDIRUVDA
                        </span>
                      )}
                      {isPreventative && (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          PROFILAKTIK HISOBDA
                        </span>
                      )}
                      {isProbation && (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold text-xs flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          PROBATSIYA NAZORATIDA
                        </span>
                      )}
                      {c.status === 'Toza' && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          TOZA (HISOBDA YO‘Q)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Active Warrants Alert Box */}
                  {c.warrants.length > 0 && (
                    <div className="mb-3 bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-rose-300">
                        <div className="flex items-center gap-1.5">
                          <AlertOctagon className="w-4 h-4 text-rose-400" />
                          <span>FAOL QIDIRUV AJRIMI VA EHTIYOT CHORASI</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-rose-600 text-[10px] text-white">
                          {c.warrants[0].urgency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-slate-200 font-semibold">{c.warrants[0].crimeArticle}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Ish №: {c.warrants[0].warrantNumber}</span>
                        <span>Organ: {c.warrants[0].issuedBy}</span>
                      </div>
                    </div>
                  )}

                  {/* Address and Inspector Info */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs mb-3">
                    <div className="flex items-center gap-2 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.address} ({c.mahalla}, {c.district})</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {c.phone}
                      </span>
                      <span>Mas’ul inspektor: <strong className="text-slate-300">{c.assignedInspector}</strong></span>
                    </div>
                  </div>

                  {/* Criminal Records & Protection Orders */}
                  {c.criminalRecords.length > 0 && (
                    <div className="mb-3 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Muqaddam sudlanganlik holatlari ({c.criminalRecords.length}):
                      </span>
                      {c.criminalRecords.map((rec, i) => (
                        <div
                          key={i}
                          className="bg-slate-950/40 p-2 rounded border border-slate-800/80 text-[11px] text-slate-300"
                        >
                          <div className="flex items-center justify-between text-slate-400">
                            <span className="font-semibold text-rose-300">{rec.article}</span>
                            <span>{rec.date}</span>
                          </div>
                          <div className="text-slate-400 mt-0.5">{rec.court}</div>
                          <div className="text-slate-300 mt-0.5 font-medium">{rec.punishment}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {c.protectionOrdersCount > 0 && (
                    <div className="mb-3 bg-amber-950/30 border border-amber-500/30 rounded-lg p-2 text-xs flex items-center justify-between text-amber-200">
                      <span>Bu shaxsga nisbatan faol Himoya Orderi mavjud</span>
                      <span className="font-bold">{c.protectionOrdersCount} ta</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <button
                      onClick={() => handleGenerateAiOperationalAdvice(c.fullName, c.status)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition flex items-center gap-1.5 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Qonuniy Chora Tavsiyasi
                    </button>

                    <button
                      onClick={() => handleSendCitizenToDraft(c)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 font-semibold shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Dosye Ma’lumotnomasi &rarr;
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
