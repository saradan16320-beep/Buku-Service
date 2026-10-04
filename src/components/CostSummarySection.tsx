import React from 'react';
import { useMotor } from '../context/MotorContext';
import { formatRupiah } from '../utils/formatters';
import { Wallet, PieChart, Layers, ArrowUpRight, DollarSign, Wrench } from 'lucide-react';
import { ServiceType } from '../types';

export const CostSummarySection: React.FC = () => {
  const { activeMotor, activeRecords, motorcycles, records } = useMotor();

  if (!activeMotor) return null;

  // Total costs for current motorcycle
  const totalCost = activeRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const totalParts = activeRecords.reduce((sum, r) => sum + (r.costParts || 0), 0);
  const totalLabor = activeRecords.reduce((sum, r) => sum + (r.costLabor || 0), 0);
  const avgCostPerService = activeRecords.length > 0 ? Math.round(totalCost / activeRecords.length) : 0;

  // Breakdown by Service Type
  const serviceTypeLabels: Record<ServiceType, string> = {
    rutin: 'Servis Rutin Berkala',
    perbaikan: 'Perbaikan / Kerusakan',
    ganti_ban: 'Penggantian Ban',
    kelistrikan: 'Aki & Kelistrikan',
    modifikasi: 'Modifikasi / Aksesoris',
    turun_mesin: 'Turun Mesin / Overhaul',
  };

  const costByType: Record<ServiceType, number> = {
    rutin: 0,
    perbaikan: 0,
    ganti_ban: 0,
    kelistrikan: 0,
    modifikasi: 0,
    turun_mesin: 0,
  };

  activeRecords.forEach((r) => {
    if (costByType[r.serviceType] !== undefined) {
      costByType[r.serviceType] += r.totalCost || 0;
    }
  });

  // Calculate percentages
  const partsPercentage = totalCost > 0 ? Math.round((totalParts / totalCost) * 100) : 0;
  const laborPercentage = totalCost > 0 ? 100 - partsPercentage : 0;

  // Other bikes summary comparison
  const bikeComparisons = motorcycles.map((m) => {
    const mRecords = records.filter((r) => r.motorId === m.id);
    const mTotal = mRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    return {
      id: m.id,
      name: m.name,
      plate: m.plateNumber,
      totalCost: mTotal,
      serviceCount: mRecords.length,
      isCurrent: m.id === activeMotor.id,
    };
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Ringkasan Biaya Perawatan Motor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis rincian pengeluaran untuk <strong className="text-slate-200">{activeMotor.name}</strong> ({activeMotor.plateNumber})
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Terakumulasi</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatRupiah(totalCost)}
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Parts vs Labor Ratio */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Biaya Sparepart</span>
            <span className="font-mono text-emerald-400">{partsPercentage}%</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white font-mono">
            {formatRupiah(totalParts)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Penggantian oli, filter, busi, ban, kampas rem
          </div>
        </div>

        {/* Labor Cost */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Ongkos Jasa Mekanik</span>
            <span className="font-mono text-cyan-400">{laborPercentage}%</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-white font-mono">
            {formatRupiah(totalLabor)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Jasa servis berkala, pembersihan CVT, bongkar pasang
          </div>
        </div>

        {/* Average per Service */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-slate-300">Rata-Rata per Kunjungan</span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">
              {activeRecords.length} Kunjungan
            </span>
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-400 font-mono">
            {formatRupiah(avgCostPerService)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Biaya tipikal setiap kali ke bengkel
          </div>
        </div>
      </div>

      {/* Progress Bars for Service Types */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-amber-400" />
          Distribusi Biaya Berdasarkan Jenis Pengerjaan
        </h3>

        <div className="space-y-2.5">
          {(Object.keys(costByType) as ServiceType[]).map((typeKey) => {
            const cost = costByType[typeKey];
            if (cost <= 0 && activeRecords.length > 0) return null;
            const pct = totalCost > 0 ? Math.round((cost / totalCost) * 100) : 0;

            return (
              <div key={typeKey} className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-slate-300">
                    {serviceTypeLabels[typeKey]}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {formatRupiah(cost)}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Motor Comparison (if > 1 motorcycle registered) */}
      {motorcycles.length > 1 && (
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            Perbandingan Total Biaya Antar Motor di Garasi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {bikeComparisons.map((b) => (
              <div
                key={b.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  b.isCurrent
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{b.name}</span>
                    {b.isCurrent && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-extrabold">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {b.plate} • {b.serviceCount}x servis
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-black text-sm text-emerald-400">
                    {formatRupiah(b.totalCost)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
