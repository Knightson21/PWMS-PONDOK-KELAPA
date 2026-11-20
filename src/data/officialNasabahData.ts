/**
 * Data Resmi Bank Sampah Persatuan (Kreasi 308)
 * Diambil dari dokumen resmi:
 * 1. NASABAH_BANK_SAMPAH.pdf (107 Nasabah terdaftar & buku tabungan historis)
 * 2. DATA_PENJUALAN_BSP_2026.pdf (Data Transaksi Nasabah Januari - Oktober 2026)
 *
 * PERHATIAN: Sesuai instruksi pengelola, data identitas perseorangan ini bersifat INTERNAL (Bukan untuk Publik).
 */

export interface RawNasabah {
  no: number;
  id: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  address: string;
  rt: string;
  rw: string;
  kelurahan: string;
  jenisNasabah: 'Perorangan' | 'Lembaga';
}

export interface RawTransaction2026 {
  id: string;
  month: 'Januari' | 'Februari' | 'Maret' | 'April' | 'Mei' | 'Juni' | 'Juli' | 'Agustus' | 'September' | 'Oktober';
  monthIndex: number; // 1 to 10
  date: string; // YYYY-MM-DD
  rawDate: string;
  nasabahName: string;
  nasabahId?: string;
  rt: string;
  rw: string;
  address: string;
  jenisSampah: string;
  beratKg: number;
  hargaPerKg: number;
  totalRp: number;
}

