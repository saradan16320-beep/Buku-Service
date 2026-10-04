import React, { useState, useEffect } from 'react';
import { useMotor } from '../context/MotorContext';
import { Motorcycle, MotorcycleType } from '../types';
import { X, Bike, Check, Trash2 } from 'lucide-react';

interface AddMotorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMotor?: Motorcycle | null;
}

export const AddMotorModal: React.FC<AddMotorModalProps> = ({
  isOpen,
  onClose,
  editingMotor,
}) => {
  const { addMotorcycle, updateMotorcycle, deleteMotorcycle, motorcycles } = useMotor();

  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [type, setType] = useState<MotorcycleType>('matic');
  const [engineCc, setEngineCc] = useState<number>(150);
  const [currentOdometer, setCurrentOdometer] = useState<number>(1000);
  const [avgKmPerDay, setAvgKmPerDay] = useState<number>(25);
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editingMotor) {
      setName(editingMotor.name);
      setPlateNumber(editingMotor.plateNumber);
      setYear(editingMotor.year);
      setType(editingMotor.type);
      setEngineCc(editingMotor.engineCc);
      setCurrentOdometer(editingMotor.currentOdometer);
      setAvgKmPerDay(editingMotor.avgKmPerDay || 25);
      setColor(editingMotor.color || '');
      setNotes(editingMotor.notes || '');
    } else {
      setName('');
      setPlateNumber('');
      setYear(new Date().getFullYear());
      setType('matic');
      setEngineCc(150);
      setCurrentOdometer(0);
      setAvgKmPerDay(25);
      setColor('');
      setNotes('');
    }
  }, [editingMotor, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plateNumber.trim()) {
      alert('Nama model dan plat nomor wajib diisi!');
      return;
    }

    if (editingMotor) {
      updateMotorcycle(editingMotor.id, {
        name: name.trim(),
        plateNumber: plateNumber.trim().toUpperCase(),
        year: Number(year),
        type,
        engineCc: Number(engineCc),
        currentOdometer: Number(currentOdometer),
        avgKmPerDay: Number(avgKmPerDay),
        color: color.trim(),
        notes: notes.trim(),
      });
    } else {
      addMotorcycle({
        name: name.trim(),
        plateNumber: plateNumber.trim().toUpperCase(),
        year: Number(year),
        type,
        engineCc: Number(engineCc),
        currentOdometer: Number(currentOdometer),
        avgKmPerDay: Number(avgKmPerDay),
        color: color.trim(),
        notes: notes.trim(),
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (!editingMotor) return;
    if (confirm(`Yakin ingin menghapus profil motor "${editingMotor.name}"? Semua data riwayat servisnya akan terhapus.`)) {
      deleteMotorcycle(editingMotor.id);
      onClose();
    }
  };

  const popularModels = [
    'Honda Vario 160',
    'Honda Beat Deluxe',
    'Honda PCX 160',
    'Yamaha NMAX 155',
    'Yamaha Aerox 155',
    'Yamaha Grand Filano',
    'Honda Scoopy',
    'Vespa Sprint 150',
    'Kawasaki Ninja 250',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {editingMotor ? 'Edit Profil Motor' : 'Tambah Motor Baru'}
              </h2>
              <p className="text-xs text-slate-400">
                Kelola kendaraan di garasi digital Anda.
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
          {/* Brand & Model Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Merk & Nama Model Motor *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Honda Vario 160 ABS, Yamaha NMAX 155"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {/* Quick choices */}
            {!editingMotor && (
              <div className="flex flex-wrap gap-1 mt-2">
                {popularModels.slice(0, 5).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setName(m)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-lg border border-slate-700 transition"
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Plat Nomor & Tahun */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plat Nomor Kendaraan *
              </label>
              <input
                type="text"
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                placeholder="B 1234 ABC"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase tracking-wider focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tahun Pembuatan
              </label>
              <input
                type="number"
                min={1990}
                max={2030}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Transmisi & Kapasitas Mesin */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tipe Transmisi
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MotorcycleType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="matic">Matic (Transmisi CVT)</option>
                <option value="bebek">Bebek / Cub (Semi Otomatis)</option>
                <option value="manual">Manual (Kopling Basah)</option>
                <option value="sport">Sport (Manual Kopling)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Kapasitas Mesin (CC)
              </label>
              <input
                type="number"
                min={50}
                max={1200}
                value={engineCc}
                onChange={(e) => setEngineCc(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                placeholder="150"
              />
            </div>
          </div>

          {/* Odometer & Rata-rata Harian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Odometer Terkini (KM)
              </label>
              <input
                type="number"
                min={0}
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Rata-Rata KM / Hari
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={avgKmPerDay}
                onChange={(e) => setAvgKmPerDay(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                placeholder="25"
              />
              <span className="text-[10px] text-slate-500">
                Untuk estimasi cerdas tanggal servis
              </span>
            </div>
          </div>

          {/* Warna & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Warna Motor
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Contoh: Hitam Doff, Merah Candy"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Khusus
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Nomor Rangka / Bahan Bakar Pertamax"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {editingMotor && motorcycles.length > 1 ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Motor</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                {editingMotor ? 'Simpan Perubahan' : 'Daftarkan Motor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
