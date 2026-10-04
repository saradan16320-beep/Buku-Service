import { TroubleshootingTopic } from '../types';

export const DIAGNOSTIC_TOPICS: TroubleshootingTopic[] = [
  {
    id: 'cvt-gredek',
    title: 'Tarikan Awal Gredek / Bergetar (Motor Matic)',
    category: 'cvt_transmisi',
    urgencyLevel: 'sedang',
    symptoms: [
      'Bodi motor bergetar hebat saat gas dibuka pelan dari posisi berhenti',
      'Suara berdecit halus dari blok CVT sebelah kiri',
      'Akselerasi tersendat di kecepatan 10 - 30 km/jam',
    ],
    possibleCauses: [
      'Mangkok ganda dan kampas kopling CVT kotor berdebu',
      'Permukaan kampas ganda licin (glazed)',
      'Roller CVT aus / peyang tidak bulat rata',
      'Grease / gemuk CVT bocor ke area puli atau kering',
    ],
    recommendedSolutions: [
      'Buka blok CVT dan semprot bersih dengan brake cleaner / bensin',
      'Amplas tipis permukaan kampas ganda dan haluskan mangkok kopling',
      'Ganti roller CVT jika sudah ada bagian flat/aus',
      'Lumasi pin sliding sheave dengan gemuk khusus CVT bertemperatur tinggi',
    ],
  },
  {
    id: 'mesin-brebet',
    title: 'Mesin Brebet & Tersendat Saat Ditarik Gas',
    category: 'mesin',
    urgencyLevel: 'tinggi',
    symptoms: [
      'Gas ditarik tiba-tiba tapi mesin seperti mau mati / ngempos',
      'Putaran mesin (RPM) tidak stabil saat langsam / idle',
      'Knalpot sesekali meletup-letup kecil',
    ],
    possibleCauses: [
      'Busi sudah berkerak hitam tebal atau elektroda menipis',
      'Filter udara sangat kotor tersumbat debu jalanan',
      'Injektor kotor / lubang semprotan bensin tersumbat kerak',
      'Tekanan fuel pump pompa bensin di tangki melemah (< 294 kPa)',
    ],
    recommendedSolutions: [
      'Ganti busi standar baru sesuai kode pabrikan (misal NGK CPR9 / Denso U27)',
      'Ganti elemen saringan udara (jangan dicuci bensin jika tipe kertas berminyak)',
      'Lakukan servis infus injektor atau pembersihan ultrasonic throttle body',
      'Cek voltase aki dan tes tekanan pompa bensin (fuel pump) di bengkel',
    ],
  },
  {
    id: 'rem-mencicit-blong',
    title: 'Rem Bunyi Mencicit Tajam atau Handle Rem Ambles',
    category: 'pengereman',
    urgencyLevel: 'tinggi',
    symptoms: [
      'Bunyi gesekan logam "sreeek" atau melengking saat tuas rem ditekan',
      'Tuas rem harus ditarik sangat dalam baru ada gigitan pengereman',
      'Jarak pengereman bertambah panjang / licin',
    ],
    possibleCauses: [
      'Kampas rem sudah habis hingga plat besi menggesek piringan cakram',
      'Banyak debu pasir terperangkap di kaliper rem',
      'Minyak rem sudah keruh/terkontaminasi udara (masuk angin)',
      'Piston master rem aus atau macet',
    ],
    recommendedSolutions: [
      'Segera periksa ketebalan kampas rem, ganti sebelum merusak piringan cakram',
      'Semprot kaliper dengan brake cleaner untuk membuang kotoran kampas',
      'Bleeding (kuras) minyak rem dan ganti cairan DOT 4 baru',
      'Lumasi pin kaliper floating rem agar bergerak bebas lancar',
    ],
  },
  {
    id: 'aki-starter-mati',
    title: 'Starter Elektrik Mati / Klakson Loyo / Lampu Redup',
    category: 'kelistrikan',
    urgencyLevel: 'sedang',
    symptoms: [
      'Saat tombol starter dipencet hanya terdengar bunyi "cetek-cetek"',
      'Indikator speedometer meredup atau restart saat memencet starter',
      'Suara klakson serak dan lampu sein berkedip lambat',
    ],
    possibleCauses: [
      'Tegangan aki drop di bawah 12.0 Volt saat mesin mati',
      'Kutub aki kendor atau diselimuti kerak putih korosi (jamur aki)',
      'Kiprok / regulator pengisian rusak (pengisian undercharge/overcharge)',
      'Arang brush dinamo starter sudah aus habis',
    ],
    recommendedSolutions: [
      'Bersihkan kutub aki dengan air panas lalu kencangkan baut terminal',
      'Cas aki (charge) atau ganti dengan aki kering (MF) baru bila voltase drop',
      'Ukur tegangan saat mesin menyala (harus 13.5V - 14.5V menandakan kiprok normal)',
      'Cek relay starter (bendik) dan arang dinamo bila aki normal tapi tidak berputar',
    ],
  },
  {
    id: 'setang-goyang-oblak',
    title: 'Setang Kemudi Goyang & Terasa Berat / Kaku',
    category: 'kaki_kaki',
    urgencyLevel: 'sedang',
    symptoms: [
      'Setang terasa berat saat berbelok pelan atau "mengunci" di tengah',
      'Bodi depan motor terasa oleng saat melibas marka jalan atau jalan tidak rata',
      'Terdengar suara "jedug" di bagian segitiga depan saat mengerem mendadak',
    ],
    possibleCauses: [
      'Komstir (bearing steering head) aus, oblak, atau grease pelumasnya kering',
      'Bearing laher roda depan pecah atau oblak',
      'Tekanan angin ban depan terlalu kempes (< 28 PSI)',
      'Pelek peyang akibat menghantam lubang jalan dengan kecepatan tinggi',
    ],
    recommendedSolutions: [
      'Setel ulang atau ganti 1 set laher komstir (atas & bawah)',
      'Goyang roda depan secara lateral untuk mengecek laher bearing as roda',
      'Isi angin ban depan sesuai rekomendasi (29 - 30 PSI)',
      'Press pelek jika terdapat peyang pada bibir velg',
    ],
  },
  {
    id: 'asap-putih-knalpot',
    title: 'Knalpot Mengeluarkan Asap Putih & Oli Cepat Berkurang',
    category: 'mesin',
    urgencyLevel: 'tinggi',
    symptoms: [
      'Asap putih tipis/tebal keluar dari moncong knalpot saat digas',
      'Volume oli mesin berkurang drastis saat dicek lewat dipstick oli',
      'Terdengar suara ketukan halus kasar dari area kepala silinder',
    ],
    possibleCauses: [
      'Ring piston aus atau linier silinder baret sehingga oli merembes ke ruang bakar',
      'Seal klep (valve stem seal) getas / bocor',
      'Memakai oli palsu atau terlambat ganti oli terlalu lama',
    ],
    recommendedSolutions: [
      'Jangan tunda! Segera bawa ke bengkel untuk cek kompresi ruang bakar',
      'Ganti ring piston dan seal klep baru (turun mesin separuh)',
      'Korter atau ganti blok silinder jika dinding silinder tergores',
      'Gunakan selalu oli original terpercaya sesuai spesifikasi SAE pabrikan',
    ],
  },
];
