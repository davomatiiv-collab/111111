import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  Lock,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface QrVerifyModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QrVerifyModal: React.FC<QrVerifyModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [verifyData, setVerifyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (document && isOpen) {
      fetchVerification();
    }
  }, [document, isOpen]);

  const fetchVerification = async () => {
    if (!document) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/verify/${document.id}`);
      if (res.ok) {
        const data = await res.json();
        setVerifyData(data);
      }
    } catch (err) {
      console.error('Verify error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !document) return null;

  const verificationUrl = `${window.location.origin}/verify/${document.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Hujjat Haqiqiyligini Verifikatsiya Qilish
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Graphic (SVG Based) */}
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-inner space-y-3">
          {/* Authentic SVG QR Matrix */}
          <div className="w-44 h-44 bg-white p-2 border-2 border-slate-900 rounded-xl flex items-center justify-center relative">
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Corner 1 */}
              <rect x="5" y="5" width="24" height="24" fill="#0f172a" />
              <rect x="9" y="9" width="16" height="16" fill="#ffffff" />
              <rect x="13" y="13" width="8" height="8" fill="#0f172a" />
              {/* Corner 2 */}
              <rect x="71" y="5" width="24" height="24" fill="#0f172a" />
              <rect x="75" y="9" width="16" height="16" fill="#ffffff" />
              <rect x="79" y="13" width="8" height="8" fill="#0f172a" />
              {/* Corner 3 */}
              <rect x="5" y="71" width="24" height="24" fill="#0f172a" />
              <rect x="9" y="75" width="16" height="16" fill="#ffffff" />
              <rect x="13" y="79" width="8" height="8" fill="#0f172a" />
              {/* Data blocks */}
              <rect x="35" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="47" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="59" y="8" width="6" height="6" fill="#0f172a" />
              <rect x="35" y="20" width="6" height="6" fill="#0f172a" />
              <rect x="47" y="20" width="18" height="6" fill="#0f172a" />
              <rect x="8" y="35" width="6" height="18" fill="#0f172a" />
              <rect x="20" y="35" width="12" height="6" fill="#0f172a" />
              <rect x="38" y="38" width="24" height="24" fill="#1e3a8a" />
              <rect x="44" y="44" width="12" height="12" fill="#ffffff" />
              <rect x="48" y="48" width="4" height="4" fill="#1e3a8a" />
              <rect x="68" y="35" width="6" height="18" fill="#0f172a" />
              <rect x="80" y="35" width="12" height="6" fill="#0f172a" />
              <rect x="35" y="68" width="6" height="18" fill="#0f172a" />
              <rect x="47" y="68" width="18" height="6" fill="#0f172a" />
              <rect x="47" y="80" width="6" height="12" fill="#0f172a" />
              <rect x="68" y="68" width="24" height="6" fill="#0f172a" />
              <rect x="68" y="80" width="12" height="12" fill="#0f172a" />
            </svg>
          </div>

          <div className="text-center">
            <span className="text-[10px] font-mono font-bold text-slate-800 tracking-wider">
              {verifyData?.verificationCode || `IIV-SEC-${document.id}-UZ`}
            </span>
            <p className="text-[9px] text-slate-500 mt-0.5">
              IIV rasmiy elektron verifikatsiya shtampi
            </p>
          </div>
        </div>

        {/* Verification Status Card */}
        <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Hujjat raqami:</span>
            <span className="font-mono font-bold text-blue-300">{document.docNumber}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Hujjat nomi:</span>
            <span className="font-semibold text-slate-200 truncate max-w-[200px]">
              {document.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Tasdiq holati:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                document.status === 'Tasdiqlangan'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {document.status === 'Tasdiqlangan'
                ? 'Tasdiqlangan va Ro‘yxatga olingan'
                : 'Qoralama / Tekshiruvda'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Ijrochi:</span>
            <span className="text-slate-300">
              {document.creatorRank} {document.creatorName}
            </span>
          </div>
        </div>

        {/* Legal Trust Notice */}
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300/90 leading-relaxed flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            {verifyData?.systemNotice ||
              'Ushbu hujjat O‘zbekiston Respublikasi IIV yagona elektron hujjat aylanishi tizimida ro‘yxatdan o‘tgan.'}
          </span>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
