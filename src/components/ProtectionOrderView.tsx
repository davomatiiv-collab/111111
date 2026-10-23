import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  PlusCircle,
  Clock,
  AlertTriangle,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle2,
  AlertOctagon,
  Scale,
  Sparkles,
  ChevronRight,
  UserX,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import { User, ProtectionOrder, ProtectionOrderRestrictions } from '../types';

interface ProtectionOrderViewProps {
  currentUser: User | null;
  onSendToDocumentBuilder: (text: string, title?: string) => void;
}

export const ProtectionOrderView: React.FC<ProtectionOrderViewProps> = ({
  currentUser,
  onSendToDocumentBuilder,
}) => {
  const [orders, setOrders] = useState<ProtectionOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extendingId, setExtendingId] = useState<string | null>(null);

  // New Order Form State
  const [victimName, setVictimName] = useState('');
  const [victimPinfl, setVictimPinfl] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [victimAddress, setVictimAddress] = useState('');
  const [offenderName, setOffenderName] = useState('');
  const [offenderPinfl, setOffenderPinfl] = useState('');
  const [offenderPhone, setOffenderPhone] = useState('');
  const [offenderRelationship, setOffenderRelationship] = useState('Turmush o‘rtog‘i');
  const [district, setDistrict] = useState('Yunusobod tumani');
  const [mahalla, setMahalla] = useState('Xiyobonbog‘ MFY');
  const [incidentSummary, setIncidentSummary] = useState('');
  const [restrictions, setRestrictions] = useState<ProtectionOrderRestrictions>({
    noViolence: true,
    noContact: true,
    noApproach: true,
    separateLiving: false,
    weaponsSurrender: false,
    mandatoryRehab: true,
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/protection-orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch protection orders error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtend30Days = async (order: ProtectionOrder) => {
    setExtendingId(order.id);
    try {
      const res = await fetch(`/api/protection-orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extend30Days: true }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Extend order error:', err);
    } finally {
      setExtendingId(null);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!victimName || !offenderName) return;

    try {
      const res = await fetch('/api/protection-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          victimName,
          victimPinfl,
          victimPhone,
          victimAddress,
          offenderName,
          offenderPinfl,
          offenderPhone,
          offenderRelationship,
          district,
          mahalla,
          incidentSummary,
          restrictions,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        // Reset form
        setVictimName('');
        setVictimPinfl('');
        setVictimPhone('');
        setVictimAddress('');
        setOffenderName('');
        setOffenderPinfl('');
        setOffenderPhone('');
        setIncidentSummary('');
        fetchOrders();
      }
    } catch (err) {
      console.error('Create protection order error:', err);
    }
  };

  const calculateDaysLeft = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSendToProtocolDraft = (order: ProtectionOrder) => {
    const text = `MA’MURIY HUQUQBUZARLIK TO‘G‘RISIDA BAYONNOMA
(O‘zbekiston Respublikasi MJtK 206-1-moddasi)

Tuzilgan joyi: Toshkent shahar, ${order.district}
Sana: ${new Date().toLocaleDateString('uz-UZ')}
Bayonnoma tuzuvchi: ${order.inspectorRank} ${order.inspectorName}

HUQUQBUZARLIK TAVSIFI:
Fuqaro ${order.offenderName} (JSHSHIR: ${order.offenderPinfl}) ga nisbatan 2025-yil ${order.issuedDate} sanasida ${order.orderNumber}-sonli Himoya orderi berilgan edi.

Biroq, huquqbuzar ${order.offenderName} himoya orderida belgilangan taqiqlarga (jabrlanuvchi ${order.victimName} ga yaqinlashish va tazyiq o‘tkazish taqiqlanganiga) qaramasdan, qonun talablarini qasddan buzib, jabrlanuvchining tinchini buzgan va tazyiq o‘tkazgan.

HUQUQIY BAHOLASH:
Mazkur harakat O‘zbekiston Respublikasi Ma’muriy javobgarlik to‘g‘risidagi kodeksining 206-1-moddasi ("Tazyiq o‘tkazgan va (yoki) zo‘ravonlik sodir etgan yoxud ularni sodir etishga moyil bo‘lgan shaxs tomonidan himoya orderi talablarini bajarmaslik") bo‘yicha kvalifikatsiya qilinadi.

SANSIYA:
BHMning 1 baravaridan 3 baravarigacha miqdorda jarima yoki o‘n besh sutkagacha muddatga ma’muriy qamoqqa olishga sabab bo‘ladi.

Hujjatlar tuman ma’muriy sudiga ko‘rib chiqish uchun yuboriladi.

Bayonnomani tuzdi: ${currentUser?.rank} ${currentUser?.fullName}
Imzo: _______________`;

    onSendToDocumentBuilder(text, `${order.orderNumber} bo‘yicha MJtK 206-1 bayonnomasi`);
  };

  const handleSendFullOrderToDraft = (order: ProtectionOrder) => {
    const text = `O‘ZBEKISTON RESPUBLIKASI ICHKI ISHLAR VAZIRLIGI
HIMOYA ORDERI
(O‘zbekiston Respublikasining "Xotin-qizlarni tazyiq va zo‘ravonlikdan himoya qilish to‘g‘risida"gi Qonuni, O‘RQ-561)

Order raqami: ${order.orderNumber}
Berilgan sana: ${order.issuedDate}
Amal qilish muddati: ${order.expiryDate} (30 kun)
Tuman/Shahar: ${order.district}, ${order.mahalla}

1. JABRLANUVCHI FUQARO:
- F.I.Sh.: ${order.victimName}
- JSHSHIR: ${order.victimPinfl}
- Yashash manzili: ${order.victimAddress}
- Telefon: ${order.victimPhone}

2. TAZYIQ VA ZO‘RAVONLIK SODIR ETGAN SHAXS:
- F.I.Sh.: ${order.offenderName}
- JSHSHIR: ${order.offenderPinfl}
- Qarindoshlik munosabati: ${order.offenderRelationship}
- Telefon: ${order.offenderPhone}

3. BELGILANGAN CHEKLOVLAR RO‘YXATI:
${order.restrictions.noViolence ? '[x] Tazyiq o‘tkazish va zo‘ravonlik sodir etishni taqiqlash\n' : ''}${order.restrictions.noContact ? '[x] Jabrlanuvchi bilan har qanday vositada muloqot qilishni taqiqlash\n' : ''}${order.restrictions.noApproach ? '[x] Jabrlanuvchi yashash va ish joyiga 50 metrdan yaqin kelishni taqiqlash\n' : ''}${order.restrictions.separateLiving ? '[x] Jabrlanuvchi bilan bir xonada yolg‘iz qolishni taqiqlash\n' : ''}${order.restrictions.mandatoryRehab ? '[x] Majburiy tuzatish-targ‘ibot dasturidan o‘tish majburiyati\n' : ''}

OGOHLANTIRISH:
Ushbu himoya orderi talablarini bajarmaslik O‘zbekiston Respublikasi MJtKning 206-1-moddasiga asosan ma’muriy javobgarlikka, shu jumladan 15 sutkagacha ma’muriy qamoqqa olishga sabab bo‘ladi.

Profilaktika inspektori: ${order.inspectorRank} ${order.inspectorName}
Xizmat telefoni: ${order.inspectorPhone}
Tasdiqlovchi xodim: ${currentUser?.rank} ${currentUser?.fullName}
Elektron reestr kodi: IIV-HO-${order.id}-UZ`;

    onSendToDocumentBuilder(text, `${order.orderNumber} to‘liq Himoya orderi`);
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'Faol' && o.status !== 'Faol') return false;
    if (filterStatus === 'Uzatilgan' && o.status !== 'Uzatilgan') return false;
    if (filterStatus === 'Buzilgan' && o.status !== 'Buzilgan') return false;
    if (filterStatus === 'Tugatilgan' && o.status !== 'Tugatilgan') return false;
    if (filterStatus === 'Urgent') {
      const days = calculateDaysLeft(o.expiryDate);
      if (days > 5 || o.status !== 'Faol') return false;
    }

    if (searchQuery) {
      const clean = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(clean) ||
        o.victimName.toLowerCase().includes(clean) ||
        o.offenderName.toLowerCase().includes(clean) ||
        o.mahalla.toLowerCase().includes(clean)
      );
    }
    return true;
  });

  const totalCount = orders.length;
  const activeCount = orders.filter((o) => o.status === 'Faol' || o.status === 'Uzatilgan').length;
  const urgentCount = orders.filter(
    (o) => (o.status === 'Faol' || o.status === 'Uzatilgan') && calculateDaysLeft(o.expiryDate) <= 5
  ).length;
  const violatedCount = orders.filter((o) => o.status === 'Buzilgan').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>O‘RQ-561 Qonuni Ijrosi & Monitoringi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              E-Himoya Orderi va Profilaktik Hisob Boshqaruvi
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Xotin-qizlarni tazyiq va zo‘ravonlikdan himoya qilish to‘g‘risidagi qonun asosida berilgan orderlar, 30 kunlik muddat nazorati va cheklovlar monitoringi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Yangi Himoya Orderi</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Jami orderlar</span>
              <div className="text-xl font-bold text-white mt-0.5">{totalCount} ta</div>
            </div>
            <FileText className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Amaldagi (Faol)</span>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">{activeCount} ta</div>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">5 kun qolgan (Tezkor)</span>
              <div className="text-xl font-bold text-amber-400 mt-0.5">{urgentCount} ta</div>
            </div>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Buzilgan (MJtK 206-1)</span>
              <div className="text-xl font-bold text-rose-400 mt-0.5">{violatedCount} ta</div>
            </div>
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Barchasi ({totalCount})
          </button>
          <button
            onClick={() => setFilterStatus('Faol')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === 'Faol'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Faol ({orders.filter((o) => o.status === 'Faol').length})
          </button>
          <button
            onClick={() => setFilterStatus('Urgent')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === 'Urgent'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Muddati yaqinlashgan ({urgentCount})
          </button>
          <button
            onClick={() => setFilterStatus('Buzilgan')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === 'Buzilgan'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Buzilgan ({violatedCount})
          </button>
          <button
            onClick={() => setFilterStatus('Tugatilgan')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterStatus === 'Tugatilgan'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Tugatilgan / Yarashgan ({orders.filter((o) => o.status === 'Tugatilgan').length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Order raqami, F.I.Sh. yoki mahalla..."
            className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            Ushbu toifada himoya orderi topilmadi.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const daysLeft = calculateDaysLeft(order.expiryDate);
            const isViolated = order.status === 'Buzilgan';
            const isCompleted = order.status === 'Tugatilgan';
            const isUrgent = daysLeft <= 5 && !isCompleted;

            return (
              <div
                key={order.id}
                className={`bg-slate-900 border rounded-2xl p-5 transition-all shadow-md space-y-4 ${
                  isViolated
                    ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                    : isUrgent
                    ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/30">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-slate-400">
                      {order.district}, {order.mahalla}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        order.status === 'Faol'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : order.status === 'Uzatilgan'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          : order.status === 'Buzilgan'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>

                    {/* Countdown Badge */}
                    {!isCompleted && (
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                          daysLeft <= 0
                            ? 'bg-rose-950 text-rose-300 border border-rose-600'
                            : daysLeft <= 5
                            ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                            : 'bg-slate-950 text-slate-300 border border-slate-800'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft <= 0
                          ? 'Muddati tugagan'
                          : `${daysLeft} kun qoldi`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main 2-Party Columns (Jabrlanuvchi vs Tazyiq O'tkazgan) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Party 1: Victim */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                      Jabrlanuvchi (Xotin-qiz):
                    </span>
                    <div className="text-sm font-bold text-white">{order.victimName}</div>
                    <div className="text-slate-400 flex items-center justify-between pt-1">
                      <span className="font-mono text-slate-300">JSHSHIR: {order.victimPinfl}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.victimPhone}
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1 pt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{order.victimAddress}</span>
                    </div>
                  </div>

                  {/* Party 2: Offender */}
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                      Tazyiq va zo‘ravonlik sodir etgan shaxs:
                    </span>
                    <div className="text-sm font-bold text-white flex items-center justify-between">
                      <span>{order.offenderName}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-normal">
                        {order.offenderRelationship}
                      </span>
                    </div>
                    <div className="text-slate-400 flex items-center justify-between pt-1">
                      <span className="font-mono text-slate-300">JSHSHIR: {order.offenderPinfl}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.offenderPhone}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-0.5 italic">
                      Monitoring tashriflari: {order.monitoringVisitsCount} marta | Oxirgi: {order.lastVisitDate}
                    </div>
                  </div>
                </div>

                {/* Restrictions Badges */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Qo‘llanilgan cheklovlar ro‘yxati (Qonun 26-modda):
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {order.restrictions.noViolence && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-medium">
                        Tazyiq o‘tkazish taqiqlangan
                      </span>
                    )}
                    {order.restrictions.noContact && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-medium">
                        Muloqot qilish taqiqlangan
                      </span>
                    )}
                    {order.restrictions.noApproach && (
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-medium">
                        Yaqinlashish taqiqlangan (50m)
                      </span>
                    )}
                    {order.restrictions.separateLiving && (
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-medium">
                        Yolg‘iz qolish taqiqlangan
                      </span>
                    )}
                    {order.restrictions.mandatoryRehab && (
                      <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-medium">
                        Majburiy tuzatish dasturi
                      </span>
                    )}
                  </div>
                </div>

                {/* Incident Summary */}
                {order.incidentSummary && (
                  <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                    <strong className="text-slate-400">Holat tafsiloti:</strong> {order.incidentSummary}
                  </p>
                )}

                {/* Bottom Action Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Inspektor: <strong className="text-slate-200">{order.inspectorRank} {order.inspectorName}</strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Extend 30 days button */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleExtend30Days(order)}
                        disabled={extendingId === order.id}
                        className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-500/40 hover:bg-blue-600/30 transition flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 ${
                            extendingId === order.id ? 'animate-spin' : ''
                          }`}
                        />
                        <span>30 kunga uzaytirish</span>
                      </button>
                    )}

                    {/* Protocol button if violated */}
                    <button
                      onClick={() => handleSendToProtocolDraft(order)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 transition flex items-center gap-1 font-semibold"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>MJtK 206-1 Bayonnoma</span>
                    </button>

                    {/* Full document draft */}
                    <button
                      onClick={() => handleSendFullOrderToDraft(order)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Orderni ko‘rish &rarr;</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: New Protection Order Registration */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Yangi Himoya Orderi Rasmiylashtirish (O‘RQ-561)
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              {/* Section 1: Jabrlanuvchi */}
              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  1. Jabrlanuvchi fuqaro ma’lumotlari:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">F.I.Sh. *</label>
                    <input
                      type="text"
                      required
                      value={victimName}
                      onChange={(e) => setVictimName(e.target.value)}
                      placeholder="Masalan: Karimova Dilnoza Shuhratovna"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">JSHSHIR (PINFL)</label>
                    <input
                      type="text"
                      value={victimPinfl}
                      onChange={(e) => setVictimPinfl(e.target.value)}
                      placeholder="14 xonali raqam"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Telefon</label>
                    <input
                      type="text"
                      value={victimPhone}
                      onChange={(e) => setVictimPhone(e.target.value)}
                      placeholder="+998 90 123-45-67"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Yashash manzili</label>
                    <input
                      type="text"
                      value={victimAddress}
                      onChange={(e) => setVictimAddress(e.target.value)}
                      placeholder="Amir Temur ko‘chasi, 24-uy"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Tazyiq o'tkazuvchi */}
              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  2. Tazyiq va zo‘ravonlik sodir etgan shaxs:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">F.I.Sh. *</label>
                    <input
                      type="text"
                      required
                      value={offenderName}
                      onChange={(e) => setOffenderName(e.target.value)}
                      placeholder="Masalan: Karimov Otabek Dilshodovich"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Qarindoshlik darajasi</label>
                    <select
                      value={offenderRelationship}
                      onChange={(e) => setOffenderRelationship(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Turmush o‘rtog‘i">Turmush o‘rtog‘i</option>
                      <option value="Sobiq eri">Sobiq eri</option>
                      <option value="O‘g‘li / Qizi">O‘g‘li / Qizi</option>
                      <option value="Qaynona / Qaynota">Qaynona / Qaynota</option>
                      <option value="Yaqin qarindoshi">Yaqin qarindoshi</option>
                      <option value="Qo‘shnisi">Qo‘shnisi</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">JSHSHIR</label>
                    <input
                      type="text"
                      value={offenderPinfl}
                      onChange={(e) => setOffenderPinfl(e.target.value)}
                      placeholder="14 xonali raqam"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Telefon</label>
                    <input
                      type="text"
                      value={offenderPhone}
                      onChange={(e) => setOffenderPhone(e.target.value)}
                      placeholder="+998 90 999-88-77"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Restrictions Checklist */}
              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
                  3. Qo‘llaniladigan taqiq va majburiyatlar:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.noViolence}
                      onChange={(e) =>
                        setRestrictions({ ...restrictions, noViolence: e.target.checked })
                      }
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span>Tazyiq va zo‘ravonlikni taqiqlash</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.noContact}
                      onChange={(e) =>
                        setRestrictions({ ...restrictions, noContact: e.target.checked })
                      }
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span>Aloqa va muloqotni taqiqlash</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.noApproach}
                      onChange={(e) =>
                        setRestrictions({ ...restrictions, noApproach: e.target.checked })
                      }
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span>Yaqinlashishni taqiqlash (kamida 50m)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.separateLiving}
                      onChange={(e) =>
                        setRestrictions({ ...restrictions, separateLiving: e.target.checked })
                      }
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span>Bir xonada yolg‘iz qolishni taqiqlash</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.weaponsSurrender}
                      onChange={(e) =>
                        setRestrictions({ ...restrictions, weaponsSurrender: e.target.checked })
                      }
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span>Qurol saqlash/olib yurishni to‘xtatish</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.mandatoryRehab}
                      onChange={(e) =>
                        setRestrictions({ ...restrictions, mandatoryRehab: e.target.checked })
                      }
                      className="rounded bg-slate-900 border-slate-700 text-blue-600"
                    />
                    <span>Majburiy tuzatish dasturidan o‘tish</span>
                  </label>
                </div>
              </div>

              {/* Section 4: Incident Details */}
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  Voqea tafsiloti va asos bo‘lgan holat
                </label>
                <textarea
                  rows={2}
                  value={incidentSummary}
                  onChange={(e) => setIncidentSummary(e.target.value)}
                  placeholder="Spirtli ichimlik ta’sirida oilaviy nizo keltirib chiqarganligi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Info notice */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-lg p-2.5 text-[11px] text-blue-200 flex items-center justify-between">
                <span>
                  Amal qilish muddati: <strong>30 kalendar kun</strong> (Avtomatik hisoblanadi)
                </span>
                <span className="font-mono text-emerald-400 font-bold">Faol holatda saqlanadi</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Orderni tasdiqlash va saqlash</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
