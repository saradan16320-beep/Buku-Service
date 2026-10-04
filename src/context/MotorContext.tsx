import React, { createContext, useContext, useEffect, useState } from 'react';
import { Motorcycle, ServiceRecord, ServiceReminder } from '../types';
import { INITIAL_MOTORCYCLES, INITIAL_REMINDERS, INITIAL_SERVICE_RECORDS } from '../data/initialData';
import { DEFAULT_SERVICE_TEMPLATES } from '../data/serviceTemplates';
import {
  auth,
  db,
  signInAnonymously,
  onAuthStateChanged,
  User,
} from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  writeBatch,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  MOTORCYCLES: 'buku_servis_motorcycles_v2',
  REMINDERS: 'buku_servis_reminders_v2',
  RECORDS: 'buku_servis_records_v2',
  ACTIVE_ID: 'buku_servis_active_motor_id_v2',
};

// Helper: Firestore rejects any object containing `undefined` values.
// This function strips undefined values so writes never crash.
function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

interface MotorContextType {
  motorcycles: Motorcycle[];
  activeMotor: Motorcycle | undefined;
  activeMotorId: string;
  reminders: ServiceReminder[];
  activeReminders: ServiceReminder[];
  records: ServiceRecord[];
  activeRecords: ServiceRecord[];
  isFirebaseConnected: boolean;
  isSyncing: boolean;
  user: User | null;
  setActiveMotorId: (id: string) => void;
  addMotorcycle: (motor: Omit<Motorcycle, 'id' | 'createdAt'>) => string;
  updateMotorcycle: (id: string, updates: Partial<Motorcycle>) => void;
  deleteMotorcycle: (id: string) => void;
  updateOdometer: (motorId: string, newKm: number) => void;
  addServiceRecord: (
    record: Omit<ServiceRecord, 'id' | 'createdAt'>,
    autoUpdateReminderIds?: string[]
  ) => void;
  updateServiceRecord: (id: string, updates: Partial<ServiceRecord>) => void;
  deleteServiceRecord: (id: string) => void;
  addReminder: (reminder: Omit<ServiceReminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<ServiceReminder>) => void;
  deleteReminder: (id: string) => void;
  markReminderDone: (reminderId: string, servicedKm: number, dateStr: string) => void;
  initDefaultRemindersForMotor: (motorId: string, motorType: string, currentKm: number) => void;
  resetAllData: () => void;
  exportBackup: () => string;
  importBackup: (jsonString: string) => boolean;
}

const MotorContext = createContext<MotorContextType | null>(null);

