import React from 'react';
import { useMotor } from '../context/MotorContext';
import { checkAllDueReminders } from '../utils/notifications';
import {
  X,
  Bike,
  Plus,
  Check,
  Gauge,
  BookOpen,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

interface GarageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddMotor: () => void;
  onOpenTroubleshooting: () => void;
  onOpenPrint: () => void;
}

export const GarageDrawer: React.FC<GarageDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAddMotor,
  onOpenTroubleshooting,
  onOpenPrint,
}) => {
  const { motorcycles, activeMotorId, setActiveMotorId, reminders } = useMotor();

  if (!isOpen) return null;

  const allAlerts = checkAllDueReminders(motorcycles, reminders);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 pb-8 sm:pb-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar on mobile */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Garasi Motor Anda
              </h3>
              <p className="text-[11px] text-slate-400">
                Pilih kendaraan untuk melihat catatan servis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Motorcycles */}
        <div className="mt-4 space-y-2">
          {motorcycles.map((motor) => {
            const isSelected = motor.id === activeMotorId;
            const motorAlerts = allAlerts.filter((a) => a.motorId === motor.id);

            return (
              <button
                key={motor.id}
                onClick={() => {
                  setActiveMotorId(motor.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition border ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/40 text-white shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {motor.name.slice(0, 1)}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {motor.name}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                          Aktif
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{motor.plateNumber}</span>
                      <span>•</span>
                      <span>{motor.currentOdometer.toLocaleString('id-ID')} km</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {motorAlerts.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>{motorAlerts.length} Servis</span>
                    </span>
                  )}
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action: Add new motorcycle */}
        <div className="mt-3">
          <button
            onClick={() => {
              onClose();
              onOpenAddMotor();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-amber-400 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Motor Baru ke Garasi</span>
          </button>
        </div>

        {/* Quick Menu shortcuts inside drawer */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-1">
            Menu Lainnya
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenTroubleshooting();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800 text-slate-300 text-xs transition"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Panduan Diagnosa Kerusakan Motor</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPrint();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 hover:bg-slate-800 text-slate-300 text-xs transition"
          >
            <div className="flex items-center gap-2.5">
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Cetak Buku Servis / Backup Data</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};
