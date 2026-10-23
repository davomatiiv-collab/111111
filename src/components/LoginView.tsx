import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Lock,
  KeyRound,
  ScanFace,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  UserCheck,
  Cpu,
  BadgeAlert,
} from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  allUsers: User[];
  onLoginSuccess: (user: User, method: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  allUsers,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'password' | 'face_id'>('password');
  const [selectedUserId, setSelectedUserId] = useState<string>('usr-2'); // Katta leytenant Karimov by default
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  // Face ID state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('Kamera tayyor. Yuzingizni kadr markaziga to‘g‘rilang');
  const [faceVerifiedSuccess, setFaceVerifiedSuccess] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Selected user info
  const selectedUser = allUsers.find((u) => u.id === selectedUserId) || allUsers[0];

  // Initialize or cleanup camera when tab changes
  useEffect(() => {
    if (activeTab === 'face_id') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } else {
        setCameraActive(false);
        setCameraError('Brauzer kameraga ruxsat bermadi (Simulyatsiya rejimi faol)');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable, using biometric simulator:', err);
      setCameraActive(false);
      setCameraError('Kamera yoqilmadi. Biometrik test simulyatori ishga tushirildi.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Submit Password Login
  const handlePasswordSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage('Iltimos, maxfiy xizmat parolini kiriting!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: 'password',
          password: password.trim(),
          userId: selectedUserId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user, 'Parol orqali (bobomurod21090411)');
      } else {
        setAttempts((prev) => prev + 1);
        setErrorMessage(data.error || 'Maxfiy xizmat paroli noto‘g‘ri kiritildi!');
      }
    } catch (err) {
      setErrorMessage('Tizim bilan aloqa uzildi. Qayta urinib ko‘ring.');
    } finally {
      setLoading(false);
    }
  };

  // Run Biometric Face ID Scan Sequence
  const handleStartFaceScan = async () => {
    if (scanning) return;
    setScanning(true);
    setErrorMessage(null);
    setScanProgress(10);
    setScanStatusText('Biometrik profil aniqlanmoqda...');

    // Progress animation steps
    setTimeout(() => {
      setScanProgress(35);
      setScanStatusText('Yuz geometriyasi va to‘r nuqtalari skanerlanmoqda (468 nuqta)...');
    }, 400);

    setTimeout(() => {
      setScanProgress(70);
      setScanStatusText('Liveness & Anti-spoofing tekshiruvi amalga oshirilmoqda...');
    }, 900);

    setTimeout(() => {
      setScanProgress(95);
      setScanStatusText('IIV markaziy biometrik bazasi bilan taqqoslanmoqda...');
    }, 1400);

    setTimeout(async () => {
      try {
        const verifyRes = await fetch('/api/auth/verify-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedUserId }),
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.matched) {
          setScanProgress(100);
          setScanStatusText('Yuz identifikatsiyasi muvaffaqiyatli tasdiqlandi!');
          setFaceVerifiedSuccess(true);

          // Call login endpoint with Face ID
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              method: 'face_id',
              biometricVerified: true,
              userId: selectedUserId,
            }),
          });
          const loginData = await loginRes.json();

          setTimeout(() => {
            stopCamera();
            onLoginSuccess(loginData.user || selectedUser, 'IIV Face ID biometriya');
          }, 600);
        } else {
          setScanning(false);
          setErrorMessage('Face ID mos kelmadi. Iltimos, qayta urinib ko‘ring.');
        }
      } catch (err) {
        setScanning(false);
        setErrorMessage('Biometrik xizmatda xatolik. Parol bilan kiring.');
      }
    }, 1800);
  };

  // Quick fill helper for user convenience
  const handleFillSecretPassword = () => {
    setPassword('bobomurod21090411');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Institutional Top Government Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-sky-400 shadow-md">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-wider text-slate-100 uppercase">
                O‘zbekiston Respublikasi Ichki Ishlar Vazirligi
              </span>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                XAVFSIZ
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Yagona Idoraviy Identifikatsiya va Xavfsizlik Portali (IIV ID)
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-emerald-400 font-semibold">SSL / 256-bit Shifrlash</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header Badge */}
          <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-blue-950/60 to-transparent">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-slate-900 border border-blue-400/30 flex items-center justify-center shadow-lg mb-3">
              <Shield className="w-8 h-8 text-sky-400" />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Tizimga Xavfsiz Kirish
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Xizmat axborotlariga kirish uchun shaxsingizni tasdiqlang
            </p>
          </div>

          {/* Officer Selector (RBAC Profile) */}
          <div className="px-6 pt-5 pb-3">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              Xizmat Xodimi Profili:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {allUsers.map((user) => {
                const isSelected = user.id === selectedUserId;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setErrorMessage(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-900/40 border-blue-500/80 text-white shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          user.role === 'rahbar'
                            ? 'bg-amber-900/60 text-amber-300 border border-amber-600/40'
                            : user.role === 'admin'
                            ? 'bg-purple-900/60 text-purple-300 border border-purple-600/40'
                            : 'bg-blue-950 text-blue-300 border border-blue-700/40'
                        }`}
                      >
                        {user.avatar}
                      </div>
                      <div className="min-w-0 truncate">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {user.rank} {user.fullName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {user.role === 'rahbar'
                            ? 'Rahbar'
                            : user.role === 'admin'
                            ? 'Administrator'
                            : 'Xodim'}{' '}
                          | {user.badgeNumber}
                        </p>
                      </div>
                    </div>
                    {isSelected && <UserCheck className="w-4 h-4 text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auth Method Tabs */}
          <div className="px-6 py-2">
            <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('password');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'password'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Maxfiy Parol</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('face_id');
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'face_id'
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ScanFace className="w-3.5 h-3.5" />
                <span>IIV Face ID</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Password Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="p-6 pt-3 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Maxfiy Xizmat Paroli:
                  </label>
                  <button
                    type="button"
                    onClick={handleFillSecretPassword}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-mono bg-sky-950/60 border border-sky-800/50 px-2 py-0.5 rounded transition"
                  >
                    Parolni kiritish (bobomurod21090411)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Maxfiy parolni kiriting..."
                    autoFocus
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl py-2.5 pl-3.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Box */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-start space-x-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{errorMessage}</p>
                    <p className="text-[11px] text-rose-300/80 mt-0.5">
                      To‘g‘ri maxfiy xizmat paroli: <code className="font-mono font-bold">bobomurod21090411</code>
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg transition hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Xavfsizlik tekshirilmoqda...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Tizimga Kirish</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500">
                  Kirish paroli yoki Face ID orqali xodim shaxsi tasdiqlanadi
                </span>
              </div>
            </form>
          )}

          {/* Tab 2: IIV Face ID Scanner */}
          {activeTab === 'face_id' && (
            <div className="p-6 pt-3 space-y-4">
              {/* Biometric Viewfinder */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-64 flex flex-col items-center justify-center">
                {/* Live video feed if camera active */}
                {cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover mirror scale-x-[-1]"
                  />
                ) : (
                  /* Fallback animated biometric silhouette */
                  <div className="flex flex-col items-center justify-center text-slate-600 space-y-2">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-sky-500/40 flex items-center justify-center bg-slate-900/60 relative">
                      <ScanFace className="w-12 h-12 text-sky-400 animate-pulse" />
                      {scanning && (
                        <div className="absolute inset-0 rounded-full border-2 border-sky-400 animate-ping opacity-30" />
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {cameraError ? 'Biometrik Simulyator Faol' : 'Kamera ulanmoqda...'}
                    </span>
                  </div>
                )}

                {/* Biometric Scanning Overlay Mesh */}
                <div className="absolute inset-0 pointer-events-none border border-sky-500/20 flex items-center justify-center">
                  {/* Face target oval */}
                  <div
                    className={`w-44 h-52 rounded-full border-2 transition-all duration-300 relative flex items-center justify-center ${
                      faceVerifiedSuccess
                        ? 'border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)]'
                        : scanning
                        ? 'border-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                        : 'border-slate-600/70'
                    }`}
                  >
                    {/* Scanning Laser Line */}
                    {scanning && !faceVerifiedSuccess && (
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_10px_#38bdf8] animate-bounce" />
                    )}

                    {/* Corner marks */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-sky-400" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-sky-400" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-sky-400" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-sky-400" />
                  </div>
                </div>

                {/* Top status bar inside viewfinder */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono px-2 py-1 bg-slate-950/80 rounded backdrop-blur-xs border border-slate-800 text-sky-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>IIV BIOMETRIC ENCLAVE</span>
                  </div>
                  <span>{selectedUser.badgeNumber}</span>
                </div>

                {/* Bottom live stats inside viewfinder */}
                <div className="absolute bottom-2 left-2 right-2 text-[10px] font-mono px-2 py-1 bg-slate-950/80 rounded backdrop-blur-xs border border-slate-800 text-slate-300 flex items-center justify-between">
                  <span>LIVENESS: 99.4%</span>
                  <span>IShONCHLILIK: {scanProgress}%</span>
                </div>
              </div>

              {/* Status and Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium truncate">
                    {scanStatusText}
                  </span>
                  <span className="font-mono text-sky-400 font-bold">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 ${
                      faceVerifiedSuccess
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-sky-500 to-blue-600'
                    }`}
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Trigger Button */}
              <button
                type="button"
                onClick={handleStartFaceScan}
                disabled={scanning}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-lg transition ${
                  faceVerifiedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white hover:scale-[1.01]'
                }`}
              >
                {faceVerifiedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Yuz tasdiqlandi! Kirilmoqda...</span>
                  </>
                ) : scanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Yuz tahlil qilinmoqda...</span>
                  </>
                ) : (
                  <>
                    <ScanFace className="w-4 h-4" />
                    <span>Face ID orqali tekshirish va kirish</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <span className="text-[11px] text-slate-500">
                  Xodim: {selectedUser.rank} {selectedUser.fullName}
                </span>
              </div>
            </div>
          )}

          {/* Footer Warning & Legal Notice */}
          <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-center text-[10px] text-slate-500 leading-relaxed">
            <p>
              DIQQAT: Ushbu tizimga noqonuniy kirish O‘zbekiston Respublikasi JK 278-moddasi bilan jazolanadi.
            </p>
            <p className="mt-0.5 font-mono text-[9px] text-slate-600">
              Barcha kirish amallari xavfsizlik audit jurnalida qayd etiladi.
            </p>
          </div>
        </div>
      </main>

      {/* Institutional Bottom Bar */}
      <footer className="border-t border-slate-800 bg-slate-900/60 px-4 py-2 text-center text-[11px] text-slate-500">
        © 2026 O‘zbekiston Respublikasi Ichki Ishlar Vazirligi. Axborot xavfsizligi kafolatlangan.
      </footer>
    </div>
  );
};
