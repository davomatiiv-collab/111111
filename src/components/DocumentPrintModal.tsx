import React, { useState } from 'react';
import { X, Printer, Copy, Check, Shield, QrCode } from 'lucide-react';
import { DocumentItem } from '../types';
import { QrVerifyModal } from './QrVerifyModal';

interface DocumentPrintModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({
  document,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!document) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Rasmiy Hujjatni Chop Etish / Ko‘rib Chiqish
              </h3>
              <p className="text-[11px] text-slate-400">
                {document.docNumber} | Holati: {document.status}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Nusxalandi' : 'Nusxa olish'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Paper sheet preview (clean formal paper representation) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/60 flex justify-center">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-lg shadow-xl p-8 sm:p-12 border border-slate-200 font-serif leading-relaxed text-sm print:p-0 print:border-none print:shadow-none print:max-w-none">
            {/* Stationery Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-800">
                O‘ZBEKISTON RESPUBLIKASI ICHKI ISHLAR VAZIRLIGI
              </p>
              <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                {document.department.toUpperCase()}
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 font-sans px-2">
                <span>№ {document.docNumber}</span>
                <span>
                  Sana:{' '}
                  {new Date(document.createdAt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Recipient */}
            <div className="text-right mb-6 text-xs font-sans max-w-xs ml-auto leading-normal">
              <p className="font-semibold">{document.recipient}</p>
            </div>

            {/* Title */}
            <div className="text-center my-6">
              <h2 className="text-base font-bold uppercase tracking-wider text-slate-950">
                {document.title}
              </h2>
            </div>

            {/* Document Body */}
            <div className="whitespace-pre-wrap text-slate-800 text-xs sm:text-sm text-justify indent-6 mb-8 font-serif leading-relaxed">
              {document.content}
            </div>

            {/* Signatures & Stamp block */}
            <div className="pt-8 border-t border-slate-300 font-sans text-xs flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <p className="font-bold text-slate-900">{document.creatorRank}</p>
                <p className="text-slate-600">{document.creatorName}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">Imzo: ___________</span>
                  <span className="text-[10px] text-slate-500">Sana: ____________</span>
                </div>
              </div>

              {/* Approval stamp & QR code block */}
              <div className="flex items-center gap-3">
                <div
                  onClick={() => setShowQrModal(true)}
                  className="cursor-pointer hover:opacity-85 transition p-1 bg-white border border-slate-300 rounded shadow-xs"
                  title="QR-kodni kattalashtirib ko‘rish va verifikatsiya qilish"
                >
                  <svg
                    viewBox="0 0 100 100"
                    className="w-16 h-16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="5" y="5" width="24" height="24" fill="#0f172a" />
                    <rect x="9" y="9" width="16" height="16" fill="#ffffff" />
                    <rect x="13" y="13" width="8" height="8" fill="#0f172a" />
                    <rect x="71" y="5" width="24" height="24" fill="#0f172a" />
                    <rect x="75" y="9" width="16" height="16" fill="#ffffff" />
                    <rect x="79" y="13" width="8" height="8" fill="#0f172a" />
                    <rect x="5" y="71" width="24" height="24" fill="#0f172a" />
                    <rect x="9" y="75" width="16" height="16" fill="#ffffff" />
                    <rect x="13" y="79" width="8" height="8" fill="#0f172a" />
                    <rect x="35" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="47" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="59" y="8" width="6" height="6" fill="#0f172a" />
                    <rect x="38" y="38" width="24" height="24" fill="#1e3a8a" />
                    <rect x="44" y="44" width="12" height="12" fill="#ffffff" />
                    <rect x="48" y="48" width="4" height="4" fill="#1e3a8a" />
                    <rect x="68" y="35" width="6" height="18" fill="#0f172a" />
                    <rect x="35" y="68" width="6" height="18" fill="#0f172a" />
                    <rect x="68" y="68" width="24" height="24" fill="#0f172a" />
                  </svg>
                  <p className="text-[7px] text-center text-slate-500 font-mono mt-0.5">
                    SCAN VERIFY
                  </p>
                </div>

                <div className="p-2.5 border-2 border-dashed border-blue-700/60 rounded-xl text-center bg-blue-50/50 w-48 shrink-0">
                  <p className="text-[8px] font-bold text-blue-900 uppercase">
                    {document.status === 'Tasdiqlangan'
                      ? 'TASDIQLANDI (IIV REESTRI)'
                      : 'ELEKTRON HUJJAT QORALAMASI'}
                  </p>
                  <p className="text-[8px] text-slate-600 mt-0.5">
                    Ijrochi: {document.creatorName} ({document.creatorRank})
                  </p>
                  <p className="text-[7px] text-slate-500 font-mono mt-0.5">
                    SEC-ID: {document.id.replace('doc-', 'IIV-')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Verify Modal */}
        <QrVerifyModal
          document={document}
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
        />

        {/* Modal Footer Note */}
        <div className="px-6 py-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>
            {document.aiAssisted
              ? 'AI ko‘magida shakllantirilgan qoralama'
              : 'Standart xizmat hujjati'}
          </span>
          <span className="text-slate-500">Hujjat aylanishi tizimi standarti bo‘yicha</span>
        </div>
      </div>
    </div>
  );
};
