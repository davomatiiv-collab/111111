import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User as UserIcon,
  Filter,
  Trash2,
  ChevronRight,
  X,
  Search,
} from 'lucide-react';
import { TaskItem, User } from '../types';

interface TasksViewProps {
  currentUser: User | null;
  allUsers: User[];
  onRefreshDashboard?: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  currentUser,
  allUsers,
  onRefreshDashboard,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Task Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [priority, setPriority] = useState<'Yuqori' | 'O\'rta' | 'Past'>('O\'rta');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [currentUser?.id]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks', {
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Topshiriq nomini kiriting');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({
          title,
          description,
          assignedToId: assignedToId || currentUser?.id,
          priority,
          deadline: deadline ? new Date(deadline).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        setTitle('');
        setDescription('');
        setDeadline('');
        fetchTasks();
        if (onRefreshDashboard) onRefreshDashboard();
      }
    } catch (err) {
      console.error('Create task error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchTasks();
        if (onRefreshDashboard) onRefreshDashboard();
      }
    } catch (err) {
      console.error('Update task status error:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Topshiriqni o‘chirishni tasdiqlaysizmi?')) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': currentUser?.id || '' },
      });
      if (res.ok) {
        fetchTasks();
        if (onRefreshDashboard) onRefreshDashboard();
      }
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filterStatus === 'Barchasi' || t.status === filterStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedToName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Topshiriqlar va Ijro Intizomi
            </h1>
            <p className="text-xs text-slate-400">
              Xizmat topshiriqlari, ijro muddatlari va nazoratdagi vazifalar
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi topshiriq biriktirish</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Topshiriq nomi yoki ijrochi bo‘yicha qidiruv..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs">
          {['Barchasi', 'Yangi', 'Jarayonda', 'Bajarildi', 'Muddati o\'tgan'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isOverdue =
              task.status !== 'Bajarildi' && new Date(task.deadline).getTime() < Date.now();
            return (
              <div
                key={task.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 shadow-sm flex flex-col justify-between transition space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                        task.priority === 'Yuqori'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : task.priority === 'O\'rta'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {task.priority} ustuvorlik
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        task.status === 'Bajarildi'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : task.status === 'Jarayonda'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          : task.status === 'Muddati o\'tgan' || isOverdue
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isOverdue && task.status !== 'Muddati o\'tgan'
                        ? 'Muddati o‘tgan'
                        : task.status}
                    </span>
                  </div>

                  <h3 className="text-xs sm:text-sm font-bold text-slate-100 line-clamp-2">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      Ijrochi:
                    </span>
                    <span className="font-semibold">{task.assignedToName}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Muddat:
                    </span>
                    <span
                      className={`font-mono font-semibold ${
                        isOverdue ? 'text-rose-400' : 'text-slate-300'
                      }`}
                    >
                      {new Date(task.deadline).toLocaleDateString('uz-UZ', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-1 border-t border-slate-800/60 text-[11px]">
                    {task.status !== 'Bajarildi' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'Jarayonda')}
                          className={`px-2.5 py-1 rounded border transition ${
                            task.status === 'Jarayonda'
                              ? 'bg-sky-900/60 text-sky-200 border-sky-600'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          Jarayonda
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'Bajarildi')}
                          className="px-2.5 py-1 rounded bg-emerald-900/50 hover:bg-emerald-800 text-emerald-200 border border-emerald-600/60 transition font-semibold"
                        >
                          Bajarildi &check;
                        </button>
                      </>
                    ) : (
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Topshiriq bajarilgan
                      </span>
                    )}

                    {(currentUser?.role === 'admin' || currentUser?.role === 'rahbar') && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500 space-y-2">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-400">Topshiriqlar topilmadi</p>
            <p className="text-xs text-slate-500">
              Ushbu holat yoki qidiruv bo‘yicha topshiriqlar mavjud emas.
            </p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Yangi Xizmat Topshirig‘ini Biriktirish
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Topshiriq Nomi
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Yunusobod reydi bo‘yicha tahliliy hisobot tayyorlash"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Batafsil Tavsif va Talablar
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Amalga oshirilishi lozim bo‘lgan aniq harakatlar..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Ijrochi Xodim
                  </label>
                  <select
                    value={assignedToId}
                    onChange={(e) => setAssignedToId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">O‘zimga biriktirish ({currentUser?.fullName})</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.rank} {u.fullName} ({u.badgeNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Ustuvorlik
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Yuqori">Yuqori (Tezkor)</option>
                    <option value="O'rta">O‘rta (Rejali)</option>
                    <option value="Past">Past</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Ijro Muddati (Deadline)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>{saving ? 'Saqlanmoqda...' : 'Topshiriqni Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
