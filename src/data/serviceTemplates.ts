import { ServiceCategory } from '../types';

export interface DefaultServiceItem {
  category: ServiceCategory;
  title: string;
  defaultIntervalKm: number;
  defaultIntervalMonths: number;
  description: string;
  appliesTo: ('matic' | 'manual' | 'bebek' | 'sport')[];
  riskIfIgnored: string;
}

export const DEFAULT_SERVICE_TEMPLATES: DefaultServiceItem[] = [
  {
    category: 'oli_mesin',
    title: 'Ganti Oli Mesin',
    defaultIntervalKm: 2500,
    defaultIntervalMonths: 2,
    description: 'Pelumasan komponen internal mesin agar tidak cepat aus dan suhu mesin terjaga.',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Mesin overheat, piston baret, performa ngempos, hingga turun mesin berbiaya jutaan rupiah.',
  },
  {
    category: 'oli_gardan',
    title: 'Ganti Oli Gardan / Gear Oil',
    defaultIntervalKm: 8000,
    defaultIntervalMonths: 6,
    description: 'Pelumas gigi transmisi belakang pada motor matic (rasio 2:1 dengan oli mesin atau setiap 8.000 km).',
    appliesTo: ['matic'],
    riskIfIgnored: 'Gearbox mendengung keras, bearing transmisi aus, roda belakang bisa macet.',
  },
  {
    category: 'servis_cvt_rantai',
    title: 'Servis CVT & Pembersihan Komponen',
    defaultIntervalKm: 8000,
    defaultIntervalMonths: 6,
    description: 'Pembersihan mangkok kopling, kampas ganda, roller, sliding sheave, dan pelumasan grease CVT.',
    appliesTo: ['matic'],
    riskIfIgnored: 'Tarikan awal gredek/getar keras, akselerasi loyo, roller peyang, v-belt cepat putus di jalan.',
  },
  {
    category: 'servis_cvt_rantai',
    title: 'Setel & Lumasi Rantai Roda',
    defaultIntervalKm: 3000,
    defaultIntervalMonths: 3,
    description: 'Pengecekan kekencangan rantai, keausan gir depan/belakang, dan pelumasan chain lube.',
    appliesTo: ['manual', 'bebek', 'sport'],
    riskIfIgnored: 'Rantai kendur berisik, rantai lepas saat jalan kencang, gir aus tajam membahayakan keselamatan.',
  },
  {
    category: 'tune_up',
    title: 'Tune-Up & Bersihkan Throttle Body / Injektor',
    defaultIntervalKm: 6000,
    defaultIntervalMonths: 6,
    description: 'Pembersihan kerak ruang bakar, kalibrasi sensor TPS, reset ECU, pembersihan injektor.',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Tarikan gas brebet, motor gampang mati di lampu merah, konsumsi BBM boros.',
  },
  {
    category: 'busi',
    title: 'Ganti Busi (Spark Plug)',
    defaultIntervalKm: 8000,
    defaultIntervalMonths: 8,
    description: 'Penggantian busi pengapian untuk memastikan pembakaran sempurna di ruang silinder.',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Motor susah dihidupkan (terutama pagi hari), mesin sering mati mendadak, bensin boros.',
  },
  {
    category: 'filter_udara',
    title: 'Ganti Filter Udara',
    defaultIntervalKm: 12000,
    defaultIntervalMonths: 10,
    description: 'Menyaring debu dan kotoran agar tidak masuk ke ruang bakar dan throttle body.',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Debu masuk ke ruang bakar menyebabkan ring piston aus, tarikan motor terasa berat.',
  },
  {
    category: 'radiator_coolant',
    title: 'Kuras Air Radiator (Coolant)',
    defaultIntervalKm: 12000,
    defaultIntervalMonths: 12,
    description: 'Mengganti cairan pendingin radiator agar sistem pendinginan mesin tetap optimal.',
    appliesTo: ['matic', 'manual', 'sport'],
    riskIfIgnored: 'Air radiator berkarat/mendidih, mesin overheat, silinder head melengkung.',
  },
  {
    category: 'kampas_rem',
    title: 'Cek & Ganti Kampas Rem',
    defaultIntervalKm: 10000,
    defaultIntervalMonths: 8,
    description: 'Pemeriksaan ketebalan kampas rem depan (cakram) dan belakang (tromol/cakram).',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Rem blong, piringan cakram baret dalam tergores besi kampas, risiko kecelakaan.',
  },
  {
    category: 'minyak_rem',
    title: 'Kuras & Ganti Minyak Rem (DOT 3 / DOT 4)',
    defaultIntervalKm: 20000,
    defaultIntervalMonths: 24,
    description: 'Penggantian fluida hidrolik rem yang telah menyerap uap air seiring waktu.',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Vapor lock (rem masuk angin & blong saat turunan panjang karena minyak rem mendidih).',
  },
  {
    category: 'aki',
    title: 'Cek Kondisi & Tegangan Aki (Voltase)',
    defaultIntervalKm: 15000,
    defaultIntervalMonths: 12,
    description: 'Pemeriksaan voltase aki saat idle dan saat pengisian alternator (standar 12.4V - 14.5V).',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Starter elektrik mati, speedometer digital mati, sistem keyless/smartkey tidak merespons.',
  },
  {
    category: 'ban',
    title: 'Cek Tekanan Angin & Kedalaman Alur Ban',
    defaultIntervalKm: 5000,
    defaultIntervalMonths: 3,
    description: 'Pemeriksaan indikator TWI (Tread Wear Indicator) dan kondisi dinding ban.',
    appliesTo: ['matic', 'manual', 'bebek', 'sport'],
    riskIfIgnored: 'Ban botak sangat licin saat hujan, rentan pecah ban di jalan raya saat panas.',
  },
];
