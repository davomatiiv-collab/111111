import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  FileText,
  ArrowRight,
  Check,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { User } from '../types';

interface VoiceDictationModalProps {
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSendToDocumentBuilder: (draftText: string, title?: string) => void;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSendToDocumentBuilder,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const recognitionRef = useRef<any>(null);

  const sampleVoiceNotes = [
    {
      title: 'Yunusobod tungi reyd xabari',
      text: 'Hurmatli boshliq, Yunusobod 11-mavzeda soat 22:30 da o‘tkazilgan tungi nazorat davomida 45-uy oldidagi bolalar maydonchasida fuqarolarning tinchligini buzgan 2 nafar shaxs aniqlandi. Ularning shaxsi tekshirilib, profilaktik suhbat o‘tkazildi va rasmiy ogohlantirildi.',
    },
    {
      title: 'Yo‘l harakati qoidabuzarligi',
      text: 'Amir Temur ko‘chasida xizmat olib borish davomida davlat raqami 01 A 777 BA bo‘lgan avtomashina haydovchisi svetoforning qizil chirog‘iga bo‘ysunmasdan harakatlandi. Haydovchi to‘xtatilib, tegishli ma’muriy bayonnoma rasmiylashtirildi.',
    },
    {
      title: 'Voyaga yetmaganlar nazorati',
      text: 'Chilonzor tumani hududidagi internet klubda tungi soat 23:15 da ota-onasi yoki vasiysiz bo‘lgan 2 nafar maktab o‘quvchisi aniqlandi. Ota-onalari chaqirtirilib, tushuntirish ishlari olib borildi.',
    },
  ];

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'uz-UZ';

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert(
        'Brauzeringizda ovozli diktovka vositasi qo‘llab-quvvatlanmadi. Iltimos, namunaviy ovozli xabarlardan foydalaning yoki matnni klaviaturada kiriting.'
      );
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        setTranscript('');
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech start err:', err);
      }
    }
  };

  const handleProcessVoice = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/documents/voice-to-doc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          voiceTranscript: transcript,
          docType: 'xizmat_xati',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedDraft(data.draftText);
      }
    } catch (err) {
      console.error('Process voice error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDraft = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Ovozli Diktovka va Voqea Joyidan Tezkor Bildirgi
              </h3>
              <p className="text-[11px] text-slate-400">
                Mikrofonga aytilgan og‘zaki xabarni rasmiy xizmat bildirishnomasiga aylantirish
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mic Control Circle */}
        <div className="text-center py-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-center">
            <button
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/30'
                  : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-105'
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
          </div>

          <p className="text-xs font-semibold text-slate-300">
            {isRecording
              ? 'Ovoz yozilmoqda... Voqea tafsilotlarini gapiring'
              : 'Yozishni boshlash uchun mikrofon tugmasini bosing'}
          </p>

          <p className="text-[11px] text-slate-500">
            Til: O‘zbek tili (uz-UZ) | Patrullik va voqea joyi rejimi
          </p>
        </div>

        {/* Live Transcript Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Diktovka Matni (Yozib olingan yoki tahrirlanadigan):
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={3}
            placeholder="Mikrofon orqali gapiring yoki quyidagi namunalardan tanlang..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Quick Sample Voice Notes */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400">
            Namunaviy xizmat xabarlari (Tezkor sinov):
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleVoiceNotes.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setTranscript(sample.text)}
                className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg transition"
              >
                {sample.title}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
          >
            Yopish
          </button>
          <button
            onClick={handleProcessVoice}
            disabled={loading || !transcript.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>{loading ? 'AI rasmiylashtirmoqda...' : 'Rasmiy bildirgiga aylantirish'}</span>
          </button>
        </div>

        {/* Generated Official Draft Display */}
        {generatedDraft && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-sky-400" />
                Rasmiylashtirilgan Xizmat Bildirgisi:
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyDraft}
                  className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
                </button>
                <button
                  onClick={() => {
                    onSendToDocumentBuilder(
                      generatedDraft,
                      'Voqea joyidan xizmat bildirgisi'
                    );
                    onClose();
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1"
                >
                  <span>Hujjatga o‘tkazish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
              {generatedDraft}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
