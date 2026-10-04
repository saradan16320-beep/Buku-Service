import { ComputedReminder, Motorcycle, ReminderStatus, ServiceReminder } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatKm(km: number): string {
  return `${new Intl.NumberFormat('id-ID').format(Math.max(0, Math.round(km)))} km`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function computeReminder(
  reminder: ServiceReminder,
  motor: Motorcycle
): ComputedReminder {
  const nextDueKm = reminder.lastServicedKm + reminder.intervalKm;
  const remainingKm = nextDueKm - motor.currentOdometer;

  // Calculate estimated due date by date interval or by daily KM consumption
  const lastDate = new Date(reminder.lastServicedDate || new Date().toISOString().split('T')[0]);
  const dateDueByMonths = new Date(lastDate);
  dateDueByMonths.setMonth(dateDueByMonths.getMonth() + reminder.intervalMonths);

  // If daily KM is specified, calculate days remaining by KM
  const dailyKm = motor.avgKmPerDay > 0 ? motor.avgKmPerDay : 20;
  const daysRemainingByKm = Math.round(remainingKm / dailyKm);

  // Calculate days remaining by calendar date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysRemainingByCalendar = Math.round(
    (dateDueByMonths.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Whichever comes first (km or date) triggers the reminder
  const effectiveRemainingDays = Math.min(daysRemainingByKm, daysRemainingByCalendar);

  // Estimated due date
  const estimatedDate = new Date(today);
  estimatedDate.setDate(estimatedDate.getDate() + effectiveRemainingDays);
  const estimatedDueDate = estimatedDate.toISOString().split('T')[0];

  // Percentage used
  const kmProgress = (motor.currentOdometer - reminder.lastServicedKm) / reminder.intervalKm;
  const percentageUsed = Math.min(100, Math.max(0, Math.round(kmProgress * 100)));

  // Determine status
  let status: ReminderStatus = 'good';
  if (remainingKm <= 0 || effectiveRemainingDays <= 0) {
    status = 'overdue';
  } else if (remainingKm <= 300 || effectiveRemainingDays <= 7) {
    status = 'urgent';
  } else if (remainingKm <= 750 || effectiveRemainingDays <= 21) {
    status = 'warning';
  } else {
    status = 'good';
  }

  return {
    ...reminder,
    nextDueKm,
    remainingKm,
    estimatedDueDate,
    remainingDays: effectiveRemainingDays,
    status,
    percentageUsed,
  };
}

export function getStatusBadge(status: ReminderStatus): {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  dotColor: string;
} {
  switch (status) {
    case 'overdue':
      return {
        label: 'Lewat Batas Servis',
        bgColor: 'bg-red-500/10',
        textColor: 'text-red-400',
        borderColor: 'border-red-500/30',
        dotColor: 'bg-red-500',
      };
    case 'urgent':
      return {
        label: 'Perlu Segera Servis',
        bgColor: 'bg-orange-500/10',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
        dotColor: 'bg-orange-500',
      };
    case 'warning':
      return {
        label: 'Mendekati Jadwal',
        bgColor: 'bg-amber-500/10',
        textColor: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        dotColor: 'bg-amber-400',
      };
    case 'good':
    default:
      return {
        label: 'Kondisi Baik',
        bgColor: 'bg-emerald-500/10',
        textColor: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        dotColor: 'bg-emerald-400',
      };
  }
}
