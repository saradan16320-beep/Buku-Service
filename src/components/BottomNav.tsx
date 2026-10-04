import React from 'react';
import { useMotor } from '../context/MotorContext';
import { checkAllDueReminders } from '../utils/notifications';
import {
  Clock,
  History,
  Wallet,
  Plus,
  Bike,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'reminders' | 'history' | 'costs';
  onChangeTab: (tab: 'reminders' | 'history' | 'costs') => void;
  onOpenAddService: () => void;
  onOpenGarage: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddService,
  onOpenGarage,
}) => {
  const { activeMotor, motorcycles, reminders } = useMotor();

  const allAlerts = checkAllDueReminders(motorcycles, reminders);
  const activeAlerts = allAlerts.filter((a) => a.motorId === activeMotor?.id);
  const hasDue = activeAlerts.length > 0;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* Tab 1: Pengingat Servis */}
        <button
          onClick={() => onChangeTab('reminders')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] relative ${
            activeTab === 'reminders'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Clock className={`w-5 h-5 ${activeTab === 'reminders' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {hasDue && (
              <span className="absolute -top-0.5 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Pengingat</span>
        </button>

        {/* Tab 2: Riwayat Servis */}
        <button
          onClick={() => onChangeTab('history')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] ${
            activeTab === 'history'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Riwayat</span>
        </button>

        {/* Center Prominent Action Button: + Catat Servis */}
        <div className="flex flex-col items-center -mt-5">
          <button
            onClick={onOpenAddService}
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 active:scale-95 transition-transform border-4 border-slate-950"
            title="Catat Servis Baru"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
          <span className="text-[9px] font-black text-amber-400 mt-1 uppercase tracking-wider">
            + Servis
          </span>
        </div>

        {/* Tab 3: Biaya & Pengeluaran */}
        <button
          onClick={() => onChangeTab('costs')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] ${
            activeTab === 'costs'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className={`w-5 h-5 ${activeTab === 'costs' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-1 tracking-tight">Biaya</span>
        </button>

        {/* Tab 4: Garasi Motor */}
        <button
          onClick={onOpenGarage}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition min-w-[56px] text-slate-400 hover:text-slate-200 relative"
        >
          <div className="relative">
            <Bike className="w-5 h-5 stroke-2" />
            <span className="absolute -top-1 -right-2 text-[9px] font-extrabold px-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {motorcycles.length}
            </span>
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Garasi</span>
        </button>
      </div>
    </nav>
  );
};
