import React, { useState, useEffect } from 'react';
import { useMotor } from '../context/MotorContext';
import { X, Gauge, Plus, ArrowRight } from 'lucide-react';

interface QuickKmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickKmModal: React.FC<QuickKmModalProps> = ({ isOpen, onClose }) => {
  const { activeMotor, updateOdometer } = useMotor();

  const [kmValue, setKmValue] = useState<number>(activeMotor?.currentOdometer || 0);

  useEffect(() => {
    if (isOpen && activeMotor) {
      setKmValue(activeMotor.currentOdometer);
    }
  }, [isOpen, activeMotor]);

  const handleQuickAdd = (increment: number) => {
    setKmValue((prev) => prev + increment);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (kmValue < 0 || !activeMotor) return;
    updateOdometer(activeMotor.id, kmValue);
    onClose();
  };

  if (!isOpen || !activeMotor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Update Odometer (KM)
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeMotor.name} ({activeMotor.plateNumber})
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

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Angka Speedometer Saat Ini:
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                required
                value={kmValue}
                onChange={(e) => setKmValue(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-xl font-black font-mono text-white text-center tracking-wider focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                KM
              </span>
            </div>
          </div>

          {/* Quick Increment buttons */}
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
              Tambah Cepat Pemakaian:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[+15, +25, +50, +100].map((inc) => (
                <button
                  type="button"
                  key={inc}
                  onClick={() => handleQuickAdd(inc)}
                  className="py-2 px-1 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold font-mono text-amber-400 transition"
                >
                  +{inc} km
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            Perubahan odometer akan memperbarui sisa jarak tempuh untuk oli mesin, busi, CVT, dan seluruh jadwal servis secara instan.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
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
              Simpan KM Terbaru
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
