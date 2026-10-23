import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Shield,
  FileCheck,
} from 'lucide-react';
import { QuizQuestion, User } from '../types';

interface TrainingExamViewProps {
  currentUser: User | null;
}

export const TrainingExamView: React.FC<TrainingExamViewProps> = ({
  currentUser,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/training/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Fetch questions error:', err);
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitExam = async () => {
    if (Object.keys(userAnswers).length < questions.length) {
      if (
        !confirm(
          `Siz barcha savollarga javob bermadingiz (${Object.keys(userAnswers).length}/${questions.length}). Shunda ham natijani hisoblashni xohlaysizmi?`
        )
      ) {
        return;
      }
    }

    setLoading(true);
    try {
      const payload = Object.entries(userAnswers).map(([questionId, selectedIndex]) => ({
        questionId,
        selectedIndex,
      }));

      const res = await fetch('/api/training/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({ answers: payload }),
      });

      if (res.ok) {
        const data = await res.json();
        setExamResult(data);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Submit exam error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetExam = () => {
    setUserAnswers({});
    setSubmitted(false);
    setExamResult(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Xizmat Malakasi va Test Sinovlari Simulyatori
            </h1>
            <p className="text-xs text-slate-400">
              O‘RQ-407, Xizmat intizomi Kodeksi, Yo‘riqnomalar va MJtK bo‘yicha attestatsiya tayyorgarligi
            </p>
          </div>
        </div>

        {submitted ? (
          <button
            onClick={handleResetExam}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Qayta topshirish</span>
          </button>
        ) : (
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold shrink-0">
            {Object.keys(userAnswers).length} / {questions.length} belgilandi
          </span>
        )}
      </div>

      {/* Result Certificate Card if submitted */}
      {submitted && examResult && (
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-2 border-blue-500/50 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-400/40 text-sky-400 flex items-center justify-center">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                  IIV Xizmat Bilim Sinovi Natijasi
                </span>
                <h2 className="text-lg font-bold text-white">
                  {currentUser?.rank} {currentUser?.fullName}
                </h2>
                <p className="text-xs text-slate-400">
                  Xizmat guvohnomasi: {currentUser?.badgeNumber}
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <div className="text-3xl font-extrabold text-white font-mono">
                {examResult.percentage}%
              </div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  examResult.percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                Baho: {examResult.grade}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                To‘g‘ri javoblar: {examResult.correctCount} / {examResult.totalQuestions}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {examResult.percentage >= 70
              ? 'Tabriklaymiz! Siz O‘zbekiston Respublikasi IIV xizmat me’yoriy hujjatlari bo‘yicha sinovni muvaffaqiyatli topshirdingiz.'
              : 'Natijangiz qoniqarli darajada emas. Quyida noto‘g‘ri javob berilgan moddalar va tushuntirishlar bilan tanishib, xizmat bilimingizni mustahkamlang.'}
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const selectedIdx = userAnswers[q.id];
          const isAnswered = selectedIdx !== undefined;

          // If submitted, get detailed result
          const detailed = examResult?.detailedResults?.find(
            (r: any) => r.questionId === q.id
          );

          return (
            <div
              key={q.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-sm space-y-3.5 transition ${
                submitted
                  ? detailed?.isCorrect
                    ? 'border-emerald-600/60 bg-emerald-950/10'
                    : 'border-rose-600/60 bg-rose-950/10'
                  : 'border-slate-800'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-sky-400 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                    {q.category}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {q.legalArticle}
                  </span>
                </div>

                {submitted && (
                  <div className="shrink-0">
                    {detailed?.isCorrect ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        To‘g‘ri
                      </span>
                    ) : (
                      <span className="text-xs text-rose-400 font-semibold flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Xato
                      </span>
                    )}
                  </div>
                )}
              </div>

              <h3 className="text-xs sm:text-sm font-semibold text-slate-100 leading-snug">
                {q.question}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, oIdx) => {
                  const isSelected = selectedIdx === oIdx;
                  let optionClass =
                    'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850';

                  if (submitted) {
                    if (oIdx === q.correctIndex) {
                      optionClass =
                        'bg-emerald-950/60 border-emerald-600 text-emerald-200 font-semibold';
                    } else if (isSelected && !detailed?.isCorrect) {
                      optionClass =
                        'bg-rose-950/60 border-rose-600 text-rose-200 line-through';
                    }
                  } else if (isSelected) {
                    optionClass =
                      'bg-blue-900/40 border-blue-600 text-blue-200 font-semibold';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={submitted}
                      onClick={() => handleSelectOption(q.id, oIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${optionClass}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-full border border-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Explanation on Submit */}
              {submitted && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-sky-400 font-semibold text-[11px]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Me’yoriy Asos ({q.legalArticle}):</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    {q.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!submitted && (
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmitExam}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Tekshirilmoqda...' : 'Test Natijasini Hisoblash'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
