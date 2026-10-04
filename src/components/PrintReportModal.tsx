import React, { useRef, useState } from 'react';
import { useMotor } from '../context/MotorContext';
import { formatDateIndo, formatKm, formatRupiah } from '../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import { X, Printer, Download, Upload, RotateCcw, Bike } from 'lucide-react';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeMotor, activeRecords, exportBackup, importBackup, resetAllData } = useMotor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!activeMotor) return;
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buku-servis-${activeMotor.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ok = importBackup(content);
        if (ok) {
          alert('Data berhasil dipulihkan dari backup!');
          onClose();
        } else {
          alert('Format file backup tidak valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  const totalCost = activeRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);

  if (!isOpen || !activeMotor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Cetak Buku Servis & Cadangan Data
              </h2>
              <p className="text-xs text-slate-400">
                Ekspor lembar servis berkala untuk kebutuhan arsip atau saat motor hendak dijual.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download Backup JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Restore Data</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-red-400 p-1.5 transition"
            title="Kosongkan seluruh data"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Kosongkan Data</span>
          </button>
        </div>

        {/* Printable Paper Preview Document */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-md border border-slate-200 print:m-0 print:p-0">
            {/* Header Document */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-5">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  BUKU SERVIS KENDARAAN BERMOTOR
                </h1>
                <p className="text-xs text-slate-600 uppercase tracking-widest mt-0.5">
                  Buku Catatan Perawatan & Histori Servis Berkala
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold bg-slate-100 border border-slate-300 px-3 py-1 rounded font-mono">
                  {activeMotor.plateNumber}
                </span>
              </div>
            </div>

            {/* Motor Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-xs">
              <div>
                <span className="text-slate-500 block">Nama Kendaraan:</span>
                <strong className="text-slate-900 font-bold">{activeMotor.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tahun / CC:</span>
                <strong className="text-slate-900 font-bold">
                  {activeMotor.year} ({activeMotor.engineCc} cc)
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Odometer Terkini:</span>
                <strong className="text-slate-900 font-mono font-bold">
                  {activeMotor.currentOdometer.toLocaleString('id-ID')} km
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Total Pengeluaran:</span>
                <strong className="text-emerald-700 font-mono font-bold">
                  {formatRupiah(totalCost)}
                </strong>
              </div>
            </div>

            {/* Table of Records */}
            <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
              Tabel Catatan Servis Berkala ({activeRecords.length} Kunjungan)
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 text-slate-700">
                  <tr>
                    <th className="py-2 px-3 font-bold">Tanggal</th>
                    <th className="py-2 px-3 font-bold">KM</th>
                    <th className="py-2 px-3 font-bold">Bengkel</th>
                    <th className="py-2 px-3 font-bold">Pekerjaan & Suku Cadang</th>
                    <th className="py-2 px-3 font-bold text-right">Biaya (Rp)</th>
                    <th className="py-2 px-3 font-bold text-center">Paraf / Cap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono">{rec.date}</td>
                      <td className="py-2 px-3 font-mono font-bold">
                        {rec.odometer.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 font-medium">{rec.workshopName}</td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-800">
                          {rec.tasksCompleted.join(', ')}
                        </div>
                        {rec.mechanicNotes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">
                            {rec.mechanicNotes}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-right font-semibold">
                        {rec.totalCost === 0 ? 'Gratis' : rec.totalCost.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 px-3 text-center border-l border-slate-200">
                        <div className="w-12 h-6 border border-dashed border-slate-300 rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between items-end text-xs text-slate-500 border-t border-slate-200 pt-4">
              <div>
                <p>Dokumen riwayat perawatan resmi dari Buku Servis Motor Digital.</p>
                <p className="text-[10px] text-slate-400">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
              </div>
              <div className="text-center">
                <div className="w-32 border-b border-slate-400 mb-1"></div>
                <span className="text-[10px]">Tanda Tangan Pemilik</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
          >
            Selesai
          </button>
        </div>
      </div>

      {/* In-app Confirmation for Reset All Data */}
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          resetAllData();
          setShowResetConfirm(false);
          onClose();
        }}
        title="Kosongkan Seluruh Data?"
        message="Seluruh data profil motor, catatan servis, dan jadwal pengingat akan dihapus dari aplikasi dan database cloud. Tindakan ini tidak dapat dibatalkan."
        confirmText="Kosongkan Semua"
        cancelText="Batal"
        isDanger={true}
      />
    </div>
  );
};
