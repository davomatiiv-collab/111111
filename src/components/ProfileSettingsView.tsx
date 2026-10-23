import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Shield,
  Bell,
  Lock,
  Key,
  Database,
  CheckCircle2,
  Save,
  Server,
  Sparkles,
  Smartphone,
  Eye,
  LogOut,
} from 'lucide-react';
import { User, UserSettings } from '../types';

interface ProfileSettingsViewProps {
  currentUser: User | null;
  settings: UserSettings | null;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onSwitchUser: (userId: string) => void;
  onLogout?: () => void;
}

export const ProfileSettingsView: React.FC<ProfileSettingsViewProps> = ({
  currentUser,
  settings,
  onUpdateSettings,
  onSwitchUser,
  onLogout,
}) => {
  const [notificationsInApp, setNotificationsInApp] = useState(
    settings?.notificationsInApp ?? true
  );
  const [notificationsEmail, setNotificationsEmail] = useState(
    settings?.notificationsEmail ?? true
  );
  const [twoFactorAuth, setTwoFactorAuth] = useState(
    settings?.twoFactorAuth ?? true
  );
  const [autoSaveDrafts, setAutoSaveDrafts] = useState(
    settings?.autoSaveDrafts ?? true
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setNotificationsInApp(settings.notificationsInApp);
      setNotificationsEmail(settings.notificationsEmail);
      setTwoFactorAuth(settings.twoFactorAuth);
      setAutoSaveDrafts(settings.autoSaveDrafts);
    }
  }, [settings]);

  const handleSave = () => {
    onUpdateSettings({
      notificationsInApp,
      notificationsEmail,
      twoFactorAuth,
      autoSaveDrafts,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Shaxsiy Kabinet va Xavfsizlik Sozlamalari
            </h1>
            <p className="text-xs text-slate-400">
              Xizmat guvohnomasi rekvizitlari, xavfsizlik parametrlari va bildirishnomalar
            </p>
          </div>
        </div>

        {savedSuccess && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            Saqlandi
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Official Credential Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-700 to-slate-900 border-2 border-blue-400 flex items-center justify-center font-bold text-2xl text-blue-100 shadow-lg">
              {currentUser?.avatar || 'IIV'}
            </div>
            <h2 className="text-sm font-bold text-white mt-3">
              {currentUser?.rank} {currentUser?.fullName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{currentUser?.department}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Xizmatda (Faol)
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Guvohnoma raqami:</span>
              <span className="font-mono font-bold text-blue-300">
                {currentUser?.badgeNumber}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Xizmat elektron pochtasi:</span>
              <span className="font-mono text-slate-300">{currentUser?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Tizimdagi roli:</span>
              <span className="font-bold uppercase text-sky-400">
                {currentUser?.role}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Autentifikatsiya:</span>
              <span className="text-emerald-400 font-semibold">Yagona Idoraviy SSO</span>
            </div>
          </div>

          {/* Role Privileges Overview */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
            <span className="font-bold text-slate-300 uppercase tracking-wider block">
              Rol bo‘yicha vakolatlar:
            </span>
            <p className="text-slate-400 leading-relaxed">
              {currentUser?.role === 'rahbar'
                ? 'Bo‘lim hujjatlarini tekshirish, tasdiqlash yoki kamchiliklar bilan qaytarish, bo‘ysunuvchi xodimlarga topshiriq biriktirish huquqi.'
                : currentUser?.role === 'admin'
                ? 'Tizim konfiguratsiyasi, audit jurnalini nazorat qilish, me’yoriy bazaga yangi hujjatlarni yuklash va indekslash.'
                : 'O‘z xizmat hujjatlari qoralamalarini tuzish, AI yordamchidan foydalanish, biriktirilgan topshiriqlar holatini yangilash.'}
            </p>
          </div>
        </div>

        {/* Right Columns (2 spans): Settings Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Notification settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Xizmat Bildirishnomalari Sozlamalari
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">
                    Ilova ichidagi bildirishnomalar (In-App)
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Tekshiruvga kelgan hujjatlar va yaqinlashayotgan topshiriqlar bo‘yicha ogohlantirish
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsInApp}
                  onChange={(e) => setNotificationsInApp(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">
                    Elektron pochta xabarnomalari (IIV Mail)
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Muhim favqulodda topshiriqlar bo‘yicha xizmat pochtasiga xabar yuborish
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsEmail}
                  onChange={(e) => setNotificationsEmail(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">
                    Qoralamalarni avtomatik saqlash
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Hujjat matni tahrir qilinayotganda brauzerda vaqtinchalik saqlab borish
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSaveDrafts}
                  onChange={(e) => setAutoSaveDrafts(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Security & 2FA Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800">
              <Lock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Axborot Xavfsizligi va Himoya
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-200">
                    Ikki bosqichli autentifikatsiya (2FA)
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Tizimga kirishda xizmat SMS kodi yoki apparat tokeni orqali tasdiqlash
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorAuth}
                  onChange={(e) => setTwoFactorAuth(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-950 border-slate-700"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">
                    Xavfsizlik protokoli:
                  </span>
                  <span className="text-emerald-400 font-mono">TLS 1.3 / HTTPS</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">
                    AI API Integratsiyasi:
                  </span>
                  <span className="text-sky-400 font-mono">Server-Side Proxy (Himoyalangan)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-300">
                    Ma’lumotlar bazasi yaxlitligi:
                  </span>
                  <span className="text-emerald-400 font-mono">PostgreSQL / ACID muvofiq</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {onLogout ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800/80 text-rose-300 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Xizmat sessiyasini yakunlash</span>
                </button>
              ) : <div />}
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
              >
                <Save className="w-4 h-4" />
                <span>Sozlamalarni saqlash</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
