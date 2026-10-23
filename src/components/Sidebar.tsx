import React from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  FileText,
  Search,
  CheckSquare,
  History,
  Settings,
  ShieldAlert,
  ChevronRight,
  Scale,
  Inbox,
  BarChart3,
  GraduationCap,
  Mic,
  Car,
  Compass,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  tasksCount?: number;
  docsCount?: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenVoiceModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  tasksCount = 0,
  docsCount = 0,
  mobileOpen,
  onCloseMobile,
  onOpenVoiceModal,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Bosh sahifa',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'chat',
      label: 'AI Chat Yordamchisi',
      icon: MessageSquareCode,
      badge: '3.8 AI',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    },
    {
      id: 'epatrol',
      label: 'E-Patrul & Qidiruv',
      icon: Car,
      badge: 'Tezkor',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    },
    {
      id: 'crimemap',
      label: 'Kriminogen GIS Xarita',
      icon: Compass,
      badge: 'GIS',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'protection',
      label: 'E-Himoya Orderi',
      icon: ShieldAlert,
      badge: 'O‘RQ-561',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'documents',
      label: 'Hujjat yaratish',
      icon: FileText,
      badge: docsCount > 0 ? docsCount : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
    {
      id: 'knowledge',
      label: 'Me’yoriy baza va qidiruv',
      icon: Search,
      badge: 'RAG',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'legal',
      label: 'Huquqiy baho & Moddalar',
      icon: Scale,
      badge: 'MJtK',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'appeals',
      label: 'Fuqarolar murojaatlari',
      icon: Inbox,
      badge: null,
    },
    {
      id: 'analytics',
      label: 'Kriminogen tahlil',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'training',
      label: 'Attestatsiya & Testlar',
      icon: GraduationCap,
      badge: 'Test',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'tasks',
      label: 'Topshiriqlar va vazifalar',
      icon: CheckSquare,
      badge: tasksCount > 0 ? tasksCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'audit',
      label: 'Faoliyat tarixi va audit',
      icon: History,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Shaxsiy kabinet va sozlamalar',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 lg:top-16 z-50 lg:z-30 h-[calc(100vh-4rem)] w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="py-4 px-3 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Asosiy menyu
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ml-1.5 ${
                        isActive
                          ? 'bg-blue-700/80 text-blue-100 border-blue-400/40'
                          : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-2 space-y-2">
          {/* Quick Voice Dictation Trigger */}
          {onOpenVoiceModal && (
            <button
              onClick={() => {
                onOpenVoiceModal();
                onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600/20 to-blue-600/30 border border-sky-500/40 hover:border-sky-400 text-sky-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition hover:scale-[1.01]"
            >
              <Mic className="w-3.5 h-3.5 text-sky-400" />
              <span>Ovozli Diktovka</span>
            </button>
          )}

          {/* Bottom Officer Status Card */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/40 rounded-xl border">
          <div className="flex items-start space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 truncate">
                  {currentUser?.rank}
                </span>
                <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  FAOL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {currentUser?.department || 'Toshkent shahar IIBB'}
              </p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                Guvohnoma: {currentUser?.badgeNumber}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
    </>
  );
};
