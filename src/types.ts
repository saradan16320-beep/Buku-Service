export type MotorcycleType = 'matic' | 'manual' | 'bebek' | 'sport';

export interface Motorcycle {
  id: string;
  userId?: string;
  name: string; // e.g. Honda Vario 160 CBS
  plateNumber: string; // e.g. B 4821 KTF
  year: number;
  type: MotorcycleType;
  engineCc: number; // e.g. 160
  currentOdometer: number; // in KM e.g. 15420
  avgKmPerDay: number; // e.g. 25
  color: string;
  image?: string;
  notes?: string;
  createdAt: string;
}

export type ServiceCategory =
  | 'oli_mesin'
  | 'oli_gardan'
  | 'servis_cvt_rantai'
  | 'busi'
  | 'filter_udara'
  | 'radiator_coolant'
  | 'kampas_rem'
  | 'minyak_rem'
  | 'aki'
  | 'ban'
  | 'tune_up'
  | 'kustom';

export interface ServiceReminder {
  id: string;
  userId?: string;
  motorId: string;
  title: string;
  category: ServiceCategory;
  intervalKm: number;
  intervalMonths: number;
  lastServicedKm: number;
  lastServicedDate: string; // YYYY-MM-DD
  notes?: string;
  isCustom?: boolean;
}

export type ServiceType =
  | 'rutin'
  | 'perbaikan'
  | 'modifikasi'
  | 'ganti_ban'
  | 'kelistrikan'
  | 'turun_mesin';

export interface ServiceRecord {
  id: string;
  userId?: string;
  motorId: string;
  date: string; // YYYY-MM-DD
  odometer: number;
  workshopName: string; // e.g. Bengkel Resmi AHASS
  serviceType: ServiceType;
  tasksCompleted: string[]; // e.g. ["Ganti Oli Mesin", "Ganti Oli Gardan"]
  costParts: number;
  costLabor: number;
  totalCost: number;
  mechanicNotes?: string;
  warrantyDays?: number;
  receiptImage?: string; // base64 / data url
  createdAt: string;
}

export type ReminderStatus = 'overdue' | 'urgent' | 'warning' | 'good';

export interface ComputedReminder extends ServiceReminder {
  nextDueKm: number;
  remainingKm: number;
  estimatedDueDate: string;
  remainingDays: number;
  status: ReminderStatus;
  percentageUsed: number;
}

export interface TroubleshootingTopic {
  id: string;
  title: string;
  category: 'mesin' | 'cvt_transmisi' | 'pengereman' | 'kelistrikan' | 'kaki_kaki';
  symptoms: string[];
  possibleCauses: string[];
  recommendedSolutions: string[];
  urgencyLevel: 'tinggi' | 'sedang' | 'rendah';
}