// 107 Nasabah Resmi Bank Sampah Persatuan
export const OFFICIAL_NASABAH_LIST: RawNasabah[] = [
  { no: 1, id: 'NSB-0001', name: 'ABID', email: 'abid001@gmail.com', username: 'abid0001', phone: '08180964070', address: 'Kp.Baru kapin', rt: 'RT 008', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 2, id: 'NSB-0002', name: 'ACIH YUNINGSIH', email: 'acih002@gmail.com', username: 'acih0002', phone: '081388605074', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 3, id: 'NSB-0003', name: 'ADYA', email: 'adya003@gmail.com', username: 'adya0003', phone: '082111142769', address: 'Komp.DDN', rt: 'RT 012', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 4, id: 'NSB-0004', name: 'AGUSTINA WIDYASTUTI', email: 'agustina004@gmail.com', username: 'agustina004', phone: '08179879229', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 5, id: 'NSB-0005', name: 'AMEL', email: 'amel005@gmail.com', username: 'amel0005', phone: '081316282729', address: 'Jl.Madu', rt: 'RT 006', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 6, id: 'NSB-0006', name: 'AMIRUDIN', email: 'amirudin006@gmail.com', username: 'amirudin006', phone: '085691200755', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 7, id: 'NSB-0007', name: 'ANA SEVTARINA', email: 'sevtarina007@gmail.com', username: 'sevtarina007', phone: '085886796738', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 8, id: 'NSB-0008', name: 'ANISA', email: 'anisa008@gmail.com', username: 'anisa008', phone: '08111001778', address: 'Jatimakmur', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 9, id: 'NSB-0009', name: 'ANISA SALSABILA', email: 'anisasalsabila009@gmail.com', username: 'anisasalsabila009', phone: '08159383027', address: 'Paud AkuGrow Bekasi selatan', rt: 'RT 008', rw: 'RW 25', kelurahan: 'Jakasetia', jenisNasabah: 'Perorangan' },
  { no: 10, id: 'NSB-0010', name: 'ARIF', email: 'arif010@gmail.com', username: 'arif0010', phone: '081511851889', address: 'Jatibening baru pondok gede', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 11, id: 'NSB-0011', name: 'ARSANDI', email: 'arsandi011@gmail.com', username: 'arsandi011', phone: '081219903105', address: 'Lampiri pondok kelapa', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 12, id: 'NSB-0012', name: 'ASMAWI', email: 'asmawi012@gmail.com', username: 'asmawi012', phone: '081289363699', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 13, id: 'NSB-0013', name: 'ASNAWI', email: 'asnawi013@gmail.com', username: 'asnawi013', phone: '0895393086367', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 14, id: 'NSB-0014', name: 'ATIK MAYA', email: 'atikmaya014@gmail.com', username: 'atikmaya014', phone: '085883483936', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 15, id: 'NSB-0015', name: 'AWALUDIN AKMAL', email: 'akmal015@gmail.com', username: 'akmal015', phone: '085711122334', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 16, id: 'NSB-0016', name: 'BADRINA ALFI', email: 'badrinaalfi016@gmail.com', username: 'badrina016', phone: '081287295631', address: 'SMAN 71 Jl.H.Dogon', rt: 'RT 007', rw: 'RW 16', kelurahan: 'Duren sawit', jenisNasabah: 'Perorangan' },
  { no: 17, id: 'NSB-0017', name: 'BUDI RIWAYATI', email: 'budiriwayati017@gmail.com', username: 'budiriwayati017', phone: '081311330381', address: 'Jl.H.Amar', rt: 'RT 006', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 18, id: 'NSB-0018', name: 'DIAN', email: 'dian018@gmail.com', username: 'dian0018', phone: '081585313883', address: 'Jatiwaringin', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 19, id: 'NSB-0019', name: 'DIDI', email: 'didi019@gmail.com', username: 'didi0019', phone: '085811223344', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 20, id: 'NSB-0020', name: 'DRA DARYANTI', email: 'daryanti020@gmail.com', username: 'daryanti020', phone: '081218373656', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 21, id: 'NSB-0021', name: 'EDI SUJARWO', email: 'edisujarwo021@gmail.com', username: 'edis0021', phone: '081222227531', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 22, id: 'NSB-0022', name: 'EKO PRIYAGUNG HARTOMO', email: 'ekopriyagung022@gmail.com', username: 'ekopriyagung022', phone: '081398332977', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 23, id: 'NSB-0023', name: 'EMA HADI', email: 'emahadi023@gmail.com', username: 'emahadi023', phone: '085712334455', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 24, id: 'NSB-0024', name: 'ENDANG', email: 'endang024@gmail.com', username: 'endang024', phone: '085722334455', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 25, id: 'NSB-0025', name: 'ESA MUSRIFAH', email: 'musrifah025@gmail.com', username: 'musrifah025', phone: '085780355251', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 26, id: 'NSB-0026', name: 'EVI HARTONO', email: 'evihartono026@gmail.com', username: 'evihartono026', phone: '08119845621', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 27, id: 'NSB-0027', name: 'FAHRI DATUK', email: 'fahri027@gmail.com', username: 'fahri027', phone: '085697745163', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 28, id: 'NSB-0028', name: 'FAREL', email: 'farel028@gmail.com', username: 'farel028', phone: '085733445566', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 29, id: 'NSB-0029', name: 'FATHIA', email: 'fathia029@gmail.com', username: 'fathia029', phone: '085643105724', address: 'Jatiwaringin', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 30, id: 'NSB-0030', name: 'FITRIYAH AGUNG', email: 'fitriyahagung030@gmail.com', username: 'fitriyahagung030', phone: '085744556677', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 31, id: 'NSB-0031', name: 'H. ASEP', email: 'h.asep031@gmail.com', username: 'hasep031', phone: '085755667788', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 32, id: 'NSB-0032', name: 'H. IDHAM', email: 'h.idham032@gmail.com', username: 'h.idham032', phone: '085766778899', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 33, id: 'NSB-0033', name: 'HAMDAN HERMAWAN', email: 'hamdanh033@gmail.com', username: 'hamdanh033', phone: '087777998765', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 34, id: 'NSB-0034', name: 'HANI', email: 'hani034@gmail.com', username: 'hani0034', phone: '085775178455', address: 'TMII', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 35, id: 'NSB-0035', name: 'HARI JOKO LELONO', email: 'harijokol035@gmail.com', username: 'harijokol035', phone: '085777889900', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 36, id: 'NSB-0036', name: 'HARUN', email: 'harun036@gmail.com', username: 'harun036', phone: '085788990011', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 37, id: 'NSB-0037', name: 'HERI LUKAS', email: 'herilukas037@gmail.com', username: 'herilukas037', phone: '081319707420', address: 'Kp.Curug', rt: 'RT 004', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 38, id: 'NSB-0038', name: 'HUSEN', email: 'husen038@gmail.com', username: 'husen038', phone: '085799001122', address: 'Kp.Curug', rt: 'RT 004', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 39, id: 'NSB-0039', name: 'ICHWAN Unindra', email: 'ichwan039@gmail.com', username: 'ichwan039', phone: '085156174339', address: 'Kayuringin Bekasi', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Kayuringin jaya', jenisNasabah: 'Perorangan' },
  { no: 40, id: 'NSB-0040', name: 'IRHAM', email: 'irham040@gmail.com', username: 'irham040', phone: '085811002233', address: 'Kp.Curug', rt: 'RT 004', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 41, id: 'NSB-0041', name: 'IYAS', email: 'iyas041@gmail.com', username: 'iyas0041', phone: '085951960169', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 42, id: 'NSB-0042', name: 'JESICA', email: 'jesica042@gmail.com', username: 'jesica042', phone: '082115478845', address: 'Jatiwaringin', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 43, id: 'NSB-0043', name: 'JIHAN YUYUN', email: 'jihanyuyun043@gmail.com', username: 'jihanyuyun043', phone: '082114086150', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 44, id: 'NSB-0044', name: 'JUANNS', email: 'juanns044@gmail.com', username: 'juanns044', phone: '081385670905', address: 'SMAN 50 cipinang muara', rt: 'RT 009', rw: 'RW 15', kelurahan: 'Cipinang muara', jenisNasabah: 'Perorangan' },
  { no: 45, id: 'NSB-0045', name: 'KAMILAH', email: 'kamilah045@gmail.com', username: 'kamilah045', phone: '085779013688', address: 'Jatiwaringin', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 46, id: 'NSB-0046', name: 'LINA ARPAN', email: 'linaarpan046@gmail.com', username: 'linaarpan046', phone: '085822113344', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 47, id: 'NSB-0047', name: 'LIZA', email: 'liza047@gmail.com', username: 'liza0047', phone: '081310734373', address: 'Komp.statistik pondok bambu', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok bambu', jenisNasabah: 'Perorangan' },
  { no: 48, id: 'NSB-0048', name: 'MAMAH.H', email: 'mamah.h048@gmail.com', username: 'mamah.h048', phone: '085833224455', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 49, id: 'NSB-0049', name: 'MAMAT', email: 'mamat049@gmail.com', username: 'mamat049', phone: '085844335566', address: 'Kp.Curug', rt: 'RT 004', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 50, id: 'NSB-0050', name: 'MARALI', email: 'marali050@gmail.com', username: 'marali050', phone: '085697749321', address: 'Kp.Curug', rt: 'RT 005', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 51, id: 'NSB-0051', name: 'MARISA SUGEFI', email: 'marisa051@gmail.com', username: 'marisa051', phone: '081261901782', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 52, id: 'NSB-0052', name: 'MASRUROH', email: 'masruroh052@gmail.com', username: 'masruroh052', phone: '087881903606', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 53, id: 'NSB-0053', name: 'MISJAH', email: 'misjah053@gmail.com', username: 'misjah053', phone: '085855446677', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 54, id: 'NSB-0054', name: 'MUHAMD YADI', email: 'muhamdyadi054@gmail.com', username: 'muhamdyadi054', phone: '085887248402', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 55, id: 'NSB-0055', name: 'MUHAMMAD BINTANG HARSO', email: 'bintangharso055@gmail.com', username: 'bintangharso055', phone: '085156624374', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 56, id: 'NSB-0056', name: 'MUNJIRIN', email: 'munjirin056@gmail.com', username: 'munjirin056', phone: '081338200366', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 57, id: 'NSB-0057', name: 'MURNI', email: 'murni057@gmail.com', username: 'murni057', phone: '081386007767', address: 'Kp.Curug', rt: 'RT 004', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 58, id: 'NSB-0058', name: 'NANDO PANEM', email: 'nando058@gmail.com', username: 'nando058', phone: '0895385152740', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 59, id: 'NSB-0059', name: 'NANI SURYANI', email: 'nanisuryani059@gmail.com', username: 'nanisuryani059', phone: '081283196520', address: 'Kp.Curug', rt: 'RT 006', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 60, id: 'NSB-0060', name: 'NENENG KUSNIAWATI', email: 'nenengkus060@gmail.com', username: 'nenengkus060', phone: '089540327307', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 61, id: 'NSB-0061', name: 'NENENG YULIANA', email: 'nenengyul061@gmail.com', username: 'nenengyul061', phone: '089540327308', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 62, id: 'NSB-0062', name: 'NOVIRTY MANURUNG', email: 'novirty062@gmail.com', username: 'novirty062', phone: '081299887766', address: 'Jatiwaringin', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 63, id: 'NSB-0063', name: 'NURHIKMAH', email: 'nurhikmah063@gmail.com', username: 'nurhikmah063', phone: '08567840980', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 64, id: 'NSB-0064', name: 'NURUL', email: 'nurul064@gmail.com', username: 'nurul064', phone: '085866557788', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 65, id: 'NSB-0065', name: 'PARMAN YANI', email: 'parmanyani065@gmail.com', username: 'parmanyani065', phone: '089541600808', address: 'SMK Petri Jaya', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Lembaga' },
  { no: 66, id: 'NSB-0066', name: 'PIPIT ROHMANAH', email: 'pipitroh066@gmail.com', username: 'pipitroh066', phone: '08551843876', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 67, id: 'NSB-0067', name: 'RAISYA', email: 'raisya067@gmail.com', username: 'raisya067', phone: '085877668899', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 68, id: 'NSB-0068', name: 'RIFQI', email: 'rifqi068@gmail.com', username: 'rifqi068', phone: '081299112233', address: 'Labschool Jl.Pemuda rawamangun', rt: 'RT 007', rw: 'RW 14', kelurahan: 'Rawamangun', jenisNasabah: 'Perorangan' },
  { no: 69, id: 'NSB-0069', name: 'RINI ISWANDI', email: 'riniiswandi069@gmail.com', username: 'riniiswandi069', phone: '082320856581', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 70, id: 'NSB-0070', name: 'RISWAN', email: 'riswan070@gmail.com', username: 'riswan070', phone: '085888779900', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 71, id: 'NSB-0071', name: 'RIWIEN', email: 'riwien071@gmail.com', username: 'riwien071', phone: '081807224807', address: 'Jl.Bukit pondok gede', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok gede', jenisNasabah: 'Perorangan' },
  { no: 72, id: 'NSB-0072', name: 'ROBIATUL ADAWIYAH', email: 'radawiyah072@gmail.com', username: 'radawiyah072', phone: '085781007151', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 73, id: 'NSB-0073', name: 'SAFIRA', email: 'safira073@gmail.com', username: 'safira073', phone: '085899880011', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 74, id: 'NSB-0074', name: 'ROLAN', email: 'rolan074@gmail.com', username: 'rolan073', phone: '081298877665', address: 'Pondok bambu', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok bambu', jenisNasabah: 'Perorangan' },
  { no: 75, id: 'NSB-0075', name: 'SAILIN', email: 'sailin075@gmail.com', username: 'sailin075', phone: '087841496210', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 76, id: 'NSB-0076', name: 'SALAMAH', email: 'salamah076@gmail.com', username: 'salamah076', phone: '081384811468', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 77, id: 'NSB-0077', name: 'SAPNAH MUSA', email: 'sapnahmusa077@gmail.com', username: 'sapnahmusa077', phone: '085890394340', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 78, id: 'NSB-0078', name: 'SARJAN', email: 'sarjan078@gmail.com', username: 'sarjan078', phone: '089533128108', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 79, id: 'NSB-0079', name: 'SAWINI', email: 'sawini079@gmail.com', username: 'sawini079', phone: '08989412991', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 80, id: 'NSB-0080', name: 'SELVYSYLVIA', email: 'selvysylvia080@gmail.com', username: 'selvysyvia080', phone: '081297766554', address: 'Pondok bambu', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Duren sawit', jenisNasabah: 'Perorangan' },
  { no: 81, id: 'NSB-0081', name: 'SINTA BIMO', email: 'sintabimo081@gmail.com', username: 'sintabimo081', phone: '085811335577', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 82, id: 'NSB-0082', name: 'SLAMET HARYANTO', email: 'slametharyanto082@gmail.com', username: 'slametharyanto082', phone: '081288837850', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 83, id: 'NSB-0083', name: 'SRI SOGOL', email: 'srisogol083@gmail.com', username: 'srisogol083', phone: '085822446688', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 84, id: 'NSB-0084', name: 'SRI RAHAYU', email: 'srirahayu084@gmail.com', username: 'srirahayu084', phone: '089518851449', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 85, id: 'NSB-0085', name: 'SRIPANCOKO', email: 'sripancoko085@gmail.com', username: 'sripancoko085', phone: '085813504522', address: 'Kp.Curug', rt: 'RT 001', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 86, id: 'NSB-0086', name: 'SUKIRAN', email: 'sukiran086@gmail.com', username: 'sukiran086', phone: '085833557799', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 87, id: 'NSB-0087', name: 'SUMARDI', email: 'sumardi087@gmail.com', username: 'sumardi087', phone: '08158026080', address: 'Kp.Curug', rt: 'RT 002', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 88, id: 'NSB-0088', name: 'SUNARTI SURIPTO', email: 'sunartisuripto088@gmail.com', username: 'sunartisuripto088', phone: '081319097363', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 89, id: 'NSB-0089', name: 'SUNARTI TARWADI', email: 'sunartitarwadi089@gmail.com', username: 'sunartitarwadi089', phone: '089531770544', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 90, id: 'NSB-0090', name: 'SUPARMAN', email: 'suparman090@gmail.com', username: 'suparman090', phone: '081318822940', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 91, id: 'NSB-0091', name: 'SURADI', email: 'suradi091@gmail.com', username: 'suradi091', phone: '085844668800', address: 'Kp.Curug', rt: 'RT 001', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 92, id: 'NSB-0092', name: 'SURYANI', email: 'suryani092@gmail.com', username: 'suryani092', phone: '085855779911', address: 'Kp.Curug', rt: 'RT 001', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 93, id: 'NSB-0093', name: 'SUSILOWATI', email: 'susilowati093@gmail.com', username: 'susilowati093', phone: '088289694220', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 94, id: 'NSB-0094', name: 'SUTIATI', email: 'sutiati094@gmail.com', username: 'sutiati094', phone: '089607510025', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 95, id: 'NSB-0095', name: 'SUWANI', email: 'suwani0952@gmail.com', username: 'suwani095', phone: '081399343314', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 96, id: 'NSB-0096', name: 'SUWATI', email: 'suwati096@gmail.com', username: 'suwati096', phone: '085866880022', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 97, id: 'NSB-0097', name: 'TABAIN EMO', email: 'tabainemo097@gmail.com', username: 'tabainemo097', phone: '081382040504', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 98, id: 'NSB-0098', name: 'TATI HARTATI', email: 'tatihartati098@gmail.com', username: 'tatihartati098', phone: '087737593000', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 99, id: 'NSB-0099', name: 'WARUNG ENO', email: 'warungeno099@gmail.com', username: 'warungeno099', phone: '085877991133', address: 'Kp.Curug', rt: 'RT 001', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 100, id: 'NSB-0100', name: 'TERA', email: 'tera0100@gmail.com', username: 'tera0100', phone: '085888002244', address: 'Kp.Curug', rt: 'RT 006', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 101, id: 'NSB-0101', name: 'WINARTI', email: 'winarti0101@gmail.com', username: 'winarti0101', phone: '081219169931', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 102, id: 'NSB-0102', name: 'YANE SEBATIAN', email: 'yanesebastian0102@gmail.com', username: 'yanesebastian0102', phone: '081318992211', address: 'Komp.Bilimoon', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 103, id: 'NSB-0103', name: 'YANTI KUIK', email: 'yantikuik0103@gmail.com', username: 'yantikuik0103', phone: '085714400450', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 104, id: 'NSB-0104', name: 'YOYOH', email: 'yoyoh0104@gmail.com', username: 'yoyoh0104', phone: '085899113355', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 105, id: 'NSB-0105', name: 'YULI MAISURI', email: 'yulimaisuri0105@gmail.com', username: 'yulimaisuri0105', phone: '085694366417', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 106, id: 'NSB-0106', name: 'YUSMAWATI', email: 'yusmawati0106@gmail.com', username: 'yusmawati0106', phone: '08119983149', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' },
  { no: 107, id: 'NSB-0107', name: 'ZIO ZAHRA', email: 'ziozahra0107@gmail.com', username: 'ziozahra0107', phone: '087788632607', address: 'Kp.Curug', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Perorangan' }
];

// Nasabah Lembaga Tambahan Resmi yang bertransaksi rutin di BSP:
export const OFFICIAL_LEMBAGA_LIST: RawNasabah[] = [
  { no: 108, id: 'NSB-0108', name: 'DASAWISMA RW 08', email: 'dasawisma08@gmail.com', username: 'dasawisma08', phone: '085775437617', address: 'Sekretariat RW 08 Kp. Curug', rt: 'RT 008', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Lembaga' },
  { no: 109, id: 'NSB-0109', name: 'POS RW 08', email: 'posrw08@gmail.com', username: 'posrw08', phone: '081234567801', address: 'Pos Balai Warga RW 08', rt: 'RT 001', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Lembaga' },
  { no: 110, id: 'NSB-0110', name: 'POS RT 03', email: 'posrt03@gmail.com', username: 'posrt03', phone: '081234567803', address: 'Pos Kamling RT 03', rt: 'RT 003', rw: 'RW 08', kelurahan: 'Pondok kelapa', jenisNasabah: 'Lembaga' },
  { no: 111, id: 'NSB-0111', name: 'SDN PONDOK KELAPA 05', email: 'sdnpk05@gmail.com', username: 'sdnpk05', phone: '081234567805', address: 'Jl. Pondok Kelapa Raya', rt: 'Luar RW', rw: 'RW 00', kelurahan: 'Pondok kelapa', jenisNasabah: 'Lembaga' },
  { no: 112, id: 'NSB-0112', name: 'SMA PUTRA 1 / SMAN 71', email: 'smaputra1@gmail.com', username: 'smaputra1', phone: '081287295632', address: 'Jl. Raden Inten II / H. Dogon', rt: 'RT 004', rw: 'RW 08', kelurahan: 'Duren sawit', jenisNasabah: 'Lembaga' },
  { no: 113, id: 'NSB-0113', name: 'LABSCHOOL RAWAMANGUN', email: 'labschool@gmail.com', username: 'labschool', phone: '081299112234', address: 'Jl. Pemuda Rawamangun', rt: 'Luar RW', rw: 'RW 14', kelurahan: 'Rawamangun', jenisNasabah: 'Lembaga' }
];

// Helper to look up nasabah by name
export function findNasabahByName(name: string): RawNasabah | undefined {
  const clean = name.trim().toUpperCase();
  const all = [...OFFICIAL_NASABAH_LIST, ...OFFICIAL_LEMBAGA_LIST];
  return all.find(n => {
    const nName = n.name.toUpperCase();
    if (nName === clean) return true;
    if (clean.includes(nName) || nName.includes(clean)) return true;
    if (clean === 'ACIH' && nName.includes('ACIH')) return true;
    if (clean === 'ADAWIYAH' && nName.includes('ADAWIYAH')) return true;
    if (clean === 'NANI S' && nName.includes('NANI')) return true;
    if (clean === 'MURNI' && nName.includes('MURNI')) return true;
    if (clean === 'QISTI' && nName.includes('QISTI')) return true;
    if (clean === 'UROH' && nName.includes('UROH')) return true;
    if (clean === 'SUNARTI' && nName.includes('SUNARTI')) return true;
    if (clean === 'SURIP' && nName.includes('SURIP')) return true;
    if (clean === 'RINI' && nName.includes('RINI')) return true;
    if (clean === 'FERI' && nName.includes('FERI')) return true;
    if (clean === 'CE MAMAH' && nName.includes('MAMAH')) return true;
    if (clean.includes('DASAWISMA')) return n.id === 'NSB-0108';
    if (clean.includes('POS RW')) return n.id === 'NSB-0109';
    if (clean.includes('POS RT')) return n.id === 'NSB-0110';
    if (clean.includes('SDN PONDOK KELAPA')) return n.id === 'NSB-0111';
    if (clean.includes('SMA PUTRA') || clean.includes('SMAN 71')) return n.id === 'NSB-0112';
    if (clean.includes('LABSCHOOL') || clean.includes('NAILA') || clean.includes('NAFISA') || clean.includes('SALSA')) return n.id === 'NSB-0113';
    return false;
  });
}
