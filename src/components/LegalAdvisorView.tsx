import React, { useState } from 'react';
import {
  Scale,
  Sparkles,
  AlertOctagon,
  FileCheck2,
  CheckCircle2,
  ListOrdered,
  FileText,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { User, LegalQualificationResult } from '../types';

interface LegalAdvisorViewProps {
  currentUser: User | null;
  onSendToDocumentBuilder: (text: string, title?: string) => void;
}

export const LegalAdvisorView: React.FC<LegalAdvisorViewProps> = ({
  currentUser,
  onSendToDocumentBuilder,
}) => {
  const [incidentText, setIncidentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LegalQualificationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleCases = [
    {
      title: 'Jamoat joyida mayda bezorilik',
      text: 'Fuqaro tungi soat 22:30 da ko‘p qavatli uy hovlisida baqir-chaqir qilib, fuqarolarga nisbatan haqoratomuz so‘zlar ishlatdi va jamoat tartibini buzdi.',
    },
    {
      title: 'Xodimning qonuniy talabiga bo‘ysunmaslik',
      text: 'Ichki ishlar organi xodimi jamoat joyida tartib saqlash yuzasidan o‘zini tanishtirib, qonuniy talab qo‘yganida, fuqaro unga bo‘ysunmadi va xizmat vazifasini bajarishiga to‘sqinlik qildi.',
    },
    {
      title: 'Spirtli ichimlik va tartibbuzarlik',
      text: 'Fuqaro istirohat bog‘ida spirtli ichimlik (pivo) iste’mol qilib, o‘tkinchi fuqarolarga noo‘rin tegajoqlik qildi va mast holda xulq-atvor qoidalarini buzdi.',
    },
  ];

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = textToAnalyze || incidentText;
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/legal-qualification/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({ incidentDescription: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      }
    } catch (err) {
      console.error('Analyze error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProtocol = () => {
    if (!result?.draftProtocol) return;
    navigator.clipboard.writeText(result.draftProtocol);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-sky-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Huquqiy Kvalifikatsiya va Moddalar Bo‘yicha AI Maslahatchi
            </h1>
            <p className="text-xs text-slate-400">
              Voqea tafsilotlari asosida O‘zbekiston Respublikasi MJtK va JK moddalariga muvofiqlik, dalillar bazasi va bayonnoma loyihasi
            </p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold shrink-0">
          MJtK & JK Standarti
        </span>
      </div>

      {/* Input Incident Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
            Voqea yoki Huquqbuzarlik Holatini Bayon Qiling:
          </label>
          <span className="text-[11px] text-slate-400">
            Erkin xizmat tilida yozishingiz mumkin
          </span>
        </div>

        <textarea
          value={incidentText}
          onChange={(e) => setIncidentText(e.target.value)}
          rows={3}
          placeholder="Masalan: Yunusobod tumani 4-mavzeda fuqaro jamoat joyida baqir-chaqir qilib, fuqarolarning tinchligini buzdi va xodimning to‘xtatish talabiga bo‘ysunmadi..."
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />

        {/* Sample Incident Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-semibold">Namuna keyslar:</span>
          {sampleCases.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIncidentText(sc.text);
                handleAnalyze(sc.text);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
            >
              {sc.title}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={() => handleAnalyze()}
            disabled={loading || !incidentText.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>{loading ? 'AI huquqiy tahlil qilmoqda...' : 'Huquqiy baho va bayonnoma tuzish'}</span>
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in">
          {/* Applicable Articles Cards */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Tavsiya Etilayotgan Moddalar va Sanksiyalar
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.articles.map((art, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-blue-900/60 rounded-xl p-4 shadow-sm space-y-2 bg-gradient-to-br from-slate-900 to-blue-950/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                      {art.code} {art.article}
                    </span>
                    <span className="text-xs font-bold text-sky-300">{art.title}</span>
                  </div>

                  <p className="text-xs text-slate-300 pt-1">
                    <strong>Tarkib belgilari:</strong> {art.elements}
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-amber-300">
                    <strong>Jazo sanksiyasi:</strong> {art.sanction}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Checklist & Procedural Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Required Evidence */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Talab Qilinadigan Dalillar Bazasi
                </h4>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                {result.requiredEvidence.map((ev, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Procedural Steps */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
                <ListOrdered className="w-4 h-4 text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Qadamma-Qadam Protsessual Harakatlar
                </h4>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                {result.proceduralSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px]"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Protocol Draft */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Ma’muriy Huquqbuzarlik To‘g‘risida Bayonnoma Qoralamasi
                </h4>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyProtocol}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Nusxalandi' : 'Nusxa olish'}</span>
                </button>
                <button
                  onClick={() =>
                    onSendToDocumentBuilder(
                      result.draftProtocol,
                      'Ma’muriy huquqbuzarlik to‘g‘risida bayonnoma'
                    )
                  }
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <span>Hujjatga o‘tkazish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {result.draftProtocol}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
