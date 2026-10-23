import React, { useState, useEffect } from 'react';
import {
  History,
  Shield,
  Search,
  Filter,
  Download,
  Lock,
  UserCheck,
  FileText,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import { AuditEvent, User } from '../types';

interface AuditLogViewProps {
  currentUser: User | null;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [filterAction, setFilterAction] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [currentUser?.id]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit', {
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Fetch audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Vaqt', 'Xodim', 'Amal Turi', 'Obekt', 'Tafsilotlar', 'IP Manzil'];
    const rows = filteredLogs.map((l) => [
      `"${new Date(l.timestamp).toLocaleString('uz-UZ')}"`,
      `"${l.userName}"`,
      `"${l.action}"`,
      `"${l.objectType}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `iiv_audit_jurnali_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'Barchasi' || log.action === filterAction;
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery);
    return matchesAction && matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'TIZIMGA_KIRISH':
      case 'ROL_ALMASHTIRISH':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'HUJJAT_TASDIQLASH':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'HUJJAT_QAYTARISH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'HUJJAT_YARATISH':
      case 'HUJJAT_TAHRIRLASH':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'TEKSHIRUVGA_YUBORISH':
      case 'TOPSHIRIQ_YARATISH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'AI_CHAT_MUROJAAT':
      case 'MEYORIY_QIDIRUV':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Xizmat Faoliyati va Xavfsizlik Jurnali (Audit)
            </h1>
            <p className="text-xs text-slate-400">
              Tizimga kirish, hujjat aylanishi, AI so‘rovlari va xizmat amallarining o‘zgarmas reyestri
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAuditLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>CSV hisobot yuklash</span>
          </button>
        </div>
      </div>

      {/* Security Status Box */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2.5">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Barcha yozuvlar himoyalangan:</strong> Audit yozuvlari faqat o‘qish rejimida bo‘lib, o‘zgartirilishi yoki o‘chirilishi qat’iyan bloklangan.
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono shrink-0">
          Jami qaydlar: {logs.length} ta
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tafsilot, xodim ismi yoki IP manzil bo‘yicha qidiruv..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Action Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {[
            'Barchasi',
            'HUJJAT_YARATISH',
            'HUJJAT_TASDIQLASH',
            'TEKSHIRUVGA_YUBORISH',
            'AI_CHAT_MUROJAAT',
            'MEYORIY_QIDIRUV',
          ].map((act) => (
            <button
              key={act}
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                filterAction === act
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {act === 'Barchasi' ? 'Barchasi' : act.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Vaqt (Toshkent)</th>
                <th className="py-3 px-4">Xodim / Foydalanuvchi</th>
                <th className="py-3 px-4">Amal Turi</th>
                <th className="py-3 px-4">Tafsilotlar</th>
                <th className="py-3 px-4">Obekt Turi</th>
                <th className="py-3 px-4 text-right">IP Manzil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('uz-UZ', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                      {log.userName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">
                      <span className="line-clamp-2">{log.details}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[10px]">
                        {log.objectType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500 text-[11px]">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Audit yozuvlari topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
