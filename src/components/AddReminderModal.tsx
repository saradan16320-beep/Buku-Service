import React, { useState, useEffect } from 'react';
import { useMotor } from '../context/MotorContext';
import { ServiceCategory } from '../types';
import { X, Clock, Gauge, Calendar, Bell, Plus } from 'lucide-react';
import { DEFAULT_SERVICE_TEMPLATES } from '../data/serviceTemplates';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddReminderModal: React.FC<AddReminderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { activeMotor, addReminder } = useMotor();

  const todayStr = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('oli_mesin');
  const [intervalKm, setIntervalKm] = useState<number>(2500);
  const [intervalMonths, setIntervalMonths] = useState<number>(2);
  const [lastServicedKm, setLastServicedKm] = useState<number>(activeMotor?.currentOdometer || 0);
  const [lastServicedDate, setLastServicedDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen && activeMotor) {
      setTitle('');
      setCategory('oli_mesin');
      setIntervalKm(2500);
      setIntervalMonths(2);
      setLastServicedKm(activeMotor.currentOdometer);
      setLastServicedDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [isOpen, activeMotor]);

  const handleSelectTemplate = (tpl: (typeof DEFAULT_SERVICE_TEMPLATES)[0]) => {
    setTitle(tpl.title);
    setCategory(tpl.category);
    setIntervalKm(tpl.defaultIntervalKm);
    setIntervalMonths(tpl.defaultIntervalMonths);
    setNotes(tpl.description);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMotor) return;
    if (!title.trim()) {
      alert('Nama pengingat servis wajib diisi');
      return;
    }

    addReminder({
      motorId: activeMotor.id,
      title: title.trim(),
      category,
      intervalKm: Number(intervalKm) || 2000,
      intervalMonths: Number(intervalMonths) || 2,
      lastServicedKm: Number(lastServicedKm) || 0,
      lastServicedDate,
      notes: notes.trim() || undefined,
      isCustom: true,
    });

    onClose();
  };

  if (!isOpen || !activeMotor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Tambah Jadwal Pengingat Servis
              </h2>
              <p className="text-xs text-slate-400">
                Peringatan berkala berbasis jarak tempuh (KM) & kalender bulan.
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

        {/* Quick Template Picker */}
        <div className="mt-4">
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Pilih Rekomendasi Standar Pabrik:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {DEFAULT_SERVICE_TEMPLATES.map((tpl) => (
              <button
                type="button"
                key={tpl.title}
                onClick={() => handleSelectTemplate(tpl)}
                className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 transition"
              >
                {tpl.title}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Komponen / Pekerjaan Servis *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Ganti Oli Mesin, Kampas Rem Belakang, Cek CVT"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori Item
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="oli_mesin">Oli Mesin</option>
                <option value="oli_gardan">Oli Gardan (Matic)</option>
                <option value="servis_cvt_rantai">CVT / Rantai</option>
                <option value="tune_up">Tune-Up / Injeksi</option>
                <option value="busi">Busi</option>
                <option value="filter_udara">Filter Udara</option>
                <option value="radiator_coolant">Air Radiator (Coolant)</option>
                <option value="kampas_rem">Kampas Rem</option>
                <option value="minyak_rem">Minyak Rem</option>
                <option value="aki">Aki / Battery</option>
                <option value="ban">Ban & Roda</option>
                <option value="kustom">Lainnya / Kustom</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Interval Jarak Tempuh (KM) *
              </label>
              <input
                type="number"
                required
                min={100}
                step={100}
                value={intervalKm}
                onChange={(e) => setIntervalKm(Number(e.target.value))}
                placeholder="2500"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Interval Waktu (Bulan) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={60}
                value={intervalMonths}
                onChange={(e) => setIntervalMonths(Number(e.target.value))}
                placeholder="2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Terakhir Servis Pada Odometer (KM)
              </label>
              <input
                type="number"
                min={0}
                value={lastServicedKm}
                onChange={(e) => setLastServicedKm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tanggal Terakhir Servis
              </label>
              <input
                type="date"
                required
                value={lastServicedDate}
                onChange={(e) => setLastServicedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan / Spesifikasi Onderdil
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: SPX2 SAE 10W-30 0.8L"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition active:scale-95 shadow-md shadow-amber-500/20"
            >
              Simpan Pengingat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
