import React, { useState, useEffect } from 'react';
import { useMotor } from '../context/MotorContext';
import { ServiceCategory } from '../types';
import { X, Clock, Gauge, Calendar, Bell, Plus, AlertCircle, Bike } from 'lucide-react';
import { DEFAULT_SERVICE_TEMPLATES } from '../data/serviceTemplates';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddMotor?: () => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
  onOpenAddMotor,
}) => {
  const { activeMotor, motorcycles, addReminder } = useMotor();
  const currentMotor = activeMotor || (motorcycles.length > 0 ? motorcycles[0] : undefined);

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('oli_mesin');
  const [intervalKm, setIntervalKm] = useState<number>(2500);
  const [intervalMonths, setIntervalMonths] = useState<number>(2);
  const [lastServicedKm, setLastServicedKm] = useState<number>(currentMotor?.currentOdometer || 0);
  const [lastServicedDate, setLastServicedDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen && currentMotor) {
      setTitle('');
      setCategory('oli_mesin');
      setIntervalKm(2500);
      setIntervalMonths(2);
      setLastServicedKm(currentMotor.currentOdometer);
      setLastServicedDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setErrorMessage('');
    }
  }, [isOpen, currentMotor]);

  const handleSelectTemplate = (tpl: (typeof DEFAULT_SERVICE_TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setIntervalKm(tpl.defaultIntervalKm);
    setIntervalMonths(tpl.defaultIntervalMonths);
    setNotes(tpl.description || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentMotor) {
      setErrorMessage('Pilih atau daftarkan motor terlebih dahulu');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('Nama pengingat servis wajib diisi');
      return;
    }

    addReminder({
      motorId: currentMotor.id,
      title: title.trim(),
      category,
      intervalKm: Number(intervalKm) || 2000,
      intervalMonths: Number(intervalMonths) || 2,
      lastServicedKm: Number(lastServicedKm) || 0,
      lastServicedDate: lastServicedDate || new Date().toISOString().split('T')[0],
      notes: notes.trim() || '',
      isCustom: true,
    });

    onClose();
  };

  if (!isOpen) return null;

  if (!currentMotor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
            <Bike className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Garasi Masih Kosong</h3>
          <p className="text-xs text-slate-400 mb-5">
            Daftarkan motor Anda terlebih dahulu untuk menambah jadwal pengingat servis.
          </p>
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
            >
              Tutup
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenAddMotor) onOpenAddMotor();
              }}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition"
            >
              + Tambah Motor
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Tambah Jadwal Pengingat Servis
              </h2>
              <p className="text-[11px] text-slate-400">
                Untuk {currentMotor.name} ({currentMotor.plateNumber})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3.5 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs font-semibold text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Template Picker */}
        <div className="mt-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Pilih Template Standar Pabrikan:
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {DEFAULT_SERVICE_TEMPLATES.map((tpl) => (
              <button
                type="button"
                key={tpl.title}
                onClick={() => handleSelectTemplate(tpl)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3 text-amber-400" />
                <span>{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Pekerjaan / Komponen Servis:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ganti Minyak Rem DOT 4 / Cek Tekanan Shockbreaker"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kategori Servis:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ServiceCategory)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="oli_mesin">Oli Mesin</option>
              <option value="oli_gardan">Oli Gardan / Transmisi</option>
              <option value="servis_cvt_rantai">CVT / Rantai & Gear</option>
              <option value="busi">Busi</option>
              <option value="filter_udara">Filter Udara</option>
              <option value="radiator_coolant">Radiator Coolant</option>
              <option value="kampas_rem">Kampas Rem</option>
              <option value="minyak_rem">Minyak Rem</option>
              <option value="aki">Aki / Battery</option>
              <option value="ban">Ban & Velg</option>
              <option value="tune_up">Tune Up & Injeksi</option>
              <option value="kustom">Kustom / Lainnya</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Interval Jarak (KM)
              </label>
              <input
                type="number"
                required
                min={500}
                step={100}
                value={intervalKm}
                onChange={(e) => setIntervalKm(Number(e.target.value))}
                placeholder="2500"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Interval Waktu (Bulan)
              </label>
              <input
                type="number"
                required
                min={1}
                max={48}
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(Number(e.target.value))}
                placeholder="2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2.5">
            <span className="text-[11px] font-bold text-slate-300 block">
              Patokan Servis Terakhir:
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Odometer Terakhir (KM)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={lastServicedKm}
                  onChange={(e) => setLastServicedKm(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Tanggal Terakhir
                </label>
                <input
                  type="date"
                  required
                  value={lastServicedDate}
                  onChange={(e) => setLastServicedDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan / Spesifikasi Onderdil (Opsional):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Oli SAE 10W-30 JASO MB 0.8 Liter"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-md shadow-amber-500/20 active:scale-95"
            >
              Simpan Pengingat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
