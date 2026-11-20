export type UserRole = 'admin' | 'nasabah';

export interface WilayahRT {
  id: string; // e.g. "RT-01"
  nomorRt: string; // e.g. "RT 01"
  nomorRw: string; // e.g. "RW 05"
  ketuaRt?: string;
  phone?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WilayahConfig {
  nomorRw: string; // e.g. "RW 05"
  namaWilayah: string; // e.g. "RW 05 Kelurahan Persatuan"
  ketuaRw?: string;
}

export interface RtStatistic {
  rtId: string;
  nomorRt: string;
  nomorRw: string;
  totalNasabah: number;
  totalNasabahActive: number;
  totalWeightKg: number;
  totalDepositRp: number;
  totalSaldoRp: number;
  totalWithdrawalRp: number;
  isActive: boolean;
  percentageContribution: number;
}

export interface User {
  id: string; // e.g. "ADM-001" or "NSB-0001"
  name: string;
  phone: string;
  address: string;
  rt: string; // e.g. "RT 01" (mandatory for nasabah)
  rw: string; // e.g. "RW 05"
  email?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  mustChangePassword?: boolean;
  createdAt: string;
  saldo: number; // calculated available balance
  totalWeightDeposited: number; // accumulated kg from approved deposits
  totalEarned: number; // accumulated Rp from approved deposits
  totalWithdrawn: number; // accumulated Rp withdrawn
  username?: string;
  kelurahan?: string;
  nasabahType?: 'perorangan' | 'lembaga'; // Perorangan vs Bidang/Unit/Lembaga
  hasPhysicalBook?: boolean; // True if qualified for physical passbook
}

export interface PassbookEntry {
  id: string;
  date: string;
  type: 'SETORAN' | 'PENARIKAN';
  description: string;
  jenisSampah?: string;
  weightKg?: number;
  rateRp?: number;
  debitRp: number; // penarikan
  creditRp: number; // setoran
  runningBalanceRp: number;
  officerName: string;
  verified: boolean;
}

export interface Rekap2026Summary {
  totalBeratKg: number;
  totalNilaiRp: number;
  totalTransaksi: number;
  totalPenyetor: number;
  averagePerTransaksiKg: number;
  averagePerTransaksiRp: number;
  byMonth: Array<{
    month: string;
    monthIndex: number;
    beratKg: number;
    nilaiRp: number;
    count: number;
  }>;
  byRt: Array<{
    rt: string;
    beratKg: number;
    nilaiRp: number;
    count: number;
  }>;
}

export interface WasteType {
  id: string;
  name: string;
  category: string;
  pricePerKg: number;
  unit: string; // 'kg' or 'liter'
  isActive: boolean;
  updatedAt: string;
}

export interface WasteSaleItem {
  wasteTypeId: string;
  wasteTypeName: string;
  category?: string;
  unit?: string;
  weight: number;
  pricePerKg: number;
  subtotal: number;
}

export interface WasteSaleRecord {
  id: string; // e.g. "JUAL-0001"
  date: string;
  sellerName: string;
  sellerRt: string;
  items: WasteSaleItem[];
  totalWeight: number;
  totalAmount: number;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  source?: 'warga_beranda' | 'admin_input' | 'migrasi_2026';
}

export interface DepositItem {
  wasteTypeId: string;
  wasteTypeName: string;
  weight: number;
  snapshotPricePerKg: number;
  subtotal: number;
}

export type DepositStatus = 'MENUNGGU_VERIFIKASI' | 'DISETUJUI' | 'DITOLAK';

export interface CorrectionRecord {
  id: string;
  timestamp: string;
  adminName: string;
  previousTotalAmount: number;
  newTotalAmount: number;
  balanceDelta: number;
  reason: string;
  previousItems: DepositItem[];
  newItems: DepositItem[];
}

export interface DepositTransaction {
  id: string; // e.g. "ST-0001"
  nasabahId: string;
  nasabahName: string;
  nasabahPhone: string;
  nasabahRt?: string; // e.g. "RT 01"
  nasabahRw?: string; // e.g. "RW 05"
  date: string;
  items: DepositItem[];
  totalWeight: number;
  totalAmount: number;
  photoUrl: string;
  status: DepositStatus;
  notes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedReason?: string;
  isCorrected?: boolean;
  correctionHistory?: CorrectionRecord[];
}

export interface Withdrawal {
  id: string; // e.g. "TRK-0001"
  nasabahId: string;
  nasabahName: string;
  nasabahPhone: string;
  nasabahRt?: string;
  nasabahRw?: string;
  amount: number;
  date: string;
  status: 'COMPLETED';
  adminName: string;
  notes?: string;
}

export type MutationType = 'SETORAN' | 'PENARIKAN' | 'KOREKSI';

export interface Mutation {
  id: string;
  nasabahId: string;
  nasabahName: string;
  nasabahRt?: string;
  nasabahRw?: string;
  type: MutationType;
  amount: number; // positive or negative
  balanceBefore: number;
  balanceAfter: number;
  referenceId: string;
  description: string;
  date: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
}

export interface PublicStats {
  totalWeightKg: number;
  totalEconomicValueRp: number;
  totalActiveNasabah: number;
  totalApprovedTransactions: number;
  totalWithdrawalsRp: number;
}

export interface PengurusItem {
  jabatan: string;
  nama: string[];
}

export interface HasilKreasiItem {
  nama: string;
  kategori: string;
  deskripsi: string;
}

export interface TokoProduct {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  unit: string;
  deskripsi: string;
  manfaat: string;
  badge?: string;
  tersedia: boolean;
  imageUrl?: string;
  updatedAt?: string;
}

export interface OrganizationProfile {
  nama: string;
  brandTag: string;
  slogan: string;
  sejarah: string;
  orgChartImageUrl?: string;
  legalitas: {
    skAwal: string;
    skTerbaru: string;
    pemberiSK: string;
  };
  alamat: {
    lokasi: string;
    rt: string;
    rw: string;
    kelurahan: string;
    kecamatan: string;
    kota: string;
    provinsi: string;
    kodePos: string;
  };
  kontak: {
    telepon: string[];
    email: string;
    mediaSosial: {
      instagram: string[];
      tiktok: string;
      youtube: string;
    };
  };
  visi: string;
  misi: string[];
  kepengurusan: PengurusItem[];
  hasilKreasi: HasilKreasiItem[];
  documents: {
    profilePdfUrl: string;
    sopPdfUrl: string;
  };
}

export interface SOPItem {
  nomor: number;
  judul: string;
  poin: string[];
}
