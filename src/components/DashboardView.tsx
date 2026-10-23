import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  PlusCircle,
  Search,
  MessageSquareCode,
  Shield,
  FileClock,
  Layers,
  ChevronRight,
  Scale,
  Mic,
  Inbox,
  BarChart3,
  GraduationCap,
  Car,
  Compass,
  ShieldAlert,
} from 'lucide-react';
import { User, DashboardStats, DocumentItem, TaskItem } from '../types';

interface DashboardViewProps {
  currentUser: User | null;
  stats: DashboardStats | null;
  onNavigate: (view: string, extra?: any) => void;
  onQuickAiPrompt: (prompt: string) => void;
  onOpenDocument: (doc: DocumentItem) => void;
  onOpenVoiceModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  stats,
  onNavigate,
  onQuickAiPrompt,
  onOpenDocument,
  onOpenVoiceModal,
}) => {
  const quickAiActions = [
    {
      title: 'Tungi reyd bildirgisi',
      desc: 'Tungi profilaktik tadbirlar natijalari bo‘yicha rasmiy xizmat xati qoralamasini tuzish',
      prompt: 'Yunusobod tumanidagi tungi ko‘ngilochar maskanlarda o‘tkazilgan profilaktik reyd natijalari bo‘yicha bo‘lim boshlig‘i nomiga xizmat bildirgisi qoralamasini tuzib ber.',
      icon: FileText,
      color: 'from-blue-600/30 to-blue-900/40 border-blue-600/40 text-blue-200',
    },
    {
      title: 'Xizmat tushuntirish xati',
      desc: 'Navbatchilik yoki xizmat vazifalaridagi holatlar bo‘yicha yozma tushuntirish matni',
      prompt: 'Xizmat vazifalarini bajarish chog‘ida yuzaga kelgan kechikish sabablari yuzasidan bo‘lim boshlig‘i nomiga rasmiy tushuntirish xati qoralamasini tayyorlashda yordam ber.',
      icon: Clock,
      color: 'from-amber-600/30 to-amber-900/40 border-amber-600/40 text-amber-200',
    },
    {
      title: 'Me’yoriy hujjat tahlili',
      desc: 'O‘RQ-407 va xizmat intizomi Kodeksining moddalari bo‘yicha tezkor maslahat',
      prompt: 'Ichki ishlar organi xodimi tomonidan jismoniy kuch ishlatish va maxsus vositalarni qo‘llash shartlari (O‘RQ-407, 21-modda) qanday belgilangan?',
      icon: Search,
      color: 'from-emerald-600/30 to-emerald-900/40 border-emerald-600/40 text-emerald-200',
    },
    {
      title: 'Matnni idoraviy uslubga solish',
      desc: 'Erkin yozilgan xizmat axborotini rasmiy-idoraviy tilda grammatik tahrirlash',
      prompt: 'Quyidagi matnni Ichki ishlar organlari talablariga mos rasmiy idoraviy uslubga solib, imlo xatolarini to‘g‘rilab ber:\n"Biz kecha kechasi hududda aylanib yurdik, ikkita joyda qoidabuzar ushladik, dalolatnoma qildik."',
      icon: Sparkles,
      color: 'from-sky-600/30 to-sky-900/40 border-sky-600/40 text-sky-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome & Service Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-blue-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>O‘zbekiston Respublikasi Ichki Ishlar Vazirligi</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Xush kelibsiz, {currentUser?.rank} {currentUser?.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {currentUser?.department} | Xizmat guvohnomasi:{' '}
              <span className="font-mono text-blue-300">{currentUser?.badgeNumber}</span>
              {currentUser?.role === 'rahbar' && ' (Rahbar vakolati faol)'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenVoiceModal && (
              <button
                onClick={onOpenVoiceModal}
                className="px-3 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition hover:scale-[1.02]"
              >
                <Mic className="w-3.5 h-3.5" />
                Ovozli diktovka
              </button>
            )}
            <button
              onClick={() => onNavigate('legal')}
              className="px-3 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Scale className="w-3.5 h-3.5 text-indigo-300" />
              Huquqiy baho
            </button>
            <button
              onClick={() => onNavigate('documents', { mode: 'create' })}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Yangi hujjat
            </button>
            <button
              onClick={() => onNavigate('chat')}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-sky-400" />
              AI Chat
            </button>
          </div>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Jami hujjatlar */}
        <div
          onClick={() => onNavigate('documents')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Jami hujjatlar</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats?.totalDocuments ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Bo‘linma fondi</span>
            <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Ko‘rish &rarr;
            </span>
          </div>
        </div>

        {/* Card 2: Qoralamalar */}
        <div
          onClick={() => onNavigate('documents', { status: 'Qoralama' })}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Qoralamalar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats?.draftDocuments ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Tahrir talab</span>
            <span className="text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Ko‘rish &rarr;
            </span>
          </div>
        </div>

        {/* Card 3: Tekshiruvda / Tasdiqlangan */}
        <div
          onClick={() => onNavigate('documents', { status: 'Tekshiruvda' })}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tekshiruvda / Tasdiqlangan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2 flex items-baseline gap-2">
            <span>{stats?.reviewDocuments ?? 0}</span>
            <span className="text-xs font-normal text-slate-400">
              / {stats?.approvedDocuments ?? 0} tasdiqlangan
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Rahbariyat ko‘rigida</span>
            <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Ko‘rish &rarr;
            </span>
          </div>
        </div>

        {/* Card 4: Topshiriqlar */}
        <div
          onClick={() => onNavigate('tasks')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Kutilayotgan vazifalar</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2 flex items-baseline gap-2">
            <span>{stats?.pendingTasks ?? 0}</span>
            {stats && stats.overdueTasks > 0 && (
              <span className="text-xs text-rose-400 font-semibold">
                ({stats.overdueTasks} ta muddati o‘tgan)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Nazoratdagi topshiriqlar</span>
            <span className="text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Ko‘rish &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* AI Quick Actions (Tezkor Murojaat) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              AI Yordamchiga Tezkor Murojaat
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Bir bosish orqali xizmat vazifalarini bajaring
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {quickAiActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <div
                key={idx}
                onClick={() => onQuickAiPrompt(action.prompt)}
                className={`bg-gradient-to-b ${action.color} border rounded-xl p-4 hover:scale-[1.01] transition-all cursor-pointer shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{action.title}</span>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {action.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-sky-300">Shakllantirish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Special Service Modules (Maxsus Xizmat Modullari) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Ixtisoslashtirilgan Xizmat Modullari
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Ichki ishlar organlari faoliyatini to‘liq raqamlashtirish vositalari
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Module 1: E-Patrul & Smart Search */}
          <div
            onClick={() => onNavigate('epatrol')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-rose-300 transition-colors">
                  E-Patrul & Qidiruv
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                  Tezkor
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Avtotransport davlat raqami, JSHSHIR (PINFL), pasport va qidiruv bazasi.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-rose-400 font-medium">
              <span>Tekshirish</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 2: Kriminogen GIS Xarita */}
          <div
            onClick={() => onNavigate('crimemap')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                  Kriminogen GIS Xarita
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Qizil/Sariq/Yashil
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Mahallalar xavfsizlik toifalari, jonli patrul ekipajlari va 102 chaqiruvlari.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
              <span>Xaritani ochish</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 3: E-Himoya Orderi */}
          <div
            onClick={() => onNavigate('protection')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                  E-Himoya Orderi
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                  O‘RQ-561
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Tazyiqdan himoya qilish, 30 kunlik muddat hisoblagichi va cheklovlar ijrosi.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-indigo-400 font-medium">
              <span>Reyestrga o‘tish</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 4: Legal Advisor */}
          <div
            onClick={() => onNavigate('legal')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors">
                Huquqiy Kvalifikatsiya
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                MJtK va JK moddalari, sanksiyalar, dalillar ro‘yxati va bayonnoma matni.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-sky-400 font-medium">
              <span>Baho olish</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 5: Voice Dictation */}
          <div
            onClick={() => onOpenVoiceModal ? onOpenVoiceModal() : onNavigate('documents')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Mic className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-blue-300 transition-colors">
                Ovozli Diktovka
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Dala sharoitida ovozli xabardan rasmiy xizmat bildirgisini shakllantirish.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-blue-400 font-medium">
              <span>Yozib olish</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 6: Citizen Appeals */}
          <div
            onClick={() => onNavigate('appeals')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Inbox className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                Murojaatlar Nazorati
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                15/30 kunlik muddat hisobi, avto-xulosa va javob xati loyihasi.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400 font-medium">
              <span>Murojaatlar</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 7: Analytics */}
          <div
            onClick={() => onNavigate('analytics')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">
                Kriminogen Tahlil
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Tumanlar kriminogen holati, toifalar taqsimoti va AI tavsiyalari.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-medium">
              <span>Statistika</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Module 8: Training Exam */}
          <div
            onClick={() => onNavigate('training')}
            className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                Attestatsiya & Testlar
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                O‘RQ-407, Odob-axloq va me’yoriy hujjatlar bo‘yicha interaktiv sinov.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-purple-400 font-medium">
              <span>Test topshirish</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Documents & Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Recent Documents */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                So‘nggi Hujjatlar
              </h3>
            </div>
            <button
              onClick={() => onNavigate('documents')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
            >
              Barcha hujjatlar &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {stats?.recentDocuments && stats.recentDocuments.length > 0 ? (
              stats.recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDocument(doc)}
                  className="py-3 px-2 rounded-lg hover:bg-slate-800/60 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {doc.docNumber}
                      </span>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate group-hover:text-sky-300">
                        {doc.title}
                      </h4>
                      {doc.aiAssisted && (
                        <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30">
                          AI
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-1">
                      Ijrochi: {doc.creatorRank} {doc.creatorName} | {new Date(doc.createdAt).toLocaleDateString('uz-UZ')}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold border ${
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
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Hozircha saqlangan hujjatlar mavjud emas
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 span): Urgent Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Ijro Nazorati
              </h3>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              Barchasi &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {stats?.recentTasks && stats.recentTasks.length > 0 ? (
              stats.recentTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => onNavigate('tasks')}
                  className="p-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                      {task.title}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 border ${
                        task.priority === 'Yuqori'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : task.priority === 'O\'rta'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ijrochi: {task.assignedToName.split(' ')[0]}</span>
                    <span
                      className={`font-mono ${
                        task.status === 'Muddati o\'tgan'
                          ? 'text-rose-400 font-semibold'
                          : 'text-slate-400'
                      }`}
                    >
                      {new Date(task.deadline).toLocaleDateString('uz-UZ', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                Nazoratdagi topshiriqlar yo‘q
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Audit Log Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              So‘nggi xizmat faoliyati (Audit jurnali)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('audit')}
            className="text-xs text-slate-400 hover:text-slate-200 font-semibold"
          >
            To‘liq audit jurnali &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats?.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
            stats.recentAuditLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs text-slate-300 space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-semibold text-blue-400">{log.userName}</span>
                  <span className="font-mono">
                    {new Date(log.timestamp).toLocaleTimeString('uz-UZ', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 line-clamp-1 font-medium">
                  {log.details}
                </p>
                <div className="text-[9px] text-slate-500 font-mono flex items-center justify-between">
                  <span>{log.action}</span>
                  <span>IP: {log.ipAddress}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-4 text-center text-xs text-slate-500">
              Faoliyat yozuvlari mavjud emas
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
