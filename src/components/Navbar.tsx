import React, { useState, useEffect } from 'react';
import {
  Shield,
  Bell,
  Lock,
  ChevronDown,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  pendingReviewsCount: number;
  urgentTasksCount: number;
  onNavigate: (view: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  pendingReviewsCount,
  urgentTasksCount,
  onNavigate,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalAlerts = pendingReviewsCount + urgentTasksCount;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 select-none shadow-md">
      {/* Top micro banner for state identity */}
      <div className="h-1 bg-gradient-to-r from-blue-700 via-emerald-600 to-sky-500 w-full" />

      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left: Emblem & System Title */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900 to-slate-900 border border-blue-500/40 flex items-center justify-center shadow-inner text-blue-400">
            <Shield className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-wide text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                IIV AI YORDAMCHI
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Xizmat tizimi
                </span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Ichki ishlar organlari xodimlari uchun sun’iy intellekt platformasi
            </p>
          </div>
        </div>

        {/* Center: Security Badge & Live Clock */}
        <div className="hidden md:flex items-center space-x-4 text-xs text-slate-400 border border-slate-800 bg-slate-950/60 px-3 py-1.5 rounded-lg">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">Himoyalangan xizmat tarmog‘i</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-1 text-slate-300 font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentTime || '12:00:00'}</span>
          </div>
        </div>

        {/* Right: Notifications & Role Switcher */}
        <div className="flex items-center space-x-3">
          {/* Notifications button */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 relative transition-colors focus:outline-none"
              title="Xizmat bildirishnomalari"
            >
              <Bell className="w-5 h-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center justify-center rounded-full ring-2 ring-slate-900 animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Xizmat bildirishnomalari
                  </h4>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto text-xs">
                  {pendingReviewsCount > 0 && (
                    <div
                      onClick={() => {
                        setNotifOpen(false);
                        onNavigate('documents');
                      }}
                      className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-800/60 hover:bg-blue-900/60 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-blue-200">
                        {pendingReviewsCount} ta hujjat tekshiruvda
                      </p>
                      <p className="text-slate-400 mt-0.5 text-[11px]">
                        Rahbar tasdig‘i talab qilinadigan xizmat xatlari
                      </p>
                    </div>
                  )}

                  {urgentTasksCount > 0 && (
                    <div
                      onClick={() => {
                        setNotifOpen(false);
                        onNavigate('tasks');
                      }}
                      className="p-2.5 rounded-lg bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/60 cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-amber-200">
                        {urgentTasksCount} ta muddati yaqin vazifa
                      </p>
                      <p className="text-slate-400 mt-0.5 text-[11px]">
                        Bugun yoki 24 soat ichida bajarilishi shart bo‘lgan topshiriqlar
                      </p>
                    </div>
                  )}

                  {totalAlerts === 0 && (
                    <div className="py-6 text-center text-slate-500">
                      <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                      Yangi favqulodda xabarlar yo‘q
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Quick RBAC switcher */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 px-2.5 py-1.5 rounded-lg transition text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-800 border border-blue-400 flex items-center justify-center font-bold text-xs text-blue-100 shadow-sm">
                {currentUser?.avatar || 'IIV'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-100 truncate max-w-[130px]">
                  {currentUser?.rank} {currentUser?.fullName.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      currentUser?.role === 'rahbar'
                        ? 'bg-amber-400'
                        : currentUser?.role === 'admin'
                        ? 'bg-purple-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                  <span className="capitalize">{currentUser?.role}</span>
                  <span className="text-slate-600 font-mono">({currentUser?.badgeNumber})</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {/* RBAC Role Selector Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Xodimni almashtirish (RBAC sinovi)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Har bir rol o‘z vakolat doirasidagi ruxsatlarga ega
                  </p>
                </div>

                <div className="space-y-1">
                  {allUsers.map((u) => {
                    const isSelected = u.id === currentUser?.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-blue-900/50 text-blue-200 border border-blue-700/60'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] ${
                              u.role === 'rahbar'
                                ? 'bg-amber-900/60 text-amber-300 border border-amber-600/40'
                                : u.role === 'admin'
                                ? 'bg-purple-900/60 text-purple-300 border border-purple-600/40'
                                : 'bg-blue-950 text-blue-300 border border-blue-700/40'
                            }`}
                          >
                            {u.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">
                              {u.rank} {u.fullName.split(' ')[0]}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {u.role === 'rahbar'
                                ? 'Rahbar (Tasdiqlash vakolati)'
                                : u.role === 'admin'
                                ? 'Administrator (Texnik nazorat)'
                                : 'Xodim (Qoralamalar va ijro)'}
                            </p>
                          </div>
                        </div>
                        {isSelected && <UserCheck className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    Gemini 3.8 Flash
                  </span>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate('settings');
                    }}
                    className="text-sky-400 hover:underline"
                  >
                    Kabinet &rarr;
                  </button>
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full mt-2 py-1.5 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Tizimdan xavfsiz chiqish</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Lock / Logout Icon Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              title="Tizimni qulflash / Chiqish"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
