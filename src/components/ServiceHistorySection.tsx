import React, { useState } from 'react';
import { useMotor } from '../context/MotorContext';
import { ServiceRecord, ServiceType } from '../types';
import { formatDateIndo, formatKm, formatRupiah } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import {
  History,
  Search,
  Filter,
  PlusCircle,
  Wrench,
  Calendar,
  Building2,
  Trash2,
  FileText,
  ShieldCheck,
  Tag,
  ImageIcon,
  Pencil,
  AlertCircle,
  X,
} from 'lucide-react';

interface ServiceHistorySectionProps {
  onOpenAddService: () => void;
  onEditService?: (record: ServiceRecord) => void;
  onViewReceipt?: (imageUrl: string) => void;
}

export const ServiceHistorySection: React.FC<ServiceHistorySectionProps> = ({
  onOpenAddService,
  onEditService,
  onViewReceipt,
}) => {
  const { activeMotor, activeRecords, deleteServiceRecord } = useMotor();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [activeReceiptModal, setActiveReceiptModal] = useState<string | null>(null);

  // In-app deletion state instead of window.confirm
  const [recordToDelete, setRecordToDelete] = useState<ServiceRecord | null>(null);

  if (!activeMotor) return null;

  const typeConfig: Record<
    ServiceType,
    { label: string; bg: string; text: string; border: string }
  > = {
    rutin: {
      label: 'Servis Berkala',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    perbaikan: {
      label: 'Perbaikan Kendala',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    ganti_ban: {
      label: 'Ganti Ban',
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
    },
    kelistrikan: {
      label: 'Aki & Kelistrikan',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
    },
    modifikasi: {
      label: 'Modifikasi',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    },
    turun_mesin: {
      label: 'Turun Mesin (Overhaul)',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      border: 'border-red-500/30',
    },
  };

  const filteredRecords = activeRecords.filter((rec) => {
    // Filter by type
    if (selectedType !== 'all' && rec.serviceType !== selectedType) {
      return false;
    }
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchWorkshop = rec.workshopName.toLowerCase().includes(q);
      const matchNotes = rec.mechanicNotes?.toLowerCase().includes(q);
      const matchTasks = rec.tasksCompleted.some((t) => t.toLowerCase().includes(q));
      if (!matchWorkshop && !matchNotes && !matchTasks) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Riwayat Servis & Perbaikan
            </h2>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {activeRecords.length} Catatan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar lengkap perbaikan, penggantian sparepart, dan invoice bengkel untuk {activeMotor.name}.
          </p>
        </div>

        <button
          onClick={onOpenAddService}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Catat Servis Baru</span>
        </button>
      </div>

      {/* Search and Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama bengkel, suku cadang (oli, busi), keluhan..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {/* Type Select */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Kategori Servis</option>
            <option value="rutin">Servis Berkala</option>
            <option value="perbaikan">Perbaikan Kendala</option>
            <option value="ganti_ban">Ganti Ban</option>
            <option value="kelistrikan">Aki & Kelistrikan</option>
            <option value="modifikasi">Modifikasi</option>
            <option value="turun_mesin">Turun Mesin</option>
          </select>
        </div>
      </div>

      {/* Records Timeline List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30">
          <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">Belum Ada Riwayat Servis</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Tidak ada catatan servis yang cocok dengan pencarian kata kunci ini.'
              : 'Klik tombol "+ Catat Servis Baru" di atas untuk menyimpan nota dan riwayat servis pertama motor ini.'}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={onOpenAddService}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Servis Sekarang</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredRecords.map((record) => {
            const badge = typeConfig[record.serviceType] || typeConfig.rutin;

            return (
              <div
                key={record.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Column: Date, Workshop, Type, Tasks */}
                  <div className="space-y-2.5 flex-1">
                    {/* Meta Header */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{formatDateIndo(record.date)}</span>
                      </div>

                      <span className="text-slate-600">•</span>

                      <div className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        {record.odometer.toLocaleString('id-ID')} km
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}
                      >
                        {badge.label}
                      </span>

                      {record.warrantyDays && record.warrantyDays > 0 ? (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Garansi {record.warrantyDays} Hari
                        </span>
                      ) : null}
                    </div>

                    {/* Workshop Name */}
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-200">
                        {record.workshopName || 'Bengkel Servis'}
                      </span>
                    </div>

                    {/* Task checklist pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {record.tasksCompleted.map((task, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          {task}
                        </span>
                      ))}
                    </div>

                    {/* Mechanic Notes */}
                    {record.mechanicNotes && (
                      <div className="mt-2 text-xs text-slate-400 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="font-semibold text-slate-300">Catatan Mekanik: </span>
                        <span>{record.mechanicNotes}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Cost Breakdown & Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0 gap-2">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Total Biaya
                      </div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                        {record.totalCost === 0 ? 'GRATIS (KPB)' : formatRupiah(record.totalCost)}
                      </div>
                      {record.totalCost > 0 && (
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          Part: {formatRupiah(record.costParts)} | Jasa: {formatRupiah(record.costLabor)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      {record.receiptImage && (
                        <button
                          onClick={() => setActiveReceiptModal(record.receiptImage || null)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 transition"
                          title="Lihat Foto Struk / Nota"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Foto Nota</span>
                        </button>
                      )}

                      {/* EDIT BUTTON */}
                      {onEditService && (
                        <button
                          onClick={() => onEditService(record)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition"
                          title="Edit Catatan Servis Ini"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      )}

                      {/* DELETE BUTTON with in-app confirmation */}
                      <button
                        onClick={() => setRecordToDelete(record)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                        title="Hapus Catatan Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => {
          if (recordToDelete) {
            deleteServiceRecord(recordToDelete.id);
            setRecordToDelete(null);
          }
        }}
        title="Hapus Catatan Servis?"
        message={`Catatan servis tanggal ${recordToDelete ? formatDateIndo(recordToDelete.date) : ''} (${recordToDelete?.workshopName || 'Bengkel'}) senilai ${recordToDelete ? (recordToDelete.totalCost === 0 ? 'GRATIS' : formatRupiah(recordToDelete.totalCost)) : ''} akan dihapus secara permanen.`}
        confirmText="Hapus Catatan"
        cancelText="Batal"
        isDanger={true}
      />

      {/* Receipt Image Zoom Modal */}
      {activeReceiptModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setActiveReceiptModal(null)}
        >
          <div
            className="max-w-xl max-h-[90vh] bg-slate-900 p-4 rounded-3xl border border-slate-700 shadow-2xl overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Bukti Struk / Nota Servis
              </h4>
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={activeReceiptModal}
              alt="Foto Nota Kasir"
              className="max-h-[75vh] w-auto mx-auto rounded-2xl object-contain border border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
};
