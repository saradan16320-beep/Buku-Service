import React, { useState } from 'react';
import { MotorProvider, useMotor } from './context/MotorContext';
import { Header } from './components/Header';
import { MotorcycleProfileCard } from './components/MotorcycleProfileCard';
import { ServiceRemindersSection } from './components/ServiceRemindersSection';
import { ServiceHistorySection } from './components/ServiceHistorySection';
import { CostSummarySection } from './components/CostSummarySection';
import { AddServiceModal } from './components/AddServiceModal';
import { AddMotorModal } from './components/AddMotorModal';
import { AddReminderModal } from './components/AddReminderModal';
import { QuickKmModal } from './components/QuickKmModal';
import { NotificationModal } from './components/NotificationModal';
import { TroubleshootingModal } from './components/TroubleshootingModal';
import { PrintReportModal } from './components/PrintReportModal';
import { BottomNav } from './components/BottomNav';
import { GarageDrawer } from './components/GarageDrawer';
import { checkAllDueReminders } from './utils/notifications';
import { ServiceReminder, Motorcycle, ServiceRecord } from './types';
import {
  Clock,
  History,
  Wallet,
  AlertTriangle,
  ArrowRight,
  Bell,
  Sparkles,
  BookOpen,
  Bike,
  Plus,
} from 'lucide-react';

