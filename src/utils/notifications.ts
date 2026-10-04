import { Motorcycle, ServiceReminder } from '../types';
import { computeReminder } from './formatters';

export interface MotorAlert {
  id: string;
  motorId: string;
  motorName: string;
  plateNumber: string;
  reminderTitle: string;
  status: 'overdue' | 'urgent' | 'warning';
  remainingKm: number;
  remainingDays: number;
  message: string;
}

export function checkAllDueReminders(
  motorcycles: Motorcycle[],
  reminders: ServiceReminder[]
): MotorAlert[] {
  const alerts: MotorAlert[] = [];

  for (const motor of motorcycles) {
    const motorReminders = reminders.filter((r) => r.motorId === motor.id);
    for (const rem of motorReminders) {
      const computed = computeReminder(rem, motor);
      if (computed.status === 'overdue') {
        alerts.push({
          id: `${motor.id}-${rem.id}`,
          motorId: motor.id,
          motorName: motor.name,
          plateNumber: motor.plateNumber,
          reminderTitle: rem.title,
          status: 'overdue',
          remainingKm: computed.remainingKm,
          remainingDays: computed.remainingDays,
          message:
            computed.remainingKm <= 0
              ? `Sudah melewati batas servis sejauh ${Math.abs(computed.remainingKm).toLocaleString('id-ID')} km!`
              : `Jadwal tanggal servis sudah terlewati (${Math.abs(computed.remainingDays)} hari lalu)!`,
        });
      } else if (computed.status === 'urgent') {
        alerts.push({
          id: `${motor.id}-${rem.id}`,
          motorId: motor.id,
          motorName: motor.name,
          plateNumber: motor.plateNumber,
          reminderTitle: rem.title,
          status: 'urgent',
          remainingKm: computed.remainingKm,
          remainingDays: computed.remainingDays,
          message: `Segera lakukan servis! Sisa ${computed.remainingKm.toLocaleString('id-ID')} km atau ${computed.remainingDays} hari lagi.`,
        });
      }
    }
  }

  return alerts;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return await Notification.requestPermission();
  } catch (e) {
    console.error('Error requesting notification permission:', e);
    return 'denied';
  }
}

export function sendBrowserNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=128&auto=format&fit=crop&q=80',
        badge: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=96&auto=format&fit=crop&q=80',
        ...options,
      });
      return true;
    } catch (e) {
      console.warn('Browser push notification could not be created (iframe or permission context):', e);
      return false;
    }
  }
  return false;
}