export const MotorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(!!auth.currentUser);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Local state initialized empty (no dummy data)
  const [motorcycles, setMotorcycles] = useState<Motorcycle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOTORCYCLES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter((m: Motorcycle) => m.id !== 'motor-1' && m.id !== 'motor-2');
      }
    } catch (e) {
      console.error('Error loading motorcycles', e);
    }
    return [];
  });

  const [activeMotorId, setActiveMotorId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
      if (saved && saved !== 'motor-1' && saved !== 'motor-2') return saved;
    } catch (e) {
      console.error('Error loading active motor id', e);
    }
    return '';
  });

  const [reminders, setReminders] = useState<ServiceReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (r: ServiceReminder) => !r.id.startsWith('rem-1-') && !r.id.startsWith('rem-2-')
        );
      }
    } catch (e) {
      console.error('Error loading reminders', e);
    }
    return [];
  });

  const [records, setRecords] = useState<ServiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (rec: ServiceRecord) => !rec.id.startsWith('rec-1-') && !rec.id.startsWith('rec-2-')
        );
      }
    } catch (e) {
      console.error('Error loading records', e);
    }
    return [];
  });

  // Keep local storage synchronized
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTORCYCLES, JSON.stringify(motorcycles));
  }, [motorcycles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, activeMotorId);
  }, [activeMotorId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }, [records]);

  // Authenticate with Firebase immediately
  useEffect(() => {
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setIsFirebaseConnected(true);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsFirebaseConnected(true);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          setUser(cred.user);
          setIsFirebaseConnected(true);
        } catch (err) {
          console.warn('Firebase Anonymous Auth failed, operating in offline mode:', err);
          setIsFirebaseConnected(false);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync with Firestore collections when user is authenticated
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);
    const userId = user.uid;

    // 1. Listen to Motorcycles & purge any legacy dummy entries
    const motorCol = collection(db, 'users', userId, 'motorcycles');
    const unsubMotor = onSnapshot(
      query(motorCol),
      (snapshot) => {
        const list: Motorcycle[] = [];
        snapshot.forEach((d) => {
          if (d.id === 'motor-1' || d.id === 'motor-2') {
            deleteDoc(doc(db, 'users', userId, 'motorcycles', d.id)).catch(() => {});
          } else {
            list.push(d.data() as Motorcycle);
          }
        });

        setMotorcycles(list);
        if (list.length > 0) {
          setActiveMotorId((prev) => {
            if (!prev || !list.some((m) => m.id === prev)) {
              return list[0].id;
            }
            return prev;
          });
        } else {
          setActiveMotorId('');
        }
        setIsSyncing(false);
      },
      (err) => {
        console.error('Firestore motorcycle snapshot error:', err);
        setIsSyncing(false);
      }
    );

    // 2. Listen to Reminders & purge dummy reminders
    const reminderCol = collection(db, 'users', userId, 'reminders');
    const unsubReminders = onSnapshot(
      query(reminderCol),
      (snapshot) => {
        const list: ServiceReminder[] = [];
        snapshot.forEach((d) => {
          if (
            d.id.startsWith('rem-1-') ||
            d.id.startsWith('rem-2-') ||
            d.data().motorId === 'motor-1' ||
            d.data().motorId === 'motor-2'
          ) {
            deleteDoc(doc(db, 'users', userId, 'reminders', d.id)).catch(() => {});
          } else {
            list.push(d.data() as ServiceReminder);
          }
        });
        setReminders(list);
      },
      (err) => {
        console.error('Firestore reminders snapshot error:', err);
      }
    );

    // 3. Listen to Records & purge dummy records
    const recordsCol = collection(db, 'users', userId, 'records');
    const unsubRecords = onSnapshot(
      query(recordsCol),
      (snapshot) => {
        const list: ServiceRecord[] = [];
        snapshot.forEach((d) => {
          if (
            d.id.startsWith('rec-1-') ||
            d.id.startsWith('rec-2-') ||
            d.data().motorId === 'motor-1' ||
            d.data().motorId === 'motor-2'
          ) {
            deleteDoc(doc(db, 'users', userId, 'records', d.id)).catch(() => {});
          } else {
            list.push(d.data() as ServiceRecord);
          }
        });
        setRecords(list);
      },
      (err) => {
        console.error('Firestore records snapshot error:', err);
      }
    );

    return () => {
      unsubMotor();
      unsubReminders();
      unsubRecords();
    };
  }, [user]);

  // Derived state for currently active motor
  const activeMotor =
    motorcycles.find((m) => m.id === activeMotorId) || (motorcycles.length > 0 ? motorcycles[0] : undefined);
  const activeReminders = activeMotor ? reminders.filter((r) => r.motorId === activeMotor.id) : [];
  const activeRecords = activeMotor
    ? records
        .filter((rec) => rec.motorId === activeMotor.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.odometer - a.odometer)
    : [];

  // Initialize standard manufacturer service reminders for a motorcycle
  const initDefaultRemindersForMotor = (motorId: string, motorType: string, currentKm: number) => {
    const today = new Date().toISOString().split('T')[0];
    const targetUserId = user?.uid || auth.currentUser?.uid;

    const newReminders: ServiceReminder[] = DEFAULT_SERVICE_TEMPLATES.filter((tpl) =>
      tpl.appliesTo.includes(motorType as any)
    ).map((tpl, idx) => {
      const rem: ServiceReminder = {
        id: `rem-${motorId}-${idx + 1}-${Date.now()}`,
        motorId,
        title: tpl.title,
        category: tpl.category,
        intervalKm: tpl.defaultIntervalKm,
        intervalMonths: tpl.defaultIntervalMonths,
        lastServicedKm: currentKm,
        lastServicedDate: today,
        notes: tpl.description || '',
        isCustom: false,
      };
      if (targetUserId) {
        rem.userId = targetUserId;
      }
      return rem;
    });

    setReminders((prev) => [...prev, ...newReminders]);

    if (targetUserId) {
      newReminders.forEach((r) => {
        const payload = cleanForFirestore({ ...r, userId: targetUserId });
        setDoc(doc(db, 'users', targetUserId, 'reminders', r.id), payload).catch((e) =>
          console.error('Error adding reminder to Firestore:', e)
        );
      });
    }
  };

  const addMotorcycle = (motorData: Omit<Motorcycle, 'id' | 'createdAt'>): string => {
    const newId = `motor-${Date.now()}`;
    const targetUserId = user?.uid || auth.currentUser?.uid;

    const newMotor: Motorcycle = {
      ...motorData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    if (targetUserId) {
      newMotor.userId = targetUserId;
    }

    setMotorcycles((prev) => [...prev, newMotor]);
    setActiveMotorId(newId);

    // Save to Firestore
    if (targetUserId) {
      const payload = cleanForFirestore({ ...newMotor, userId: targetUserId });
      setDoc(doc(db, 'users', targetUserId, 'motorcycles', newId), payload).catch((e) =>
        console.error('Error saving motor to Firestore:', e)
      );
    }

    // Auto seed recommended maintenance intervals based on bike type
    initDefaultRemindersForMotor(newId, motorData.type, motorData.currentOdometer);

    return newId;
  };

  const updateMotorcycle = (id: string, updates: Partial<Motorcycle>) => {
    const targetUserId = user?.uid || auth.currentUser?.uid;
    setMotorcycles((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    if (targetUserId) {
      const payload = cleanForFirestore(updates);
      updateDoc(doc(db, 'users', targetUserId, 'motorcycles', id), payload).catch((e) =>
        console.error('Error updating motor in Firestore:', e)
      );
    }
  };

  const deleteMotorcycle = (id: string) => {
    const targetUserId = user?.uid || auth.currentUser?.uid;
    const remaining = motorcycles.filter((m) => m.id !== id);
    setMotorcycles(remaining);
    setReminders((prev) => prev.filter((r) => r.motorId !== id));
    setRecords((prev) => prev.filter((r) => r.motorId !== id));

    if (activeMotorId === id) {
      setActiveMotorId(remaining[0]?.id || '');
    }

    if (targetUserId) {
      deleteDoc(doc(db, 'users', targetUserId, 'motorcycles', id)).catch((e) =>
        console.error('Error deleting motor from Firestore:', e)
      );
    }
  };

  const updateOdometer = (motorId: string, newKm: number) => {
    if (newKm < 0) return;
    const targetUserId = user?.uid || auth.currentUser?.uid;

    setMotorcycles((prev) =>
      prev.map((m) => (m.id === motorId ? { ...m, currentOdometer: newKm } : m))
    );

    if (targetUserId) {
      updateDoc(doc(db, 'users', targetUserId, 'motorcycles', motorId), {
        currentOdometer: newKm,
      }).catch((e) => console.error('Error updating odometer in Firestore:', e));
    }
  };

  const addServiceRecord = (
    recordData: Omit<ServiceRecord, 'id' | 'createdAt'>,
    autoUpdateReminderIds?: string[]
  ) => {
    const newRecordId = `rec-${Date.now()}`;
    const targetUserId = user?.uid || auth.currentUser?.uid;

    const newRecord: ServiceRecord = {
      ...recordData,
      id: newRecordId,
      createdAt: new Date().toISOString(),
    };
    if (targetUserId) {
      newRecord.userId = targetUserId;
    }

    setRecords((prev) => [newRecord, ...prev]);

    if (targetUserId) {
      const payload = cleanForFirestore({ ...newRecord, userId: targetUserId });
      setDoc(doc(db, 'users', targetUserId, 'records', newRecordId), payload).catch((e) =>
        console.error('Error saving record to Firestore:', e)
      );
    }

    // If recorded KM is greater than current motor odometer, bump it!
    const targetMotor = motorcycles.find((m) => m.id === recordData.motorId);
    if (targetMotor && recordData.odometer > targetMotor.currentOdometer) {
      updateOdometer(recordData.motorId, recordData.odometer);
    }

    // Automatically update corresponding reminders
    if (autoUpdateReminderIds && autoUpdateReminderIds.length > 0) {
      setReminders((prev) =>
        prev.map((rem) => {
          if (autoUpdateReminderIds.includes(rem.id)) {
            const updated = {
              ...rem,
              lastServicedKm: recordData.odometer,
              lastServicedDate: recordData.date,
            };
            if (targetUserId) {
              updateDoc(doc(db, 'users', targetUserId, 'reminders', rem.id), {
                lastServicedKm: recordData.odometer,
                lastServicedDate: recordData.date,
              }).catch((e) => console.error('Error updating reminder in Firestore:', e));
            }
            return updated;
          }
          return rem;
        })
      );
    }
  };

  const updateServiceRecord = (id: string, updates: Partial<ServiceRecord>) => {
    const targetUserId = user?.uid || auth.currentUser?.uid;

    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );

    if (targetUserId) {
      const payload = cleanForFirestore(updates);
      updateDoc(doc(db, 'users', targetUserId, 'records', id), payload).catch((e) =>
        console.error('Error updating record in Firestore:', e)
      );
    }
  };

  const deleteServiceRecord = (id: string) => {
    const targetUserId = user?.uid || auth.currentUser?.uid;

    setRecords((prev) => prev.filter((r) => r.id !== id));

    if (targetUserId) {
      deleteDoc(doc(db, 'users', targetUserId, 'records', id)).catch((e) =>
        console.error('Error deleting record from Firestore:', e)
      );
    }
  };

  const addReminder = (reminderData: Omit<ServiceReminder, 'id'>) => {
    const newReminderId = `rem-custom-${Date.now()}`;
    const targetUserId = user?.uid || auth.currentUser?.uid;

    const newReminder: ServiceReminder = {
      ...reminderData,
      id: newReminderId,
    };
    if (targetUserId) {
      newReminder.userId = targetUserId;
    }

    setReminders((prev) => [...prev, newReminder]);

    if (targetUserId) {
      const payload = cleanForFirestore({ ...newReminder, userId: targetUserId });
      setDoc(doc(db, 'users', targetUserId, 'reminders', newReminderId), payload).catch(
        (e) => console.error('Error adding reminder to Firestore:', e)
      );
    }
  };

  const updateReminder = (id: string, updates: Partial<ServiceReminder>) => {
    const targetUserId = user?.uid || auth.currentUser?.uid;

    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );

    if (targetUserId) {
      const payload = cleanForFirestore(updates);
      updateDoc(doc(db, 'users', targetUserId, 'reminders', id), payload).catch((e) =>
        console.error('Error updating reminder in Firestore:', e)
      );
    }
  };

  const deleteReminder = (id: string) => {
    const targetUserId = user?.uid || auth.currentUser?.uid;

    setReminders((prev) => prev.filter((r) => r.id !== id));

    if (targetUserId) {
      deleteDoc(doc(db, 'users', targetUserId, 'reminders', id)).catch((e) =>
        console.error('Error deleting reminder from Firestore:', e)
      );
    }
  };

  const markReminderDone = (reminderId: string, servicedKm: number, dateStr: string) => {
    const targetUserId = user?.uid || auth.currentUser?.uid;

    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminderId
          ? {
              ...r,
              lastServicedKm: servicedKm,
              lastServicedDate: dateStr,
            }
          : r
      )
    );

    if (targetUserId) {
      updateDoc(doc(db, 'users', targetUserId, 'reminders', reminderId), {
        lastServicedKm: servicedKm,
        lastServicedDate: dateStr,
      }).catch((e) => console.error('Error marking reminder done in Firestore:', e));
    }

    const targetReminder = reminders.find((r) => r.id === reminderId);
    if (targetReminder) {
      const targetMotor = motorcycles.find((m) => m.id === targetReminder.motorId);
      if (targetMotor && servicedKm > targetMotor.currentOdometer) {
        updateOdometer(targetMotor.id, servicedKm);
      }
    }
  };

  const resetAllData = async () => {
    const targetUserId = user?.uid || auth.currentUser?.uid;

    if (targetUserId) {
      try {
        const batch = writeBatch(db);
        motorcycles.forEach((m) => {
          batch.delete(doc(db, 'users', targetUserId, 'motorcycles', m.id));
        });
        reminders.forEach((r) => {
          batch.delete(doc(db, 'users', targetUserId, 'reminders', r.id));
        });
        records.forEach((rec) => {
          batch.delete(doc(db, 'users', targetUserId, 'records', rec.id));
        });
        await batch.commit();
      } catch (e) {
        console.error('Error clearing Firestore data:', e);
      }
    }

    setMotorcycles([]);
    setReminders([]);
    setRecords([]);
    setActiveMotorId('');
    localStorage.clear();
  };

  const exportBackup = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      motorcycles,
      reminders,
      records,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackup = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.motorcycles && Array.isArray(parsed.motorcycles)) {
        setMotorcycles(parsed.motorcycles);
        if (parsed.reminders && Array.isArray(parsed.reminders)) {
          setReminders(parsed.reminders);
        }
        if (parsed.records && Array.isArray(parsed.records)) {
          setRecords(parsed.records);
        }
        if (parsed.motorcycles[0]?.id) {
          setActiveMotorId(parsed.motorcycles[0].id);
        }

        const targetUserId = user?.uid || auth.currentUser?.uid;
        if (targetUserId) {
          const batch = writeBatch(db);
          parsed.motorcycles.forEach((m: Motorcycle) => {
            const payload = cleanForFirestore({ ...m, userId: targetUserId });
            batch.set(doc(db, 'users', targetUserId, 'motorcycles', m.id), payload);
          });
          if (Array.isArray(parsed.reminders)) {
            parsed.reminders.forEach((r: ServiceReminder) => {
              const payload = cleanForFirestore({ ...r, userId: targetUserId });
              batch.set(doc(db, 'users', targetUserId, 'reminders', r.id), payload);
            });
          }
          if (Array.isArray(parsed.records)) {
            parsed.records.forEach((rec: ServiceRecord) => {
              const payload = cleanForFirestore({ ...rec, userId: targetUserId });
              batch.set(doc(db, 'users', targetUserId, 'records', rec.id), payload);
            });
          }
          batch.commit().catch((e) => console.error('Error importing to Firestore:', e));
        }

        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  return (
    <MotorContext.Provider
      value={{
        motorcycles,
        activeMotor,
        activeMotorId,
        reminders,
        activeReminders,
        records,
        activeRecords,
        isFirebaseConnected,
        isSyncing,
        user,
        setActiveMotorId,
        addMotorcycle,
        updateMotorcycle,
        deleteMotorcycle,
        updateOdometer,
        addServiceRecord,
        updateServiceRecord,
        deleteServiceRecord,
        addReminder,
        updateReminder,
        deleteReminder,
        markReminderDone,
        initDefaultRemindersForMotor,
        resetAllData,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </MotorContext.Provider>
  );
};

export function useMotor() {
  const context = useContext(MotorContext);
  if (!context) {
    throw new Error('useMotor must be used within a MotorProvider');
  }
  return context;
}