function MotorAppContent() {
  const { motorcycles, activeMotor, reminders, setActiveMotorId } = useMotor();

  // Navigation tab for active motorcycle
  const [activeTab, setActiveTab] = useState<'reminders' | 'history' | 'costs'>('reminders');

  // Modal states
  const [showAddService, setShowAddService] = useState(false);
  const [showAddMotor, setShowAddMotor] = useState(false);
  const [editingMotor, setEditingMotor] = useState<Motorcycle | null>(null);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [showQuickKm, setShowQuickKm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showGarageDrawer, setShowGarageDrawer] = useState(false);
  const [preselectedReminder, setPreselectedReminder] = useState<ServiceReminder | null>(null);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);

  const allAlerts = checkAllDueReminders(motorcycles, reminders);
  const currentMotorAlerts = allAlerts.filter((a) => a.motorId === activeMotor?.id);

  const handleQuickRecordService = (reminder: ServiceReminder) => {
    setEditingRecord(null);
    setPreselectedReminder(reminder);
    setShowAddService(true);
  };

  const handleOpenAddService = () => {
    if (motorcycles.length === 0) {
      handleOpenNewMotor();
      return;
    }
    setEditingRecord(null);
    setPreselectedReminder(null);
    setShowAddService(true);
  };

  const handleOpenEditService = (record: ServiceRecord) => {
    setEditingRecord(record);
    setShowAddService(true);
  };

  const handleOpenQuickKm = () => {
    if (motorcycles.length === 0) {
      handleOpenNewMotor();
      return;
    }
    setShowQuickKm(true);
  };

  const handleOpenAddReminder = () => {
    if (motorcycles.length === 0) {
      handleOpenNewMotor();
      return;
    }
    setShowAddReminder(true);
  };

  const handleOpenEditMotor = () => {
    if (activeMotor) {
      setEditingMotor(activeMotor);
      setShowAddMotor(true);
    }
  };

  const handleOpenNewMotor = () => {
    setEditingMotor(null);
    setShowAddMotor(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Header
        onOpenAddMotor={handleOpenNewMotor}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenTroubleshooting={() => setShowTroubleshooting(true)}
        onOpenPrint={() => setShowPrint(true)}
        onOpenQuickKm={handleOpenQuickKm}
        onOpenGarage={() => setShowGarageDrawer(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-28 sm:pb-12">
        {/* Urgent Alert Banner (if any due reminders exist for current bike) */}
        {currentMotorAlerts.length > 0 && (
          <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-red-950/40 border border-red-500/40 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-red-950/30">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <span>Peringatan Servis {activeMotor?.name}!</span>
                  <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded-full font-bold">
                    {currentMotorAlerts.length} Perlu Servis
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-1">
                  {currentMotorAlerts[0]?.reminderTitle}: {currentMotorAlerts[0]?.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setShowNotifications(true)}
                className="text-xs font-semibold text-slate-300 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
              >
                Detail
              </button>
              <button
                onClick={handleOpenAddService}
                className="text-xs font-bold text-slate-950 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 transition shadow-sm"
              >
                Servis Sekarang
              </button>
            </div>
          </div>
        )}

        {motorcycles.length === 0 ? (
          /* Empty Garage State */
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 text-center max-w-2xl mx-auto my-6 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/10">
              <Bike className="w-9 h-9 stroke-[2.2]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Garasi Motor Masih Kosong
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Belum ada motor terdaftar. Daftarkan motor Anda untuk mulai memantau jadwal ganti oli, servis CVT, kampas rem, serta pembukuan biaya bengkel.
            </p>

            <div className="mt-6 flex justify-center">
              <button
                onClick={handleOpenNewMotor}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Motor Pertama Anda</span>
              </button>
            </div>

            {/* Quick feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8 pt-8 border-t border-slate-800/80 text-left">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-amber-400 text-xs font-bold block mb-1">⏱️ Pengingat Otomatis</span>
                <span className="text-[11px] text-slate-400">Jadwal standar pabrik langsung aktif sesuai tipe motor Anda.</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-emerald-400 text-xs font-bold block mb-1">🧾 Catatan Biaya</span>
                <span className="text-[11px] text-slate-400">Rincian sparepart, jasa, dan arsip foto nota kasir.</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-cyan-400 text-xs font-bold block mb-1">☁️ Firebase Cloud</span>
                <span className="text-[11px] text-slate-400">Tersimpan aman & tersinkronisasi otomatis di Firestore.</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Active Motorcycle Profile Card */}
            <MotorcycleProfileCard
              onOpenAddService={handleOpenAddService}
              onOpenAddReminder={handleOpenAddReminder}
              onOpenEditMotor={handleOpenEditMotor}
              onOpenQuickKm={handleOpenQuickKm}
            />

            {/* Tab Navigation for Active Motorcycle (sticky & touch-friendly on mobile & desktop) */}
            <div className="flex border-b border-slate-800 gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('reminders')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap -mb-px ${
                  activeTab === 'reminders'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pengingat Servis</span>
                {currentMotorAlerts.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap -mb-px ${
                  activeTab === 'history'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Riwayat & Nota</span>
              </button>

              <button
                onClick={() => setActiveTab('costs')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap -mb-px ${
                  activeTab === 'costs'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Biaya Perawatan</span>
              </button>
            </div>

            {/* Main Tab Content */}
            <div className="pt-1 sm:pt-2">
              {activeTab === 'reminders' && (
                <ServiceRemindersSection
                  onOpenAddReminder={handleOpenAddReminder}
                  onOpenAddService={handleOpenAddService}
                  onQuickRecordService={handleQuickRecordService}
                />
              )}

              {activeTab === 'history' && (
                <ServiceHistorySection
                  onOpenAddService={handleOpenAddService}
                  onEditService={handleOpenEditService}
                />
              )}

              {activeTab === 'costs' && <CostSummarySection />}
            </div>
          </>
        )}

        {/* Helpful Tips Bottom Banner */}
        <div className="mt-8 p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Tips Rawat Motor Awet & Irit BBM
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Rutin ganti oli mesin tiap 2.000–3.000 km dan kuras oli gardan matic rasio 2:1 menjaga performa mesin tetap prima.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowTroubleshooting(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 transition whitespace-nowrap self-stretch sm:self-auto justify-center"
          >
            <span>Buka Panduan Diagnosa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => setActiveTab(t)}
        onOpenAddService={handleOpenAddService}
        onOpenGarage={() => setShowGarageDrawer(true)}
      />

      {/* Footer (hidden on small mobile or pushed below bottom bar padding) */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 sm:py-6 text-center text-[11px] sm:text-xs text-slate-500 hidden sm:block">
        <p>Buku Servis Motor Digital • Pengingat Jadwal Perawatan & Riwayat Biaya Bengkel</p>
      </footer>

      {/* Modals & Drawers */}
      <GarageDrawer
        isOpen={showGarageDrawer}
        onClose={() => setShowGarageDrawer(false)}
        onOpenAddMotor={handleOpenNewMotor}
        onOpenTroubleshooting={() => setShowTroubleshooting(true)}
        onOpenPrint={() => setShowPrint(true)}
      />

      <AddMotorModal
        isOpen={showAddMotor}
        onClose={() => {
          setShowAddMotor(false);
          setEditingMotor(null);
        }}
        editingMotor={editingMotor}
      />

      <AddServiceModal
        isOpen={showAddService}
        onClose={() => {
          setShowAddService(false);
          setEditingRecord(null);
        }}
        preselectedReminder={preselectedReminder}
        editingRecord={editingRecord}
        onOpenAddMotor={handleOpenNewMotor}
      />

      <AddReminderModal
        isOpen={showAddReminder}
        onClose={() => setShowAddReminder(false)}
        onOpenAddMotor={handleOpenNewMotor}
      />

      <QuickKmModal
        isOpen={showQuickKm}
        onClose={() => setShowQuickKm(false)}
      />

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSelectMotor={(id) => {
          setActiveMotorId(id);
          setActiveTab('reminders');
        }}
      />

      <TroubleshootingModal
        isOpen={showTroubleshooting}
        onClose={() => setShowTroubleshooting(false)}
      />

      <PrintReportModal
        isOpen={showPrint}
        onClose={() => setShowPrint(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <MotorProvider>
      <MotorAppContent />
    </MotorProvider>
  );
}
