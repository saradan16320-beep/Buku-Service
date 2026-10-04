import React, { useState } from 'react';
import { useMotor } from '../context/MotorContext';
import { checkAllDueReminders } from '../utils/notifications';
import {
  Bike,
  Plus,
  Bell,
  Wrench,
  BookOpen,
  Printer,
  ChevronDown,
  Gauge,
  Cloud,
  Check,
} from 'lucide-react';

interface HeaderProps {
  onOpenAddMotor: () => void;
  onOpenNotifications: () => void;
  onOpenTroubleshooting: () => void;
  onOpenPrint: () => void;
  onOpenQuickKm: () => void;
  onOpenGarage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAddMotor,
  onOpenNotifications,
  onOpenTroubleshooting,
  onOpenPrint,
  onOpenQuickKm,
  onOpenGarage,
}) => {
  const {
    motorcycles,
    activeMotor,
    activeMotorId,
    setActiveMotorId,
    reminders,
    isFirebaseConnected,
    isSyncing,
  } = useMotor();
  const [showMotorDropdown, setShowMotorDropdown] = useState(false);

  const allAlerts = checkAllDueReminders(motorcycles, reminders);
  const urgentCount = allAlerts.length;

  const handleMotorClick = () => {
    if (window.innerWidth < 640 && onOpenGarage) {
      onOpenGarage();
    } else {
      setShowMotorDropdown(!showMotorDropdown);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black">
              <Bike className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-white">
                  BukuServis<span className="text-amber-400">Motor</span>
                </span>
                {isFirebaseConnected && (
                  <span
                    className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30"
                    title="Database tersimpan secara realtime di Firebase Firestore"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Firebase Cloud</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden lg:block">
                Catatan Perawatan & Pengingat Servis Rutin
              </p>
            </div>
          </div>

          {/* Motorcycle Profile Switcher Button */}
          <div className="relative flex-1 sm:flex-none flex justify-center sm:justify-start max-w-[190px] sm:max-w-none">
            <button
              onClick={handleMotorClick}
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-left transition shadow-sm group w-full sm:w-auto"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-[11px] sm:text-xs border border-amber-500/30 flex-shrink-0">
                {activeMotor?.name?.slice(0, 1) || 'M'}
              </div>
              <div className="max-w-[95px] sm:max-w-[170px] truncate">
                <div className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-amber-300">
                  {activeMotor?.name || 'Pilih Motor'}
                </div>
                <div className="text-[9px] sm:text-[10px] text-slate-400 font-mono flex items-center gap-1 truncate">
                  <span>{activeMotor?.plateNumber}</span>
                  <span className="hidden sm:inline text-slate-600">•</span>
                  <span className="hidden sm:inline">{activeMotor?.currentOdometer.toLocaleString('id-ID')} km</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform flex-shrink-0 ml-auto" />
            </button>

            {/* Desktop Dropdown Menu */}
            {showMotorDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMotorDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Garasi Motor Anda</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-normal">
                      {motorcycles.length} Unit
                    </span>
                  </div>

                  <div className="space-y-1 mt-1 max-h-60 overflow-y-auto">
                    {motorcycles.map((motor) => {
                      const isSelected = motor.id === activeMotorId;
                      const motorAlerts = allAlerts.filter((a) => a.motorId === motor.id);
                      return (
                        <button
                          key={motor.id}
                          onClick={() => {
                            setActiveMotorId(motor.id);
                            setShowMotorDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                            isSelected
                              ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                              : 'hover:bg-slate-800/70 text-slate-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="truncate">{motor.name}</span>
                              {isSelected && (
                                <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {motor.plateNumber} • {motor.currentOdometer.toLocaleString('id-ID')} km
                            </div>
                          </div>
                          {motorAlerts.length > 0 && (
                            <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              {motorAlerts.length} Servis
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-800 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowMotorDropdown(false);
                        onOpenAddMotor();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-amber-400 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Motor Baru
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Quick KM Update */}
            <button
              onClick={onOpenQuickKm}
              title="Update Cepat Odometer (KM)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
            >
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Update KM</span>
              <span className="sm:hidden text-[11px] font-bold text-amber-400">KM</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition"
              title="Notifikasi Pengingat Servis"
            >
              <Bell className="w-4 h-4" />
              {urgentCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                  {urgentCount}
                </span>
              )}
            </button>

            {/* Panduan Masalah Motor (Desktop/Tablet) */}
            <button
              onClick={onOpenTroubleshooting}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition hidden md:flex items-center gap-1.5 text-xs font-medium"
              title="Panduan Masalah & Gejala Kerusakan"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Diagnosa</span>
            </button>

            {/* Cetak & Backup (Desktop/Tablet) */}
            <button
              onClick={onOpenPrint}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition hidden sm:flex items-center"
              title="Cetak Buku Servis / Export Backup"
            >
              <Printer className="w-4 h-4 text-slate-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
