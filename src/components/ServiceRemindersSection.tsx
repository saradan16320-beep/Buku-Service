import React, { useState } from 'react';
import { useMotor } from '../context/MotorContext';
import { ServiceReminder } from '../types';
import { computeReminder, getStatusBadge, formatDateIndo } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import {
  Clock,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ServiceRemindersSectionProps {
  onOpenAddReminder: () => void;
  onOpenAddService?: () => void;
  onQuickRecordService: (reminder: ServiceReminder) => void;
  onEditReminder?: (reminder: ServiceReminder) => void;
}

export const ServiceRemindersSection: React.FC<ServiceRemindersSectionProps> = ({
  onOpenAddReminder,
  onOpenAddService,
  onQuickRecordService,
}) => {
  const { activeMotor, activeReminders, deleteReminder } = useMotor();
  const [filter, setFilter] = useState<'all' | 'due' | 'good'>('all');
  const [reminderToDelete, setReminderToDelete] = useState<ServiceReminder | null>(null);

  if (!activeMotor) return null;

  const computedList = activeReminders.map((r) => computeReminder(r, activeMotor));

  // Sort by urgency: overdue -> urgent -> warning -> good
  const statusWeight: Record<string, number> = {
    overdue: 0,
    urgent: 1,
    warning: 2,
    good: 3,
  };

  const sortedList = [...computedList].sort((a, b) => {
    const diff = statusWeight[a.status] - statusWeight[b.status];
    if (diff !== 0) return diff;
    return a.remainingKm - b.remainingKm;
  });

  const filteredList = sortedList.filter((item) => {
    if (filter === 'due') {
      return item.status === 'overdue' || item.status === 'urgent' || item.status === 'warning';
    }
    if (filter === 'good') {
      return item.status === 'good';
    }
    return true;
  });

  const totalDueCount = computedList.filter(
    (i) => i.status === 'overdue' || i.status === 'urgent'
  ).length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Pengingat Jadwal Servis Rutin
            </h2>
            {totalDueCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                {totalDueCount} Perlu Perhatian
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Dipantau berdasarkan jarak tempuh ({activeMotor.avgKmPerDay} km/hari) atau jatuh tempo kalender.
          </p>
        </div>

        {/* Filter Pills & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-slate-800 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Semua ({computedList.length})
            </button>
            <button
              onClick={() => setFilter('due')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                filter === 'due'
                  ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Waktunya Servis</span>
              {totalDueCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>
            <button
              onClick={() => setFilter('good')}
              className={`px-2.5 sm:px-3 py-1 rounded-lg transition ${
                filter === 'good'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Aman
            </button>
          </div>

          {onOpenAddService && (
            <button
              onClick={onOpenAddService}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Catat Servis</span>
            </button>
          )}

          <button
            onClick={onOpenAddReminder}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Reminder Cards Grid */}
      {filteredList.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Tidak ada pengingat pada kategori ini</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Semua item servis berada dalam kondisi aman atau Anda belum menambahkan pengingat kustom.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredList.map((item) => {
            const badge = getStatusBadge(item.status);
            const isOverdue = item.status === 'overdue';
            const isUrgent = item.status === 'urgent';

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-slate-900/90 border transition-all duration-200 hover:shadow-lg ${
                  isOverdue
                    ? 'border-red-500/40 shadow-red-950/20 bg-gradient-to-b from-red-950/20 to-slate-900/90'
                    : isUrgent
                    ? 'border-orange-500/40 shadow-orange-950/20 bg-gradient-to-b from-orange-950/20 to-slate-900/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top row: Title and Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="pr-2">
                      <h3 className="font-bold text-sm sm:text-base text-white tracking-tight leading-snug">
                        {item.title}
                      </h3>
                      {item.notes && (
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {item.notes}
                        </p>
                      )}
                    </div>

                    <div
                      className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                      <span>{badge.label}</span>
                    </div>
                  </div>

                  {/* Criteria Info: Interval KM & Months */}
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-slate-400 mb-3 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-1 font-mono">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tiap {item.intervalKm.toLocaleString('id-ID')} km</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tiap {item.intervalMonths} bulan</span>
                    </div>
                    <span className="text-slate-600">•</span>
                    <div className="text-slate-400">
                      Terakhir: <span className="font-mono text-slate-300">{item.lastServicedKm.toLocaleString('id-ID')} km</span> ({formatDateIndo(item.lastServicedDate)})
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center text-[11px] mb-1.5 font-mono">
                      <span className="text-slate-400">
                        Odometer: <span className="text-white font-semibold">{activeMotor.currentOdometer.toLocaleString('id-ID')} km</span>
                      </span>
                      <span className="text-slate-400">
                        Jatuh Tempo: <span className="text-amber-400 font-semibold">{item.nextDueKm.toLocaleString('id-ID')} km</span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverdue
                            ? 'bg-red-500'
                            : isUrgent
                            ? 'bg-orange-500'
                            : item.status === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, item.percentageUsed))}%` }}
                      />
                    </div>
                  </div>

                  {/* Remaining calculation banner */}
                  <div className="text-xs mb-4">
                    {item.remainingKm <= 0 ? (
                      <div className="flex items-center gap-1.5 text-red-400 font-bold bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Lewat {Math.abs(item.remainingKm).toLocaleString('id-ID')} km! Segera lakukan penggantian/servis di bengkel.
                        </span>
                      </div>
                    ) : item.remainingKm <= 300 ? (
                      <div className="flex items-center gap-1.5 text-orange-400 font-semibold bg-orange-500/10 p-2 rounded-xl border border-orange-500/20">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Sisa {item.remainingKm.toLocaleString('id-ID')} km (~{item.remainingDays} hari lagi). Siapkan jadwal servis Anda.
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Estimasi ganti: <strong className="text-slate-300 font-mono">{formatDateIndo(item.estimatedDueDate)}</strong></span>
                        <span className="font-mono text-emerald-400 font-medium">Sisa {item.remainingKm.toLocaleString('id-ID')} km</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => onQuickRecordService(item)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold transition group"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Catat Servis Selesai</span>
                  </button>

                  <button
                    onClick={() => setReminderToDelete(item)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                    title="Hapus Pengingat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-app Confirmation for Deleting Reminder */}
      <ConfirmModal
        isOpen={Boolean(reminderToDelete)}
        onClose={() => setReminderToDelete(null)}
        onConfirm={() => {
          if (reminderToDelete) {
            deleteReminder(reminderToDelete.id);
            setReminderToDelete(null);
          }
        }}
        title="Hapus Pengingat Servis?"
        message={`Jadwal pengingat "${reminderToDelete?.title}" akan dihapus dari motor ini.`}
        confirmText="Hapus Pengingat"
        cancelText="Batal"
        isDanger={true}
      />
    </div>
  );
};
