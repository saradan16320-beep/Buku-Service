import React from 'react';
import { useMotor } from '../context/MotorContext';
import { formatKm, formatRupiah, computeReminder } from '../utils/formatters';
import {
  Gauge,
  Calendar,
  Fuel,
  Wallet,
  Wrench,
  PlusCircle,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface MotorcycleProfileCardProps {
  onOpenAddService: () => void;
  onOpenAddReminder: () => void;
  onOpenEditMotor: () => void;
  onOpenQuickKm: () => void;
}

export const MotorcycleProfileCard: React.FC<MotorcycleProfileCardProps> = ({
  onOpenAddService,
  onOpenAddReminder,
  onOpenEditMotor,
  onOpenQuickKm,
}) => {
  const { activeMotor, activeReminders, activeRecords } = useMotor();

  if (!activeMotor) return null;

  // Calculate total maintenance cost for active motorcycle
  const totalCost = activeRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalParts = activeRecords.reduce((sum, r) => sum + (r.costParts || 0), 0);
  const totalLabor = activeRecords.reduce((sum, r) => sum + (r.costLabor || 0), 0);

  // Compute status for all reminders of this motor
  const computedReminders = activeReminders.map((r) => computeReminder(r, activeMotor));
  const overdueCount = computedReminders.filter((r) => r.status === 'overdue').length;
  const urgentCount = computedReminders.filter((r) => r.status === 'urgent').length;
  const warningCount = computedReminders.filter((r) => r.status === 'warning').length;

  const typeLabels: Record<string, string> = {
    matic: 'Matic (CVT)',
    manual: 'Manual (Kopling)',
    bebek: 'Bebek (Cub)',
    sport: 'Sport',
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/90 via-slate-850 to-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-7 shadow-xl shadow-slate-950/40">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10">
        {/* Top Bar: Plate, Badges, and Edit Button */}
        <div className="flex flex-wrap items-start justify-between gap-2.5 mb-4 sm:mb-5">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {/* Indonesian License Plate Style Badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-950 border border-slate-700 rounded-lg text-[11px] sm:text-xs font-mono font-bold tracking-widest text-slate-100 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {activeMotor.plateNumber}
              </div>

              <span className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {typeLabels[activeMotor.type] || activeMotor.type}
              </span>

              <span className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                {activeMotor.engineCc} cc
              </span>

              <span className="text-[11px] sm:text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                Tahun {activeMotor.year}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                {activeMotor.name}
              </h1>
              <button
                onClick={onOpenEditMotor}
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                title="Edit Profil Motor"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
            {activeMotor.notes && (
              <p className="text-xs text-slate-400 max-w-xl italic line-clamp-2">
                "{activeMotor.notes}"
              </p>
            )}
          </div>

          {/* Quick Health Summary Pill */}
          <div className="flex items-center gap-2">
            {overdueCount > 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{overdueCount} Lewat Batas!</span>
              </div>
            ) : urgentCount > 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{urgentCount} Perlu Segera</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Semua Aman</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid: Odometer, Total Spent, Service Count */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 my-6">
          {/* Odometer Box with Quick Edit */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Gauge className="w-4 h-4 text-amber-400" />
                Odometer Terkini
              </span>
              <button
                onClick={onOpenQuickKm}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
              >
                + Update KM
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeMotor.currentOdometer.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-slate-400">km</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Pemakaian rata-rata:</span>
              <span className="font-semibold text-slate-300">~{activeMotor.avgKmPerDay} km / hari</span>
            </div>
          </div>

          {/* Total Maintenance Cost Spent for THIS motorcycle */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Total Biaya Perawatan
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {activeRecords.length} kali servis
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
                {formatRupiah(totalCost)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Rincian:</span>
              <span className="text-slate-300">
                Part: <span className="font-mono font-medium text-slate-200">{formatRupiah(totalParts)}</span> • Jasa:{' '}
                <span className="font-mono font-medium text-slate-200">{formatRupiah(totalLabor)}</span>
              </span>
            </div>
          </div>

          {/* Next Immediate Due Milestone */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Jadwal Servis Terdekat
              </span>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                {activeReminders.length} Item Dipantau
              </span>
            </div>
            {computedReminders.length > 0 ? (
              (() => {
                // Find most urgent item
                const sorted = [...computedReminders].sort(
                  (a, b) => a.remainingKm - b.remainingKm
                );
                const mostUrgent = sorted[0];
                return (
                  <div>
                    <div className="font-bold text-sm sm:text-base text-white truncate">
                      {mostUrgent.title}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      {mostUrgent.remainingKm <= 0 ? (
                        <span className="text-red-400 font-semibold font-mono">
                          Lewat {Math.abs(mostUrgent.remainingKm).toLocaleString('id-ID')} km
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold font-mono">
                          Sisa {mostUrgent.remainingKm.toLocaleString('id-ID')} km (~{mostUrgent.remainingDays} hari)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-xs text-slate-400">Belum ada pengingat diset</div>
            )}
            <div className="mt-2 text-[11px] text-slate-500">
              Pengingat dihitung otomatis dari KM & Tanggal
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onOpenAddService}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Catat Servis / Perbaikan</span>
          </button>

          <button
            onClick={onOpenAddReminder}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition"
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Tambah Jadwal Pengingat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
