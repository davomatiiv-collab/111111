import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Users,
  MapPin,
  PieChart,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { DistrictCrimeStat, User } from '../types';

interface AnalyticsViewProps {
  currentUser: User | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ currentUser }) => {
  const [districtStats, setDistrictStats] = useState<DistrictCrimeStat[]>([]);
  const [totals, setTotals] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/kriminogen');
      if (res.ok) {
        const data = await res.json();
        setDistrictStats(data.stats);
        setTotals(data.totals);
        if (data.stats.length > 0) {
          setSelectedDistrict(data.stats[0].district);
        }
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedData = districtStats.find((d) => d.district === selectedDistrict);

  const preventionRate = totals
    ? Math.round((totals.totalPrevented / totals.totalIncidents) * 100)
    : 81;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Kriminogen Vaziyat Monitoringi va Tahliliy Statistika
            </h1>
            <p className="text-xs text-slate-400">
              Toshkent shahri tumanlari kesimida huquqbuzarliklar dinamikasi va profilaktika samaradorligi
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5" />
            Umumiy kamayish: -7.2%
          </span>
        </div>
      </div>

      {/* Top 4 Key Indicator Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Jami qayd etilgan</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {totals?.totalIncidents ?? 796} ta
          </div>
          <p className="text-[11px] text-slate-400 mt-1">O‘tgan oyga nisbatan -5.4%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Oldi olingan (Profilaktika)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">
            {totals?.totalPrevented ?? 659} ta
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Samaradorlik: {preventionRate}%</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Mayda bezorilik (MJtK 183)</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">
            {totals?.minorHooliganismTotal ?? 267} ta
          </div>
          <p className="text-[11px] text-slate-400 mt-1">92% dalolatnoma tuzilgan</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Xizmatdagi xodimlar</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">
            {totals?.activeOfficers ?? 362} nafar
          </div>
          <p className="text-[11px] text-slate-400 mt-1">O‘rtacha yuklama: 2.2 hodisa</p>
        </div>
      </div>

      {/* Main Analytics Layout: District List & Deep Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District List with Trend Badges */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-sky-400" />
              Tumanlar Kesimi
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">6 ta tuman</span>
          </div>

          <div className="space-y-2">
            {districtStats.map((dist) => {
              const isSelected = dist.district === selectedDistrict;
              return (
                <div
                  key={dist.district}
                  onClick={() => setSelectedDistrict(dist.district)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-600 shadow-sm'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{dist.district}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {dist.totalIncidents} ta hodisa ({dist.officerCount} xodim)
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                        dist.trend === 'kamaygan'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : dist.trend === 'barqaror'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {dist.trend === 'kamaygan' ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      <span className="capitalize">{dist.trend}</span>
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      {Math.round((dist.prevented / dist.totalIncidents) * 100)}% oldi olindi
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected District Deep Dive (2 spans) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
          {selectedData ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                    Tanlangan Hudud Tahlili
                  </span>
                  <h2 className="text-base font-bold text-white mt-0.5">
                    {selectedData.district}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Profilaktika inspektorlari:</span>
                  <span className="font-bold text-white ml-1 font-mono">
                    {selectedData.officerCount} nafar
                  </span>
                </div>
              </div>

              {/* Progress bars by violation types */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Moddalar Bo‘yicha Huquqbuzarliklar Tarkibi
                </h4>

                {/* 183-modda */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      MJtK 183-modda (Mayda bezorilik)
                    </span>
                    <span className="font-bold text-white font-mono">
                      {selectedData.minorHooliganism} ta
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(selectedData.minorHooliganism / selectedData.totalIncidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 187-modda */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      MJtK 187-modda (Jamoat joylarida alkogol iste’moli)
                    </span>
                    <span className="font-bold text-white font-mono">
                      {selectedData.publicAlcohol} ta
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(selectedData.publicAlcohol / selectedData.totalIncidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 194-modda */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      MJtK 194-modda (Xodimning qonuniy talabiga bo‘ysunmaslik)
                    </span>
                    <span className="font-bold text-white font-mono">
                      {selectedData.disobedience} ta
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(selectedData.disobedience / selectedData.totalIncidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Oila-turmush */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      Oila-turmush doirasidagi profilaktik nizolar
                    </span>
                    <span className="font-bold text-white font-mono">
                      {selectedData.domesticDisputes} ta
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(selectedData.domesticDisputes / selectedData.totalIncidents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Operational Recommendation Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-sky-400" />
                  Operativ-Profilaktik AI Tavsiyasi:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedData.district} hududida so‘nggi oyda <strong>MJtK 187</strong> va <strong>183-moddalari</strong> bo‘yicha eng ko‘p qaydlar kuzatilgan. 
                  Tungi soat 21:00 dan 02:00 gacha oraliqda tungi ko‘ngilochar maskanlar va ko‘p qavatli uylar hovlilarida avtopatrul yo‘nalishlarini zichlashtirish, 
                  mahalla oqsoqollari va jamoatchilik vakillari bilan profilaktik suhbatlarni ko‘paytirish tavsiya etiladi.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Tuman tanlanmagan
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
