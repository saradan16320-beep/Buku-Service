import React, { useState, useEffect } from 'react';
import { useMotor } from '../context/MotorContext';
import { ServiceType, ServiceReminder, ServiceRecord } from '../types';
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
  AlertCircle,
  Plus,
  Bike,
  Clock,
  Sparkles,
  Edit3,
} from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedReminder?: ServiceReminder | null;
  editingRecord?: ServiceRecord | null;
  onOpenAddMotor?: () => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  preselectedReminder,
  editingRecord,
  onOpenAddMotor,
}) => {
  const {
    activeMotor,
    motorcycles,
    activeReminders,
    records,
    addServiceRecord,
    updateServiceRecord,
  } = useMotor();

  const currentMotor = activeMotor || (motorcycles.length > 0 ? motorcycles[0] : undefined);
  const todayStr = new Date().toISOString().split('T')[0];

  const [motorId, setMotorId] = useState(currentMotor?.id || '');
  const [date, setDate] = useState(todayStr);
  const [odometer, setOdometer] = useState<number>(currentMotor?.currentOdometer || 0);
  const [workshopName, setWorkshopName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('rutin');
  const [costParts, setCostParts] = useState<string>('');
  const [costLabor, setCostLabor] = useState<string>('');
  const [mechanicNotes, setMechanicNotes] = useState('');
  const [warrantyDays, setWarrantyDays] = useState<number>(0);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [customTaskInput, setCustomTaskInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Checklist of tasks
  const [selectedTaskTitles, setSelectedTaskTitles] = useState<string[]>(() => {
    if (editingRecord) {
      return editingRecord.tasksCompleted;
    }
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
    if (isOpen) {
      setErrorMessage('');

      if (editingRecord) {
        // Edit Mode: Prefill existing record data
        setMotorId(editingRecord.motorId);
        setDate(editingRecord.date);
        setOdometer(editingRecord.odometer);
        setWorkshopName(editingRecord.workshopName || '');
        setServiceType(editingRecord.serviceType);
        setCostParts(editingRecord.costParts > 0 ? editingRecord.costParts.toString() : '');
        setCostLabor(editingRecord.costLabor > 0 ? editingRecord.costLabor.toString() : '');
        setMechanicNotes(editingRecord.mechanicNotes || '');
        setWarrantyDays(editingRecord.warrantyDays || 0);
        setReceiptImage(editingRecord.receiptImage || '');
        setSelectedTaskTitles(editingRecord.tasksCompleted || []);
        setSelectedReminderIds([]);
        setCustomTaskInput('');
      } else if (currentMotor) {
        // New Record Mode
        setMotorId(currentMotor.id);
        setDate(new Date().toISOString().split('T')[0]);
        setOdometer(currentMotor.currentOdometer);
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
    }
  }, [isOpen, preselectedReminder, editingRecord, currentMotor]);

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
    setErrorMessage('');

    if (!odometer || odometer < 0) {
      setErrorMessage('Masukkan angka odometer yang valid (minimal 0 KM)');
      return;
    }

    if (selectedTaskTitles.length === 0) {
      setErrorMessage('Pilih minimal satu pekerjaan servis atau tuliskan pada checklist');
      return;
    }

    const targetMotorId = motorId || currentMotor?.id;
    if (!targetMotorId) {
      setErrorMessage('Pilih motor yang diservis');
      return;
    }

    if (editingRecord) {
      // Update existing record
      updateServiceRecord(editingRecord.id, {
        motorId: targetMotorId,
        date,
        odometer: Number(odometer),
        workshopName: workshopName.trim() || 'Bengkel Servis',
        serviceType,
        tasksCompleted: selectedTaskTitles,
        costParts: numParts,
        costLabor: numLabor,
        totalCost,
        mechanicNotes: mechanicNotes.trim() || '',
        warrantyDays: Number(warrantyDays) || 0,
        receiptImage: receiptImage || '',
      });
    } else {
      // Add new record
      addServiceRecord(
        {
          motorId: targetMotorId,
          date,
          odometer: Number(odometer),
          workshopName: workshopName.trim() || 'Bengkel Servis',
          serviceType,
          tasksCompleted: selectedTaskTitles,
          costParts: numParts,
          costLabor: numLabor,
          totalCost,
          mechanicNotes: mechanicNotes.trim() || '',
          warrantyDays: Number(warrantyDays) || 0,
          receiptImage: receiptImage || '',
        },
        selectedReminderIds
      );
    }

    onClose();
  };

  // Dynamically extract recently used workshop names
  // The most recently added record's workshop is highlighted
  const recentRecords = [...records].sort(
    (a, b) =>
      new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
  );

  const lastUsedWorkshop = recentRecords.find((r) => r.workshopName && r.workshopName.trim() && r.workshopName !== 'Bengkel Servis')?.workshopName?.trim() || null;

  const allPreviousWorkshops = Array.from(
    new Set(
      recentRecords
        .map((r) => r.workshopName?.trim())
        .filter((w): w is string => Boolean(w && w.length > 0 && w !== 'Bengkel Servis'))
    )
  );

  // Common popular workshops
  const defaultPopular = ['AHASS', 'Planet Ban', 'Yamaha FSS', 'Shop & Bike', 'Bengkel Mandiri'];

  // Combined workshop recommendations without duplicate
  const recommendedWorkshops = Array.from(
    new Set([
      ...(lastUsedWorkshop ? [lastUsedWorkshop] : []),
      ...allPreviousWorkshops,
      ...defaultPopular,
    ])
  ).slice(0, 8);

  if (!isOpen) return null;

  // If no motor registered yet, render helpful onboarding modal
  if (!currentMotor) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
            <Bike className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Garasi Masih Kosong</h3>
          <p className="text-xs text-slate-400 mb-5">
            Daftarkan motor Anda terlebih dahulu untuk mulai mencatat riwayat servis dan nota perbaikan.
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
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              {editingRecord ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {editingRecord ? 'Edit Catatan Servis' : 'Catat Servis & Nota Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                {editingRecord
                  ? 'Perbarui detail pekerjaan, biaya, atau foto nota perbaikan'
                  : 'Simpan bukti pengerjaan, nota kasir, dan perbarui jadwal pengingat servis'}
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

        {errorMessage && (
          <div className="mt-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs font-semibold text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Target Motor & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Motor yang Diservis
              </label>
              <select
                value={motorId || currentMotor.id}
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
                <option value="ganti_ban">Penggantian Ban & Velg</option>
                <option value="kelistrikan">Aki, Lampu & Kelistrikan</option>
                <option value="modifikasi">Modifikasi & Aksesoris</option>
                <option value="turun_mesin">Turun Mesin (Overhaul)</option>
              </select>
            </div>
          </div>

          {/* Nama Bengkel & Dynamic Recommendations */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Nama Bengkel / Lokasi Servis
            </label>
            <input
              type="text"
              required
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
              placeholder="Contoh: AHASS Daya Motor BSD / Planet Ban"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />

            {/* Recommended Workshops Section */}
            <div className="mt-2.5">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Rekomendasi Bengkel:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* Highlight the most recently used workshop */}
                {lastUsedWorkshop && (
                  <button
                    type="button"
                    onClick={() => setWorkshopName(lastUsedWorkshop)}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-[11px] font-bold text-amber-300 transition flex items-center gap-1.5 shadow-sm active:scale-95"
                    title="Bengkel terakhir yang Anda gunakan"
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{lastUsedWorkshop}</span>
                    <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded">
                      Terakhir
                    </span>
                  </button>
                )}

                {/* Other recommendations */}
                {recommendedWorkshops
                  .filter((ws) => ws !== lastUsedWorkshop)
                  .map((ws) => (
                    <button
                      type="button"
                      key={ws}
                      onClick={() => setWorkshopName(ws)}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-300 hover:text-white transition active:scale-95"
                    >
                      {ws}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Pekerjaan / Komponen Servis (Checklist & Custom) */}
          <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
            <label className="block text-xs font-bold text-amber-400 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5" />
                Pekerjaan yang Dikerjakan (Centang Checklist):
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                {selectedTaskTitles.length} dipilih
              </span>
            </label>
            <p className="text-[11px] text-slate-400 mb-2.5">
              Jadwal pengingat yang dicentang akan otomatis diperbarui dan dihitung ulang siklus berikutnya.
            </p>

            {/* List of active reminders for this motor */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeReminders.map((rem) => {
                const isChecked = selectedTaskTitles.includes(rem.title);
                return (
                  <button
                    type="button"
                    key={rem.id}
                    onClick={() => toggleTask(rem.title, rem.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition border ${
                      isChecked
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      )}
                      <span className="font-medium">{rem.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Interval {rem.intervalKm.toLocaleString('id-ID')} km
                    </span>
                  </button>
                );
              })}

              {/* Show custom tasks added by user */}
              {selectedTaskTitles
                .filter((t) => !activeReminders.some((r) => r.title === t))
                .map((customT) => (
                  <div
                    key={customT}
                    className="flex items-center justify-between p-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                      <span>{customT}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleTask(customT)}
                      className="text-[10px] text-slate-400 hover:text-red-400"
                    >
                      Hapus
                    </button>
                  </div>
                ))}
            </div>

            {/* Input Tambah Pekerjaan Manual */}
            <div className="mt-2.5 flex items-center gap-2">
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
                placeholder="+ Tambah pekerjaan lain (misal: Ganti bohlam rem, tambal ban...)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTask}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Biaya Servis (Parts, Labor, Total) */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              Rincian Biaya Servis (Rp)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Biaya Suku Cadang / Sparepart (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={costParts}
                  onChange={(e) => setCostParts(e.target.value)}
                  placeholder="Contoh: 85000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Biaya Jasa Mekanik (Rp)
                </label>
                <input
                  type="number"
                  min={0}
                  value={costLabor}
                  onChange={(e) => setCostLabor(e.target.value)}
                  placeholder="Contoh: 45000"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-300">Total Pembayaran:</span>
              <span className="text-base font-extrabold font-mono text-emerald-400">
                Rp {totalCost.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Garansi & Catatan Mekanik */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Garansi Bengkel (Hari)
              </label>
              <input
                type="number"
                min={0}
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Mekanik / Keluhan
              </label>
              <input
                type="text"
                value={mechanicNotes}
                onChange={(e) => setMechanicNotes(e.target.value)}
                placeholder="Contoh: Kampas rem masih tebal, setel rantai, cek aki"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Foto Struk / Nota Kasir (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                Upload Foto Nota Kasir / Struk (Opsional)
              </span>
              {receiptImage && (
                <button
                  type="button"
                  onClick={() => setReceiptImage('')}
                  className="text-[10px] text-red-400 hover:underline"
                >
                  Hapus Foto
                </button>
              )}
            </label>

            {receiptImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 max-h-48 flex justify-center">
                <img
                  src={receiptImage}
                  alt="Nota Servis"
                  className="max-h-44 object-contain rounded-xl"
                />
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl cursor-pointer bg-slate-950/40 hover:bg-slate-950/70 transition">
                <Upload className="w-5 h-5 text-slate-500 mb-1" />
                <span className="text-xs text-slate-300 font-medium">
                  Klik untuk unggah foto nota / invoice bengkel
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG atau screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-1.5"
            >
              {editingRecord ? <Edit3 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
              <span>{editingRecord ? 'Simpan Perubahan' : 'Simpan Catatan Servis'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
