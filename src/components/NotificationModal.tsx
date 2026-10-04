import React, { useState, useEffect } from 'react';
import { useMotor } from '../context/MotorContext';
import {
  checkAllDueReminders,
  requestNotificationPermission,
  sendBrowserNotification,
} from '../utils/notifications';
import {
  X,
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Bike,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMotor: (motorId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectMotor,
}) => {
  const { motorcycles, reminders } = useMotor();
  const [permission, setPermission] = useState<string>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    } else {
      setPermission('unsupported');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const alerts = checkAllDueReminders(motorcycles, reminders);

  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification('Notifikasi Servis Motor Aktif!', {
        body: 'Anda akan menerima pengingat saat KM atau tanggal servis motor Anda jatuh tempo.',
      });
    }
  };

  const handleSendTestNotification = () => {
    const success = sendBrowserNotification('Pengingat Servis Motor: Honda Vario', {
      body: 'Waktunya Ganti Oli Mesin! Sisa 150 km lagi sebelum batas maksimum.',
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Pusat Notifikasi & Pengingat
              </h2>
              <p className="text-xs text-slate-400">
                Peringatan dini servis berkala seluruh motor di garasi Anda.
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

        {/* Push Notification Permission Box */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Push Notifikasi Browser</span>
              {permission === 'granted' ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Aktif
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Belum Aktif
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Kirim peringatan ke layar perangkat saat motor mendekati jadwal servis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {permission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-sm"
              >
                Aktifkan Izin
              </button>
            )}

            <button
              onClick={handleSendTestNotification}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            >
              <Send className="w-3 h-3 text-cyan-400" />
              <span>{testSent ? 'Terkirim!' : 'Tes Notifikasi'}</span>
            </button>
          </div>
        </div>

        {/* List of Active Alerts Across All Registered Motorcycles */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Daftar Servis Yang Jatuh Tempo ({alerts.length})
            </h3>
            <span className="text-[11px] text-slate-500">Semua Motor</span>
          </div>

          {alerts.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-white">Semua Motor Berstatus Prima!</div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Tidak ada jadwal servis yang lewat batas atau mendesak saat ini. Terus pantau dan perbarui odometer secara berkala.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {alerts.map((alert) => {
                const isOverdue = alert.status === 'overdue';
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 transition ${
                      isOverdue
                        ? 'bg-red-950/20 border-red-500/40'
                        : 'bg-orange-950/20 border-orange-500/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">
                          {alert.motorName}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                          {alert.plateNumber}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                            isOverdue
                              ? 'bg-red-500 text-white'
                              : 'bg-orange-500 text-slate-950'
                          }`}
                        >
                          {isOverdue ? 'Lewat Batas' : 'Mendesak'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-amber-300">
                        {alert.reminderTitle}
                      </div>

                      <p className="text-[11px] text-slate-300">
                        {alert.message}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onSelectMotor(alert.motorId);
                        onClose();
                      }}
                      className="flex-shrink-0 text-xs font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 transition"
                    >
                      Buka Motor
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
