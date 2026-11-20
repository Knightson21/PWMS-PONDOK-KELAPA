import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { DepositTransaction, Withdrawal, Mutation, WasteType } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { PassbookModal } from '../components/PassbookModal';
import { ThemeToggle } from '../components/ThemeToggle';
import { NasabahSelfDepositModal } from '../components/nasabah/NasabahSelfDepositModal';
import { 
  Wallet, 
  Scale, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Receipt, 
  LogOut, 
  KeyRound, 
  FileText,
  User as UserIcon,
  Eye,
  X,
  BookOpen,
  Printer,
  Coins,
  TrendingUp,
  Award,
  Plus,
  UploadCloud,
  AlertCircle
} from 'lucide-react';

export const NasabahDashboard: React.FC = () => {
  const { user, logout, openChangePasswordModal, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'deposits' | 'withdrawals' | 'mutations' | 'info'>('deposits');
  
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelfDepositOpen, setIsSelfDepositOpen] = useState(false);
  const [depositSuccessAlert, setDepositSuccessAlert] = useState<string | null>(null);

  // Modal states
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [receiptDeposit, setReceiptDeposit] = useState<DepositTransaction | null>(null);
  const [receiptWithdrawal, setReceiptWithdrawal] = useState<Withdrawal | null>(null);
  const [passbookData, setPassbookData] = useState<{
    isOpen: boolean;
    entries: any[];
    summary: any;
  }>({
    isOpen: false,
    entries: [],
    summary: {
      totalWeightKg: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      currentBalance: 0,
      totalTransactions: 0
    }
  });

  const handleOpenPassbook = async () => {
    try {
      const data = await api.getMyPassbook();
      setPassbookData({
        isOpen: true,
        entries: data.entries,
        summary: data.summary
      });
    } catch (err) {
      console.error('Failed to load passbook:', err);
    }
  };

  const loadData = async () => {
    try {
      const [depList, withList, mutList, wtList] = await Promise.all([
        api.getNasabahTransactions(),
        api.getNasabahWithdrawals(),
        api.getNasabahMutations(),
        api.getPublicWasteTypes()
      ]);
      setDeposits(depList);
      setWithdrawals(withList);
      setMutations(mutList);
      setWasteTypes(wtList);
    } catch (err) {
      console.error('Failed to load nasabah data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    refreshUser();
  }, []);

  const formatRupiah = (val: number) => {
    return 'Rp' + Number(val || 0).toLocaleString('id-ID');
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 text-neutral-900 pb-12">
      {/* Top Bar for Nasabah */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/images/logo_bank_sampah.png" 
              alt="Logo Bank Sampah Persatuan" 
              className="w-10 h-10 object-contain rounded-full shadow-sm border border-neutral-200 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900 block leading-tight">
                  Bank Sampah Persatuan
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  KREASI 308
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {user?.id} · {user?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSelfDepositOpen(true)}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajukan Setoran</span>
            </button>
            <ThemeToggle />
            <button
              onClick={openChangePasswordModal}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Ganti Password"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ganti Password</span>
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* Self Deposit Success Notice */}
        {depositSuccessAlert && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold">Pengajuan Setoran Mandiri Berhasil Terkirim</p>
                <p className="mt-0.5 text-emerald-800 dark:text-emerald-300">{depositSuccessAlert}</p>
                <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                  ℹ️ <strong>Bukan ACC Langsung</strong>: Saldo Anda baru akan bertambah setelah pengurus menerima dan memverifikasi timbangan fisik di loket RW 08.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setDepositSuccessAlert(null)}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* SOP Schedule Notice Banner */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
              <Clock className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-white">Jadwal Operasional Kp. Curug RW 08:</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">SOP Resmi</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                Setoran harian: <strong>09.00 - 15.00 WIB</strong> · Hari pemilahan sampah khusus: Setiap <strong>Kamis pukul 13.00 WIB</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="/assets/docs/SOP_Bank_Sampah_Persatuan.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh SOP (PDF)</span>
            </a>
          </div>
        </div>

        {/* Ringkasan Statistik Setoran & Poin Nasabah */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Ringkasan Statistik Kontribusi Sampah & Poin Nasabah</span>
            </h3>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono hidden sm:inline">
              Terverifikasi BSP KREASI 308
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Card 1: Total Berat Sampah */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Sampah Disetor</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  <Scale className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
                  {user?.totalWeightDeposited || 0}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Kg</span>
              </div>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                Volume sampah terpilah dari rumah
              </p>
            </div>

            {/* Card 2: Total Poin / Saldo Terkumpul */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Poin / Nilai Tabungan</span>
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                  <Coins className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums block">
                {formatRupiah(user?.totalEarned || 0)}
              </span>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                Akumulasi seluruh hasil konversi
              </p>
            </div>

            {/* Card 3: Saldo Tersedia */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Saldo Tersedia Saat Ini</span>
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold text-blue-700 dark:text-blue-400 font-mono tabular-nums block">
                {formatRupiah(user?.saldo || 0)}
              </span>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                Dapat ditarik tunai sewaktu-waktu
              </p>
            </div>

            {/* Card 4: Transaksi & Status Buku */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Riwayat Setoran</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
                  {deposits.length}
                </span>
                <span className="text-xs font-bold text-neutral-500">kali setor</span>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Buku Tabungan Aktif</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile & Balance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Main Balance Card */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-white shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[160px]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-200">Saldo Tabungan Tersedia</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 font-mono tabular-nums">
                  {formatRupiah(user?.saldo || 0)}
                </h2>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-emerald-200" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-white/15 text-xs">
              <div>
                <p className="text-emerald-300/80">Total Setoran:</p>
                <p className="font-bold text-sm sm:text-base font-mono tabular-nums mt-0.5">
                  {user?.totalWeightDeposited || 0} kg
                </p>
              </div>
              <div>
                <p className="text-emerald-300/80">Total Penghasilan:</p>
                <p className="font-bold text-sm sm:text-base font-mono tabular-nums mt-0.5">
                  {formatRupiah(user?.totalEarned || 0)}
                </p>
              </div>
              <div>
                <p className="text-emerald-300/80">Telah Ditarik:</p>
                <p className="font-bold text-sm sm:text-base font-mono tabular-nums mt-0.5">
                  {formatRupiah(user?.totalWithdrawn || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Nasabah Identity Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  <UserIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Identitas Nasabah Resmi</span>
                </div>
                <img 
                  src="/assets/images/logo_bank_sampah.png" 
                  alt="Logo" 
                  className="w-7 h-7 object-contain rounded-full shadow-xs border border-neutral-200 dark:border-neutral-700 bg-white"
                />
              </div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">{user?.name}</h3>
              <p className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">{user?.id}</p>
              
              <div className="mt-3 space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                <p><span className="text-neutral-400 dark:text-neutral-500">Wilayah Domisili:</span> <span className="font-semibold text-emerald-800 dark:text-emerald-300">{user?.rt} · {user?.rw || 'RW 08'}</span></p>
                <p><span className="text-neutral-400 dark:text-neutral-500">Nomor HP:</span> {user?.phone}</p>
                <p><span className="text-neutral-400 dark:text-neutral-500">Alamat:</span> {user?.address}</p>
                <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="text-neutral-400 dark:text-neutral-500 block text-[10px]">Ketentuan Buku Tabungan (SOP 1):</span>
                  {(user?.hasPhysicalBook || (user?.saldo || 0) >= 20000 || deposits.length >= 3) ? (
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Buku Tabungan Fisik Diterbitkan</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block mt-0.5">
                      Syarat: 3x setor atau saldo Rp20.000
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
              <button
                onClick={handleOpenPassbook}
                className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>Buka Buku Tabungan Resmi</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
                <span>Status Akun:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">Aktif (Terdaftar)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-neutral-200/70 dark:bg-neutral-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'deposits'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Riwayat Setoran ({deposits.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'withdrawals'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
            <span>Riwayat Penarikan ({withdrawals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('mutations')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'mutations'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Buku Mutasi Saldo ({mutations.length})</span>
          </button>
        </div>

        {/* Tab 1: Deposits History */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            {/* Nasabah Self Deposit Action Banner */}
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                  <UploadCloud className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <span>Ajukan Setoran Sampah Mandiri</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      Bukan ACC Langsung
                    </span>
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Pilah dari rumah, isi estimasi timbangan dan foto bukti. Pengurus akan memeriksa fisik di loket sebelum saldo disetujui.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSelfDepositOpen(true)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajukan Setoran</span>
              </button>
            </div>

            {deposits.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
                <Scale className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Belum ada riwayat setoran</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                  Bawa sampah anorganik terpilah Anda langsung ke loket Bank Sampah Persatuan atau ajukan formulir setoran mandiri disertai foto dari rumah.
                </p>
                <button
                  onClick={() => setIsSelfDepositOpen(true)}
                  className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajukan Setoran Mandiri Sekarang</span>
                </button>
              </div>
            ) : (
              deposits.map((dep) => (
                <div 
                  key={dep.id} 
                  className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4"
                >
                  {/* Header Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-neutral-900">{dep.id}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-xs text-neutral-500">{formatDate(dep.date)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {dep.status === 'DISETUJUI' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Disetujui</span>
                        </span>
                      )}
                      {dep.status === 'MENUNGGU_VERIFIKASI' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Menunggu Verifikasi</span>
                        </span>
                      )}
                      {dep.status === 'DITOLAK' && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Dibatalkan / Ditolak</span>
                        </span>
                      )}

                      {dep.status === 'DISETUJUI' && (
                        <button
                          onClick={() => setReceiptDeposit(dep)}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1"
                        >
                          <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Lihat Struk</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items list & Photo */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Items table */}
                    <div className="md:col-span-8 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-neutral-100 text-neutral-500 text-left">
                            <th className="pb-2 font-medium">Jenis Sampah</th>
                            <th className="pb-2 font-medium text-right">Berat</th>
                            <th className="pb-2 font-medium text-right">Harga Snapshot</th>
                            <th className="pb-2 font-medium text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                          {dep.items.map((it, i) => (
                            <tr key={i} className="hover:bg-neutral-50/50">
                              <td className="py-2 font-medium text-neutral-800">{it.wasteTypeName}</td>
                              <td className="py-2 text-right font-mono tabular-nums">{it.weight} kg</td>
                              <td className="py-2 text-right font-mono tabular-nums text-neutral-500">
                                {formatRupiah(it.snapshotPricePerKg)}
                              </td>
                              <td className="py-2 text-right font-mono font-semibold text-neutral-900 tabular-nums">
                                {formatRupiah(it.subtotal)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-neutral-200 font-semibold text-neutral-900">
                            <td className="pt-2">Total Setoran</td>
                            <td className="pt-2 text-right font-mono tabular-nums">{dep.totalWeight} kg</td>
                            <td></td>
                            <td className="pt-2 text-right font-mono text-emerald-700 text-sm tabular-nums">
                              {formatRupiah(dep.totalAmount)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Photo Proof */}
                    <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-neutral-100 md:pl-4 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] font-medium text-neutral-500 mb-1.5">Foto Bukti Timbangan:</p>
                        <div 
                          onClick={() => setSelectedPhoto(dep.photoUrl)}
                          className="relative aspect-video rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 cursor-pointer group"
                        >
                          <img
                            src={dep.photoUrl}
                            alt={`Bukti transaksi ${dep.id}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs gap-1 font-semibold">
                            <Eye className="w-4 h-4" />
                            <span>Perbesar Foto</span>
                          </div>
                        </div>
                      </div>

                      {dep.notes && (
                        <p className="text-[11px] text-neutral-500 italic mt-2">
                          Catatan: "{dep.notes}"
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Withdrawals History */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-neutral-200">
                <ArrowDownLeft className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-700">Belum ada riwayat penarikan tunai</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Saldo tabungan Anda akan terus bertambah seiring setoran rutin dan dapat ditarik tunai kapan saja di kantor sekretariat.
                </p>
              </div>
            ) : (
              withdrawals.map((item) => (
                <div 
                  key={item.id}
                  className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-neutral-900">{item.id}</span>
                      <span className="text-neutral-400">·</span>
                      <span className="text-xs text-neutral-500">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1">
                      Penarikan uang tunai diserahkan oleh petugas: <span className="font-medium text-neutral-800">{item.adminName}</span>
                    </p>
                    {item.notes && (
                      <p className="text-xs text-neutral-400 italic mt-0.5">Catatan: {item.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-neutral-500 block">Nominal Tunai:</span>
                      <span className="text-lg font-bold font-mono text-neutral-900 tabular-nums">
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                    <button
                      onClick={() => setReceiptWithdrawal(item)}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Kwitansi</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Mutations Ledger */}
        {activeTab === 'mutations' && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-100 bg-neutral-50/60">
              <h3 className="text-sm font-bold text-neutral-900">Buku Mutasi Tabungan</h3>
              <p className="text-xs text-neutral-500">Catatan kronologis mutasi saldo, setoran, dan penarikan</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                  <tr>
                    <th className="py-2.5 px-4 font-medium">Waktu Transaksi</th>
                    <th className="py-2.5 px-4 font-medium">Tipe</th>
                    <th className="py-2.5 px-4 font-medium">Keterangan / Ref</th>
                    <th className="py-2.5 px-4 font-medium text-right">Mutasi (Rp)</th>
                    <th className="py-2.5 px-4 font-medium text-right">Saldo Sesudah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {mutations.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50/50">
                      <td className="py-2.5 px-4 font-mono text-neutral-600 whitespace-nowrap">
                        {formatDate(m.date)}
                      </td>
                      <td className="py-2.5 px-4">
                        {m.type === 'SETORAN' && (
                          <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            SETORAN (+)
                          </span>
                        )}
                        {m.type === 'PENARIKAN' && (
                          <span className="font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                            PENARIKAN (-)
                          </span>
                        )}
                        {m.type === 'KOREKSI' && (
                          <span className="font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                            KOREKSI
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-neutral-800">
                        {m.description}
                      </td>
                      <td className={`py-2.5 px-4 text-right font-mono font-semibold tabular-nums ${
                        m.amount > 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {m.amount > 0 ? `+${formatRupiah(m.amount)}` : `-${formatRupiah(Math.abs(m.amount))}`}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                        {formatRupiah(m.balanceAfter)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Photo Modal Preview */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-neutral-900 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedPhoto}
              alt="Foto Bukti Setoran"
              className="max-h-[85vh] w-auto object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {/* Receipt Modals */}
      <ReceiptModal
        deposit={receiptDeposit}
        withdrawal={receiptWithdrawal}
        onClose={() => {
          setReceiptDeposit(null);
          setReceiptWithdrawal(null);
        }}
      />

      {/* Official Passbook Modal */}
      {user && (
        <PassbookModal
          isOpen={passbookData.isOpen}
          onClose={() => setPassbookData(prev => ({ ...prev, isOpen: false }))}
          user={user}
          entries={passbookData.entries}
          summary={passbookData.summary}
        />
      )}

      {/* Nasabah Self Deposit Modal (Bukan ACC Langsung) */}
      {user && (
        <NasabahSelfDepositModal
          isOpen={isSelfDepositOpen}
          onClose={() => setIsSelfDepositOpen(false)}
          user={user}
          wasteTypes={wasteTypes}
          onSuccess={(newDeposit) => {
            setDeposits(prev => [newDeposit, ...prev]);
            setDepositSuccessAlert(`Pengajuan setoran #${newDeposit.id} sebesar ${newDeposit.totalWeight} kg berhasil dikirim! Menunggu verifikasi fisik & timbangan oleh pengurus di loket.`);
            refreshUser();
          }}
        />
      )}
    </div>
  );
};
