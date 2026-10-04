import React, { useState, useEffect } from 'react';
import { useMotor } from '../context/MotorContext';
import { ServiceType, ServiceReminder } from '../types';
import {
  X,
  PlusCircle,
  Building2,
  Calendar,
  Gauge,
  Wallet,
  Wrench,
  CheckSquare,
  Square,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedReminder?: ServiceReminder | null;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  preselectedReminder,
}) => {
  const { activeMotor, motorcycles, activeReminders, addServiceRecord } = useMotor();

  const todayStr = new Date().toISOString().split('T')[0];

  const [motorId, setMotorId] = useState(activeMotor?.id || '');
  const [date, setDate] = useState(todayStr);
  const [odometer, setOdometer] = useState<number>(activeMotor?.currentOdometer || 0);
  const [workshopName, setWorkshopName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('rutin');
  const [costParts, setCostParts] = useState<string>('');
  const [costLabor, setCostLabor] = useState<string>('');
  const [mechanicNotes, setMechanicNotes] = useState('');
  const [warrantyDays, setWarrantyDays] = useState<number>(0);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [customTaskInput, setCustomTaskInput] = useState('');

  // Checklist of tasks
  const [selectedTaskTitles, setSelectedTaskTitles] = useState<string[]>(() => {
    if (preselectedReminder) {
      return [preselectedReminder.title];
    }
    return ['Ganti Oli Mesin'];
  });

  const [selectedReminderIds, setSelectedReminderIds] = useState<string[]>(() => {
    if (preselectedReminder) {
      return [preselectedReminder.id];
    }
    const matched = activeReminders.find((r) => r.category === 'oli_mesin');
    return matched ? [matched.id] : [];
  });

  useEffect(() => {
    if (isOpen && activeMotor) {
      setMotorId(activeMotor.id);
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer(activeMotor.currentOdometer);
      setWorkshopName('');
      setCostParts('');
      setCostLabor('');
      setMechanicNotes('');
      setWarrantyDays(0);
      setReceiptImage('');
      setCustomTaskInput('');

      if (preselectedReminder) {
        setSelectedTaskTitles([preselectedReminder.title]);
        setSelectedReminderIds([preselectedReminder.id]);
      } else {
        const matched = activeReminders.find((r) => r.category === 'oli_mesin');
        setSelectedTaskTitles(matched ? [matched.title] : ['Ganti Oli Mesin']);
        setSelectedReminderIds(matched ? [matched.id] : []);
      }
    }
  }, [isOpen, preselectedReminder, activeMotor]);

  const toggleTask = (taskTitle: string, reminderId?: string) => {
    if (selectedTaskTitles.includes(taskTitle)) {
      setSelectedTaskTitles((prev) => prev.filter((t) => t !== taskTitle));
      if (reminderId) {
        setSelectedReminderIds((prev) => prev.filter((id) => id !== reminderId));
      }
    } else {
      setSelectedTaskTitles((prev) => [...prev, taskTitle]);
      if (reminderId) {
        setSelectedReminderIds((prev) => [...prev, reminderId]);
      }
    }
  };

  const handleAddCustomTask = () => {
    if (customTaskInput.trim()) {
      setSelectedTaskTitles((prev) => [...prev, customTaskInput.trim()]);
      setCustomTaskInput('');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const numParts = Number(costParts) || 0;
  const numLabor = Number(costLabor) || 0;
  const totalCost = numParts + numLabor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!odometer || odometer < 0) {
      alert('Masukkan angka odometer yang valid');
      return;
    }

    if (selectedTaskTitles.length === 0) {
      alert('Pilih minimal satu pekerjaan servis atau tuliskan pada kolom checklist');
      return;
    }

    addServiceRecord(
      {
        motorId,
        date,
        odometer: Number(odometer),
        workshopName: workshopName.trim() || 'Bengkel Servis',
        serviceType,
        tasksCompleted: selectedTaskTitles,
        costParts: numParts,
        costLabor: numLabor,
        totalCost,
        mechanicNotes: mechanicNotes.trim() || undefined,
        warrantyDays: Number(warrantyDays) || 0,
        receiptImage: receiptImage || undefined,
      },
      selectedReminderIds
    );

    onClose();
  };

  const quickWorkshops = ['AHASS', 'Yamaha FSS', 'Planet Ban', 'Shop & Bike', 'Bengkel Umum / DIY'];

  if (!isOpen || !activeMotor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Catat Servis & Perbaikan Motor
              </h2>
              <p className="text-xs text-slate-400">
                Pencatatan invoice, pergantian onderdil, dan pembaruan jadwal pengingat.
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Target Motor & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motor Yang Diservis
              </label>
              <select
                value={motorId}
                onChange={(e) => setMotorId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {motorcycles.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.plateNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Tanggal Servis
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Odometer & Jenis Servis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Odometer Saat Servis (KM)
              </label>
              <input
                type="number"
                required
                min={0}
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                placeholder="Contoh: 15200"
              />
              <span className="text-[10px] text-slate-500">
                Odometer motor akan otomatis disesuaikan jika angka ini lebih tinggi.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kategori / Jenis Pengerjaan
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as ServiceType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="rutin">Servis Rutin Berkala</option>
                <option value="perbaikan">Perbaikan Kerusakan / Kendala</option>
                <option value="ganti_ban">Ganti Ban Luar / Tubeless</option>
                <option value="kelistrikan">Aki & Sistem Kelistrikan</option>
                <option value="modifikasi">Modifikasi / Aksesoris</option>
                <option value="turun_mesin">Turun Mesin (Overhaul Mesin)</option>
              </select>
            </div>
          </div>

          {/* Nama Bengkel & Quick Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Nama Bengkel / Lokasi
            </label>
            <input
              type="text"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              placeholder="Contoh: AHASS Nusantara BSD, Planet Ban, Yamaha Flagship"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-500">Saran Cepat:</span>
              {quickWorkshops.map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWorkshopName(w)}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Checklist Pekerjaan / Item Pengingat */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-slate-200 mb-1 flex items-center justify-between">
              <span>Checklist Item Yang Diservis / Diganti:</span>
              <span className="text-[10px] text-amber-400 font-normal">
                Memperbarui jadwal pengingat otomatis
              </span>
            </label>

            {/* List reminders to check */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto pr-1">
              {activeReminders.map((rem) => {
                const isChecked = selectedTaskTitles.includes(rem.title);
                return (
                  <button
                    type="button"
                    key={rem.id}
                    onClick={() => toggleTask(rem.title, rem.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left text-xs transition border ${
                      isChecked
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <span className="truncate">{rem.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Task Input */}
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80">
              <input
                type="text"
                value={customTaskInput}
                onChange={(e) => setCustomTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTask();
                  }
                }}
                placeholder="+ Tambah pekerjaan lain (misal: Las knalpot, ganti spion)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTask}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Rincian Biaya (Sparepart, Jasa, Total) */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Rincian Biaya Servis</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Biaya Onderdil / Sparepart (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={costParts}
                  onChange={(e) => setCostParts(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Ongkos Jasa Mekanik (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={costLabor}
                  onChange={(e) => setCostLabor(e.target.value)}
                  placeholder="0"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Total Biaya (Otomatis)
                </label>
                <div className="w-full bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs font-mono font-black text-emerald-400 flex items-center justify-between">
                  <span>Rp {totalCost.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Mekanik & Garansi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Mekanik / Keluhan Motor
              </label>
              <textarea
                rows={2}
                value={mechanicNotes}
                onChange={(e) => setMechanicNotes(e.target.value)}
                placeholder="Contoh: Roller 13gr diganti, oli transmisi diganti baru, getaran tarikan awal sudah normal."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Garansi Bengkel (Hari)
              </label>
              <input
                type="number"
                min={0}
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value))}
                placeholder="Misal: 7"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500">Opsional</span>
            </div>
          </div>

          {/* Foto Nota / Bukti Struk */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Upload Bukti Struk / Foto Invoice (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
              />
              {receiptImage && (
                <div className="relative">
                  <img
                    src={receiptImage}
                    alt="Preview Struk"
                    className="w-10 h-10 object-cover rounded-lg border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => setReceiptImage('')}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[10px]"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              Simpan Catatan Servis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
