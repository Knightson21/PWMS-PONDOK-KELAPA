import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { 
  User, 
  WasteType, 
  DepositTransaction, 
  Withdrawal, 
  Mutation, 
  AuditLog,
  WilayahRT,
  WilayahConfig,
  RtStatistic
} from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { PassbookModal } from '../components/PassbookModal';
import { ThemeToggle } from '../components/ThemeToggle';
import { DepositGoogleForm } from '../components/admin/DepositGoogleForm';
import { DepositSpreadsheetGrid } from '../components/admin/DepositSpreadsheetGrid';
import { 
  LayoutDashboard, 
  Scale, 
  Users, 
  Tags, 
  Wallet, 
  FileSpreadsheet, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RotateCcw, 
  Receipt, 
  LogOut, 
  KeyRound, 
  Search, 
  Camera, 
  Download, 
  Trash2, 
  AlertCircle,
  Eye,
  X,
  Edit2,
  MapPin,
  Building,
  BarChart3,
  ToggleLeft,
  ToggleRight,
  Filter,
  BookOpen,
  UserCheck,
  Printer,
  Database,
  Save,
  UploadCloud,
  FileCode
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { logout, openChangePasswordModal } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'deposits' | 'buku2026' | 'nasabah' | 'wilayah' | 'wasteTypes' | 'withdrawals' | 'mutations' | 'reports' | 'database'
  >('overview');

  // Rekap 2026 State
  const [rekap2026Data, setRekap2026Data] = useState<any>(null);
  const [rekapMonthFilter, setRekapMonthFilter] = useState<string>('ALL');
  const [rekapRtFilter, setRekapRtFilter] = useState<string>('ALL');
  const [rekapSearch, setRekapSearch] = useState<string>('');
  const [rekapLoading, setRekapLoading] = useState<boolean>(false);

  // Passbook Modal State
  const [passbookModal, setPassbookModal] = useState<{
    isOpen: boolean;
    user: User | null;
    entries: any[];
    summary: any;
  }>({
    isOpen: false,
    user: null,
    entries: [],
    summary: {
      totalWeightKg: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
      currentBalance: 0,
      totalTransactions: 0
    }
  });

  // Core Data
  const [nasabahList, setNasabahList] = useState<User[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [mutations, setMutations] = useState<Mutation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  
  // Wilayah Data
  const [wilayahConfig, setWilayahConfig] = useState<WilayahConfig | null>(null);
  const [wilayahRtList, setWilayahRtList] = useState<WilayahRT[]>([]);
  const [rtStats, setRtStats] = useState<RtStatistic[]>([]);
  
  // Filter States
  const [selectedRtFilter, setSelectedRtFilter] = useState<string>('ALL');
  const [depositFilter, setDepositFilter] = useState<string>('ALL');
  const [nasabahSearch, setNasabahSearch] = useState<string>('');

  // Modals & Forms State
  const [isNewDepositOpen, setIsNewDepositOpen] = useState(false);
  const [depositViewMode, setDepositViewMode] = useState<'list' | 'googleForm' | 'spreadsheet'>('list');
  const [isNewNasabahOpen, setIsNewNasabahOpen] = useState(false);
  const [isEditNasabahOpen, setIsEditNasabahOpen] = useState(false);
  const [selectedNasabahForEdit, setSelectedNasabahForEdit] = useState<User | null>(null);
  
  const [isNewRtModalOpen, setIsNewRtModalOpen] = useState(false);
  const [isEditRtModalOpen, setIsEditRtModalOpen] = useState(false);
  const [selectedRtForEdit, setSelectedRtForEdit] = useState<WilayahRT | null>(null);
  const [isEditRwConfigModalOpen, setIsEditRwConfigModalOpen] = useState(false);

  const [isWasteTypeModalOpen, setIsWasteTypeModalOpen] = useState(false);
  const [selectedWasteTypeForEdit, setSelectedWasteTypeForEdit] = useState<WasteType | null>(null);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isCorrectModalOpen, setIsCorrectModalOpen] = useState(false);
  const [selectedDepositForCorrect, setSelectedDepositForCorrect] = useState<DepositTransaction | null>(null);
  const [rejectReasonModal, setRejectReasonModal] = useState<{ id: string; isOpen: boolean }>({ id: '', isOpen: false });
  const [rejectReasonText, setRejectReasonText] = useState('');
  
  // Inspection & receipts
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [receiptDeposit, setReceiptDeposit] = useState<DepositTransaction | null>(null);
  const [receiptWithdrawal, setReceiptWithdrawal] = useState<Withdrawal | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Database Management State
  const [dbBackupData, setDbBackupData] = useState<any>(null);
  const [dbBackupStats, setDbBackupStats] = useState<any>(null);
  const [dbJsonText, setDbJsonText] = useState<string>('');
  const [dbIsLoading, setDbIsLoading] = useState<boolean>(false);
  const [dbSaveSuccess, setDbSaveSuccess] = useState<string | null>(null);
  const [dbSaveError, setDbSaveError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);

  const loadDatabaseBackup = async () => {
    try {
      setDbIsLoading(true);
      setDbSaveError(null);
      const res = await api.getDatabaseBackup();
      setDbBackupData(res.db);
      setDbBackupStats(res.stats);
      setDbJsonText(JSON.stringify(res.db, null, 2));
    } catch (err: any) {
      setDbSaveError(err.message || 'Gagal mengambil data basis data');
    } finally {
      setDbIsLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    if (!dbBackupData) return;
    const jsonStr = JSON.stringify(dbBackupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `bank-sampah-db-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.users || !parsed.deposits) {
          throw new Error('Format berkas tidak valid: harus memiliki data users dan deposits.');
        }
        setDbJsonText(JSON.stringify(parsed, null, 2));
        setDbBackupData(parsed);
        setDbSaveSuccess(`Berkas ${file.name} berhasil dimuat. Klik "Simpan Perubahan ke Server" untuk menerapkan.`);
        setDbSaveError(null);
      } catch (err: any) {
        setDbSaveError(`Gagal membaca berkas JSON: ${err.message}`);
        setDbSaveSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveJsonToServer = async () => {
    try {
      setIsRestoring(true);
      setDbSaveError(null);
      setDbSaveSuccess(null);
      const parsed = JSON.parse(dbJsonText);
      if (!parsed.users || !parsed.deposits) {
        throw new Error('Format struktur JSON tidak lengkap (wajib ada array users dan deposits).');
      }
      await api.restoreDatabase(parsed);
      setDbSaveSuccess('Basis data server data/db.json berhasil diperbarui dan disimpan permanen!');
      await refreshAllData();
      await loadDatabaseBackup();
    } catch (err: any) {
      setDbSaveError(`Gagal menyimpan ke server: ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Load all data
  const refreshAllData = async () => {
    try {
      const [ov, nsb, wt, dep, wth, mut, aud, rep, wil, statsRt] = await Promise.all([
        api.getAdminOverview(selectedRtFilter),
        api.getNasabahList(nasabahSearch, selectedRtFilter),
        api.getWasteTypes(),
        api.getDeposits(depositFilter, undefined, selectedRtFilter),
        api.getWithdrawals(selectedRtFilter),
        api.getMutations(selectedRtFilter),
        api.getAuditLogs(),
        api.getReports(selectedRtFilter),
        api.getAdminWilayah(),
        api.getRtStatistics()
      ]);
      setOverviewData(ov);
      setNasabahList(nsb);
      setWasteTypes(wt);
      setDeposits(dep);
      setWithdrawals(wth);
      setMutations(mut);
      setAuditLogs(aud);
      setReportsData(rep);
      setWilayahConfig(wil.config);
      setWilayahRtList(wil.rtList);
      setRtStats(statsRt.stats);
    } catch (err: any) {
      console.error('Error loading admin data:', err);
    }
  };

  const loadRekap2026 = async () => {
    setRekapLoading(true);
    try {
      const data = await api.getRekap2026(rekapMonthFilter, rekapRtFilter, rekapSearch);
      setRekap2026Data(data);
    } catch (err: any) {
      console.error('Error loading rekap 2026:', err);
    } finally {
      setRekapLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [selectedRtFilter]);

  useEffect(() => {
    if (activeTab === 'buku2026') {
      loadRekap2026();
    }
  }, [activeTab, rekapMonthFilter, rekapRtFilter, rekapSearch]);

  const handleOpenPassbook = async (nsb: User) => {
    try {
      const data = await api.getNasabahPassbook(nsb.id);
      setPassbookModal({
        isOpen: true,
        user: nsb,
        entries: data.entries,
        summary: data.summary
      });
    } catch (err: any) {
      showNotification(err.message || 'Gagal memuat buku tabungan', true);
    }
  };

  const handleQuickSwitch = async (nasabahId: string) => {
    if (!confirm('Buka portal nasabah ini untuk simulasi / peninjauan akun?')) return;
    try {
      const res = await api.quickDemoLogin(nasabahId);
      localStorage.setItem('pwms_auth_token', res.token);
      window.location.reload();
    } catch (err: any) {
      showNotification(err.message || 'Gagal beralih ke akun nasabah', true);
    }
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setActionErrorMsg(msg);
      setTimeout(() => setActionErrorMsg(null), 5000);
    } else {
      setActionSuccessMsg(msg);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

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

  // Actions
  const handleApproveDeposit = async (depId: string) => {
    if (!confirm(`Konfirmasi persetujuan setoran ${depId}? Saldo nasabah akan ditambahkan.`)) return;
    try {
      const res = await api.approveDeposit(depId);
      showNotification(res.message);
      await refreshAllData();
    } catch (err: any) {
      showNotification(err.message || 'Gagal menyetujui transaksi', true);
    }
  };

  const handleRejectDeposit = async () => {
    if (!rejectReasonText.trim()) {
      alert('Alasan penolakan wajib diisi');
      return;
    }
    try {
      const res = await api.rejectDeposit(rejectReasonModal.id, rejectReasonText.trim());
      showNotification(res.message);
      setRejectReasonModal({ id: '', isOpen: false });
      setRejectReasonText('');
      await refreshAllData();
    } catch (err: any) {
      showNotification(err.message || 'Gagal membatalkan transaksi', true);
    }
  };

  const handleResetPassword = async (nasabahId: string) => {
    if (!confirm(`Reset password untuk nasabah ${nasabahId}? Sistem akan membuatkan password baru sementara.`)) return;
    try {
      const res = await api.resetNasabahPassword(nasabahId);
      alert(`Password Berhasil Direset!\n\nPassword Sementara: ${res.temporaryPassword}\n\nSilakan berikan password ini kepada nasabah.`);
      await refreshAllData();
    } catch (err: any) {
      showNotification(err.message || 'Gagal mereset password', true);
    }
  };

  const handleToggleRtActive = async (rt: WilayahRT) => {
    const newStatus = !rt.isActive;
    const actionText = newStatus ? 'mengaktifkan kembali' : 'menonaktifkan';
    if (!confirm(`Yakin ingin ${actionText} ${rt.nomorRt}? (Data transaksi dan nasabah tetap terjaga).`)) return;
    try {
      await api.updateWilayahRt(rt.id, { isActive: newStatus });
      showNotification(`Wilayah ${rt.nomorRt} berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}`);
      await refreshAllData();
    } catch (err: any) {
      showNotification(err.message || 'Gagal mengubah status RT', true);
    }
  };

  // CSV Export with RT & RW
  const handleExportCSV = () => {
    const headers = ['No Transaksi', 'ID Nasabah', 'Nama Nasabah', 'RT', 'RW', 'Tanggal', 'Total Berat (kg)', 'Total Nilai (Rp)', 'Status'];
    const rows = deposits.map(d => [
      d.id,
      d.nasabahId,
      `"${d.nasabahName}"`,
      d.nasabahRt || '-',
      d.nasabahRw || '-',
      d.date,
      d.totalWeight,
      d.totalAmount,
      d.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_setoran_banksampah_${selectedRtFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/images/logo_bank_sampah.png" 
              alt="Logo Bank Sampah Persatuan" 
              className="w-10 h-10 object-contain rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 bg-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                  Bank Sampah Persatuan
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  KREASI 308
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Lingkup: <span className="font-semibold text-emerald-800 dark:text-emerald-400">{wilayahConfig?.namaWilayah || 'RW 08'}</span> · Panel Operasional PWMS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={openChangePasswordModal}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ubah Password Admin</span>
            </button>
            <button
              onClick={logout}
              className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Notifications */}
      {actionSuccessMsg && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        </div>
      )}
      {actionErrorMsg && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionErrorMsg}</span>
          </div>
        </div>
      )}

      {/* Navigation Sub-bar */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 overflow-x-auto py-2">
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'overview' 
                  ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-sm' 
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ringkasan</span>
            </button>

            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'deposits' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Scale className="w-4 h-4 text-emerald-500" />
              <span>Setoran Sampah</span>
              {overviewData?.pendingVerificationCount > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] rounded-full font-bold">
                  {overviewData.pendingVerificationCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('buku2026')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'buku2026' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500" />
              <span>Rekap Transaksi 2026</span>
              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                10 Bln
              </span>
            </button>

            <button
              onClick={() => setActiveTab('nasabah')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'nasabah' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Data Nasabah</span>
            </button>

            <button
              onClick={() => setActiveTab('wilayah')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'wilayah' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Wilayah RT & RW</span>
            </button>

            <button
              onClick={() => setActiveTab('wasteTypes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'wasteTypes' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Tags className="w-4 h-4 text-indigo-500" />
              <span>Jenis & Harga</span>
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'withdrawals' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Wallet className="w-4 h-4 text-amber-500" />
              <span>Penarikan Tunai</span>
            </button>

            <button
              onClick={() => setActiveTab('mutations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'mutations' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-purple-500" />
              <span>Mutasi & Audit Log</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reports' ? 'bg-neutral-900 text-white shadow-sm' : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-500" />
              <span>Laporan Operasional</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('database');
                loadDatabaseBackup();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'database' ? 'bg-neutral-900 dark:bg-emerald-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
              <span>Basis Data Server</span>
            </button>
          </div>

          {/* Global RT Filter Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-neutral-400" />
              <span>Filter RT:</span>
            </span>
            <select
              value={selectedRtFilter}
              onChange={(e) => setSelectedRtFilter(e.target.value)}
              className="p-1.5 text-xs font-semibold rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Semua RT ({wilayahConfig?.nomorRw || 'RW 08'})</option>
              {wilayahRtList.map((rt) => (
                <option key={rt.id} value={rt.nomorRt}>
                  {rt.nomorRt} {rt.ketuaRt ? `(${rt.ketuaRt})` : ''} {!rt.isActive ? '(Nonaktif)' : ''}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW & RT CONTRIBUTIONS */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Filter Indicator Banner */}
            {selectedRtFilter !== 'ALL' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Menampilkan statistik khusus untuk wilayah <strong>{selectedRtFilter}</strong> ({wilayahConfig?.nomorRw}).</span>
                </div>
                <button
                  onClick={() => setSelectedRtFilter('ALL')}
                  className="font-semibold underline hover:text-emerald-950"
                >
                  Tampilkan Semua RT
                </button>
              </div>
            )}

            {/* Pending Verification Banner */}
            {overviewData?.pendingVerificationCount > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      Ada {overviewData.pendingVerificationCount} Transaksi Setoran Menunggu Verifikasi
                    </h4>
                    <p className="text-xs text-amber-700">
                      Periksa rincian timbangan dan foto bukti untuk menyetujui penambahan saldo nasabah.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setDepositFilter('MENUNGGU_VERIFIKASI');
                    setActiveTab('deposits');
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors whitespace-nowrap"
                >
                  Periksa Sekarang
                </button>
              </div>
            )}

            {/* Metrics KPI Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">
                  {selectedRtFilter === 'ALL' ? 'Total Sampah RW 05' : `Total Sampah ${selectedRtFilter}`}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-1 font-mono tabular-nums">
                  {overviewData?.totalWeightKg || 0} kg
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Dari transaksi terverifikasi</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">
                  {selectedRtFilter === 'ALL' ? 'Nilai Tabungan Terdistribusi' : `Tabungan Warga ${selectedRtFilter}`}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1 font-mono tabular-nums">
                  {formatRupiah(overviewData?.totalEconomicValueRp || 0)}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Hasil konversi sampah terpilah</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">
                  {selectedRtFilter === 'ALL' ? 'Saldo Beredar Nasabah' : `Saldo Nasabah ${selectedRtFilter}`}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-700 mt-1 font-mono tabular-nums">
                  {formatRupiah(overviewData?.currentOutstandingBalance || 0)}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Milik pribadi masing-masing nasabah</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm">
                <p className="text-xs font-medium text-neutral-500">
                  {selectedRtFilter === 'ALL' ? 'Total Penarikan Kas' : `Penarikan Warga ${selectedRtFilter}`}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-700 mt-1 font-mono tabular-nums">
                  {formatRupiah(overviewData?.totalWithdrawalsRp || 0)}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Uang tunai telah diserahkan</p>
              </div>
            </div>

            {/* RT Contribution Comparison Chart / Progress Bars */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    <span>Perbandingan Kontribusi Pemilahan Sampah Antar-RT di {wilayahConfig?.nomorRw}</span>
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Membandingkan volume sampah (kg), nasabah aktif, dan perputaran ekonomi per RT.
                  </p>
                </div>
                <div className="text-xs text-neutral-500">
                  Total Nasabah RW: <span className="font-bold text-neutral-800">{overviewData?.totalNasabah} orang</span>
                </div>
              </div>

              {/* Progress bars list */}
              <div className="space-y-4 pt-1">
                {rtStats.map((st) => (
                  <div key={st.rtId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 font-mono">{st.nomorRt}</span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-600">{st.totalNasabah} nasabah ({st.totalNasabahActive} aktif)</span>
                        {!st.isActive && (
                          <span className="text-[10px] text-neutral-400 font-semibold">(Nonaktif)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono tabular-nums text-neutral-600">{st.totalWeightKg} kg</span>
                        <span className="font-mono font-bold text-emerald-700 tabular-nums">
                          {formatRupiah(st.totalDepositRp)}
                        </span>
                        <span className="w-12 text-right font-mono font-bold text-neutral-800 text-[11px]">
                          {st.percentageContribution}%
                        </span>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, st.percentageContribution))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl text-[11px] text-neutral-500 border border-neutral-100 mt-2">
                <strong>Catatan Keuangan:</strong> Saldo tabungan adalah hak milik pribadi masing-masing nasabah dan tidak digabungkan menjadi kas kolektif RT.
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-700">Aksi Operasional Loket:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsNewDepositOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Setoran Baru</span>
                </button>
                <button
                  onClick={() => setIsWithdrawalModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Catat Penarikan Tunai</span>
                </button>
                <button
                  onClick={() => setIsNewNasabahOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Pendaftaran Nasabah Baru</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: SETORAN SAMPAH */}
        {/* ========================================================= */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            
            {/* View Mode Switcher: Form Google Form vs Spreadsheet vs List */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setDepositViewMode('list')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                    depositViewMode === 'list'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Daftar Setoran ({deposits.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositViewMode('googleForm')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                    depositViewMode === 'googleForm'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <span>📋</span>
                  <span>Formulir Input (Google Form)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositViewMode('spreadsheet')}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                    depositViewMode === 'spreadsheet'
                      ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Spreadsheet Interaktif (Excel Grid)</span>
                </button>
              </div>

              {depositViewMode === 'list' && (
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor CSV</span>
                  </button>
                  <button
                    onClick={() => setDepositViewMode('googleForm')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buka Formulir</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sub-view: Google Form */}
            {depositViewMode === 'googleForm' && (
              <DepositGoogleForm
                nasabahList={nasabahList}
                wasteTypes={wasteTypes}
                onSuccess={(newDep) => {
                  setDeposits(prev => [newDep, ...prev]);
                  showNotification(`Setoran ${newDep.id} (${newDep.nasabahName}) berhasil dicatat.`);
                  refreshAllData();
                }}
                onSwitchToSpreadsheet={() => setDepositViewMode('spreadsheet')}
              />
            )}

            {/* Sub-view: Spreadsheet Grid */}
            {depositViewMode === 'spreadsheet' && (
              <DepositSpreadsheetGrid
                nasabahList={nasabahList}
                wasteTypes={wasteTypes}
                onSuccess={(newDeps) => {
                  setDeposits(prev => [...newDeps, ...prev]);
                  showNotification(`Berhasil mencatat ${newDeps.length} transaksi setoran massal via Spreadsheet.`);
                  refreshAllData();
                }}
                onSwitchToGoogleForm={() => setDepositViewMode('googleForm')}
              />
            )}

            {/* Sub-view: Existing List View */}
            {depositViewMode === 'list' && (
              <>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Filter Status:</span>
                    <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                      {['ALL', 'MENUNGGU_VERIFIKASI', 'DISETUJUI', 'DITOLAK'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setDepositFilter(st)}
                          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                            depositFilter === st
                              ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          {st === 'ALL' ? 'Semua' : st.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDepositViewMode('spreadsheet')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Mode Spreadsheet Grid</span>
                    </button>
                    <button
                      onClick={() => setDepositViewMode('googleForm')}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Form Input Baru</span>
                    </button>
                  </div>
                </div>

                {/* Deposits List */}
                <div className="space-y-4">
              {deposits
                .filter(d => depositFilter === 'ALL' || d.status === depositFilter)
                .map((dep) => (
                  <div 
                    key={dep.id} 
                    className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="font-mono text-sm font-bold text-neutral-900">{dep.id}</span>
                        <span className="text-neutral-300">|</span>
                        <div>
                          <span className="text-xs font-bold text-neutral-900">{dep.nasabahName}</span>
                          <span className="text-xs text-neutral-500 font-mono ml-1.5">({dep.nasabahId})</span>
                          <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {dep.nasabahRt || 'RT 01'} · {dep.nasabahRw || 'RW 05'}
                          </span>
                        </div>
                        <span className="text-neutral-300">|</span>
                        <span className="text-xs text-neutral-500">{formatDate(dep.date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {dep.status === 'MENUNGGU_VERIFIKASI' && (
                          <>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              <span>Menunggu Verifikasi</span>
                            </span>
                            <button
                              onClick={() => handleApproveDeposit(dep.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                            <button
                              onClick={() => setRejectReasonModal({ id: dep.id, isOpen: true })}
                              className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Batalkan</span>
                            </button>
                          </>
                        )}

                        {dep.status === 'DISETUJUI' && (
                          <>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Disetujui</span>
                            </span>
                            <button
                              onClick={() => {
                                setSelectedDepositForCorrect(dep);
                                setIsCorrectModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Koreksi</span>
                            </button>
                            <button
                              onClick={() => setReceiptDeposit(dep)}
                              className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1"
                            >
                              <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Struk</span>
                            </button>
                          </>
                        )}

                        {dep.status === 'DITOLAK' && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Dibatalkan</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
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
                            {dep.items.map((it, idx) => (
                              <tr key={idx}>
                                <td className="py-1.5 font-medium text-neutral-900">{it.wasteTypeName}</td>
                                <td className="py-1.5 text-right font-mono tabular-nums">{it.weight} kg</td>
                                <td className="py-1.5 text-right font-mono tabular-nums text-neutral-500">
                                  {formatRupiah(it.snapshotPricePerKg)}
                                </td>
                                <td className="py-1.5 text-right font-mono font-semibold text-neutral-900 tabular-nums">
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

                      <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-neutral-100 md:pl-4">
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
                    </div>
                  </div>
                ))}
            </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB: REKAP TRANSAKSI & PENJUALAN BSP 2026 (INTERNAL) */}
        {/* ========================================================= */}
        {activeTab === 'buku2026' && (
          <div className="space-y-5">
            
            {/* Header Banner */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-xs">
                  <BookOpen className="w-6 h-6 text-emerald-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-neutral-900">
                      Buku Rekap Transaksi & Penjualan BSP 2026
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Januari - Oktober 2026
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-600">
                      Internal Pengelola
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Rekapitulasi resmi seluruh penimbangan nasabah, pengepul, dan off-taker Bank Sampah Persatuan (Kreasi 308).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 border border-neutral-300"
                >
                  <Printer className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Cetak Rekap</span>
                </button>
                <button
                  onClick={() => {
                    const rows = rekap2026Data?.transactions || [];
                    if (!rows.length) return;
                    const csvContent = "data:text/csv;charset=utf-8," 
                      + ["No,Tanggal,Bulan,Nama Nasabah,RT,Alamat,Jenis Sampah,Berat (Kg),Harga/Kg,Total (Rp)"]
                      .concat(rows.map((r: any, idx: number) => 
                        `${idx+1},"${r.rawDate}","${r.month}","${r.nasabahName}","${r.rt}","${r.address}","${r.jenisSampah}",${r.beratKg},${r.hargaPerKg},${r.totalRp}`
                      )).join("\n");
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", `Rekap_Transaksi_BSP_2026_${rekapMonthFilter}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-xs font-medium">Total Sampah Dikelola</span>
                  <Scale className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">
                  {rekap2026Data?.summary?.totalBeratKg?.toLocaleString('id-ID') || '0'} <span className="text-sm font-sans font-semibold text-neutral-500">kg</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">Semua jenis anorganik & jelantah</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-xs font-medium">Total Nilai Tabungan</span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-800 font-mono">
                  {formatRupiah(rekap2026Data?.summary?.totalNilaiRp || 0)}
                </div>
                <span className="text-[11px] text-neutral-500">Nilai ekonomi diterima nasabah</span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-xs font-medium">Rata-Rata Transaksi</span>
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">
                  {formatRupiah(rekap2026Data?.summary?.averagePerTransaksiRp || 0)}
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  ± {rekap2026Data?.summary?.averagePerTransaksiKg || 0} kg / transaksi
                </span>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-neutral-200 shadow-xs">
                <div className="flex items-center justify-between text-neutral-500 mb-1">
                  <span className="text-xs font-medium">Aktivitas Penyetor</span>
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 font-mono">
                  {rekap2026Data?.summary?.totalPenyetor || 0} <span className="text-sm font-sans font-semibold text-neutral-500">nasabah</span>
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  {rekap2026Data?.summary?.totalTransaksi || 0} baris transaksi sah
                </span>
              </div>
            </div>

            {/* Monthly Selector Ribbon */}
            <div className="bg-white p-3 rounded-2xl border border-neutral-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs px-1 text-neutral-600 font-semibold">
                <span>Pilih Rekap Per Bulan:</span>
                <span className="text-[11px] text-emerald-800">Tahun Buku 2026</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setRekapMonthFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    rekapMonthFilter === 'ALL'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  Semua Bulan (Jan - Okt)
                </button>
                {rekap2026Data?.summary?.byMonth?.map((m: any) => (
                  <button
                    key={m.month}
                    onClick={() => setRekapMonthFilter(m.month)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1.5 ${
                      rekapMonthFilter === m.month
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    <span>{m.month}</span>
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-mono font-bold ${
                      rekapMonthFilter === m.month ? 'bg-emerald-950 text-white' : 'bg-neutral-200 text-neutral-800'
                    }`}>
                      {m.beratKg} kg
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search and RT filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200 shadow-xs">
              <div className="relative min-w-[280px] flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama nasabah, jenis sampah, atau alamat..."
                  value={rekapSearch}
                  onChange={(e) => setRekapSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-semibold whitespace-nowrap">Filter RT:</span>
                <select
                  value={rekapRtFilter}
                  onChange={(e) => setRekapRtFilter(e.target.value)}
                  className="p-2 text-xs font-semibold rounded-xl border border-neutral-300 bg-neutral-50 text-neutral-800"
                >
                  <option value="ALL">Semua RT ({wilayahConfig?.nomorRw || 'RW 08'})</option>
                  {rekap2026Data?.availableRts?.map((r: string) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rekap 2026 Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                    <tr>
                      <th className="py-3 px-3.5 w-12 text-center">No</th>
                      <th className="py-3 px-3.5 w-24">Tanggal</th>
                      <th className="py-3 px-4">Nama Nasabah</th>
                      <th className="py-3 px-3.5">Alamat / RT</th>
                      <th className="py-3 px-4">Jenis Sampah</th>
                      <th className="py-3 px-3.5 text-right font-mono">Berat (Kg)</th>
                      <th className="py-3 px-3.5 text-right font-mono">Harga / Kg</th>
                      <th className="py-3 px-4 text-right font-mono">Total (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 font-sans">
                    {rekapLoading ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-neutral-500">
                          Memuat data buku transaksi 2026...
                        </td>
                      </tr>
                    ) : (rekap2026Data?.transactions?.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-neutral-400">
                          Tidak ada data transaksi yang cocok dengan filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      rekap2026Data?.transactions?.map((trx: any, idx: number) => (
                        <tr key={trx.id || idx} className="hover:bg-neutral-50/70 transition">
                          <td className="py-2.5 px-3.5 text-center text-neutral-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2.5 px-3.5 text-neutral-700 font-mono whitespace-nowrap">{trx.rawDate || trx.date}</td>
                          <td className="py-2.5 px-4 font-semibold text-neutral-900">
                            {trx.nasabahName}
                          </td>
                          <td className="py-2.5 px-3.5 text-emerald-800 font-semibold font-mono whitespace-nowrap">
                            {trx.rt} <span className="text-[11px] font-normal text-neutral-500 font-sans">({trx.address})</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                              {trx.jenisSampah}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono font-bold text-neutral-800">
                            {trx.beratKg}
                          </td>
                          <td className="py-2.5 px-3.5 text-right font-mono text-neutral-600">
                            Rp{trx.hargaPerKg?.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800 text-xs">
                            Rp{trx.totalRp?.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))
                    ))}
                  </tbody>
                  {rekap2026Data?.transactions?.length > 0 && (
                    <tfoot className="bg-emerald-50/70 border-t-2 border-emerald-800 font-bold text-neutral-900 font-mono">
                      <tr>
                        <td colSpan={5} className="py-3 px-4 font-sans uppercase text-xs text-emerald-950">
                          Jumlah Total ({rekapMonthFilter === 'ALL' ? 'Semua Bulan 2026' : rekapMonthFilter})
                        </td>
                        <td className="py-3 px-3.5 text-right text-emerald-950 text-sm">
                          {rekap2026Data?.summary?.totalBeratKg} kg
                        </td>
                        <td></td>
                        <td className="py-3 px-4 text-right text-emerald-950 text-sm">
                          {formatRupiah(rekap2026Data?.summary?.totalNilaiRp || 0)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: DATA NASABAH (107 NASABAH RESMI BERDASARKAN RT/RW) */}
        {/* ========================================================= */}
        {activeTab === 'nasabah' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
              <div className="relative min-w-[280px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari ID, Nama, Username, RT, atau HP..."
                  value={nasabahSearch}
                  onChange={(e) => setNasabahSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500 font-semibold">
                  Total: <strong className="text-neutral-900">{nasabahList.length}</strong> Nasabah Resmi
                </span>
                <button
                  onClick={() => setIsNewNasabahOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Pendaftaran Nasabah Baru</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="py-3 px-4 font-semibold">ID Nasabah</th>
                      <th className="py-3 px-4 font-semibold">Nama Lengkap & Username</th>
                      <th className="py-3 px-3 font-semibold">Jenis</th>
                      <th className="py-3 px-3 font-semibold">RT / RW</th>
                      <th className="py-3 px-3 font-semibold">Kelurahan</th>
                      <th className="py-3 px-3 font-semibold">Nomor HP</th>
                      <th className="py-3 px-3 text-right font-semibold">Total Setoran</th>
                      <th className="py-3 px-4 text-right font-semibold">Saldo Tabungan</th>
                      <th className="py-3 px-3 text-center font-semibold">Buku Fisik</th>
                      <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {nasabahList
                      .filter(u => {
                        const matchSearch = 
                          u.id.toLowerCase().includes(nasabahSearch.toLowerCase()) ||
                          u.name.toLowerCase().includes(nasabahSearch.toLowerCase()) ||
                          (u.username && u.username.toLowerCase().includes(nasabahSearch.toLowerCase())) ||
                          (u.phone && u.phone.includes(nasabahSearch)) ||
                          (u.address && u.address.toLowerCase().includes(nasabahSearch.toLowerCase())) ||
                          (u.rt && u.rt.toLowerCase().includes(nasabahSearch.toLowerCase()));
                        const matchRt = selectedRtFilter === 'ALL' || u.rt === selectedRtFilter;
                        return matchSearch && matchRt;
                      })
                      .map((nsb) => (
                        <tr key={nsb.id} className="hover:bg-neutral-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">{nsb.id}</td>
                          <td className="py-3 px-4 font-medium text-neutral-900">
                            <div>{nsb.name}</div>
                            {nsb.username && (
                              <span className="text-[11px] font-mono text-neutral-600 block">@{nsb.username}</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              nsb.nasabahType === 'lembaga'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {nsb.nasabahType === 'lembaga' ? 'Lembaga' : 'Warga'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                            {nsb.rt} <span className="text-neutral-500 font-normal">/ {nsb.rw || 'RW 08'}</span>
                          </td>
                          <td className="py-3 px-3 text-neutral-600 text-[11px]">
                            {nsb.kelurahan || 'Pondok kelapa'}
                          </td>
                          <td className="py-3 px-3 font-mono text-neutral-600">{nsb.phone || '-'}</td>
                          <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">{nsb.totalWeightDeposited} kg</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums text-xs">
                            {formatRupiah(nsb.saldo)}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {nsb.hasPhysicalBook ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Terbit</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-500 font-mono">
                                Belum
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => handleOpenPassbook(nsb)}
                              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 inline-flex items-center gap-1"
                              title="Buka & Cetak Buku Tabungan Resmi"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Buku Tabungan</span>
                            </button>
                            <button
                              onClick={() => handleQuickSwitch(nsb.id)}
                              className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1"
                              title="Simulasi Login sebagai Nasabah ini"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Demo Akun</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedNasabahForEdit(nsb);
                                setIsEditNasabahOpen(true);
                              }}
                              className="px-2 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5 inline" />
                            </button>
                            <button
                              onClick={() => handleResetPassword(nsb.id)}
                              className="px-2 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                              title="Reset Password Default (123456)"
                            >
                              Reset
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: WILAYAH RT & RW (PENGELOLAAN WILAYAH) */}
        {/* ========================================================= */}
        {activeTab === 'wilayah' && (
          <div className="space-y-6">
            
            {/* Induk RW Configuration Card */}
            <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Wilayah Induk Operasional</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-700 text-white font-mono">
                      {wilayahConfig?.nomorRw}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900 mt-0.5">{wilayahConfig?.namaWilayah}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Ketua RW: <span className="font-medium text-neutral-700">{wilayahConfig?.ketuaRw || '-'}</span> · Seluruh nasabah berada dalam naungan RW ini.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsEditRwConfigModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Pengaturan RW</span>
              </button>
            </div>

            {/* RT List & Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Daftar Wilayah RT ({wilayahConfig?.nomorRw})</h3>
                  <p className="text-xs text-neutral-500">
                    Nasabah wajib dipilih dari RT yang aktif saat pendaftaran. RT yang telah memiliki transaksi tidak boleh dihapus melainkan dinonaktifkan.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewRtModalOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah RT Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wilayahRtList.map((rt) => {
                  const stat = rtStats.find(s => s.nomorRt === rt.nomorRt);
                  return (
                    <div 
                      key={rt.id} 
                      className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col justify-between transition-all ${
                        rt.isActive ? 'border-neutral-200 hover:border-emerald-300' : 'border-neutral-200 opacity-60 bg-neutral-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-base font-extrabold text-neutral-900">{rt.nomorRt}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            rt.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-neutral-200 text-neutral-600'
                          }`}>
                            {rt.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-neutral-600 mb-4">
                          <p><span className="text-neutral-400">Ketua RT:</span> {rt.ketuaRt || '-'}</p>
                          <p><span className="text-neutral-400">Kontak:</span> {rt.phone || '-'}</p>
                          <p><span className="text-neutral-400">Cakupan:</span> {rt.description || '-'}</p>
                        </div>

                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Total Nasabah:</span>
                            <span className="font-bold text-neutral-900 font-mono">{stat?.totalNasabah || 0} orang</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 block">Sampah Terkumpul:</span>
                            <span className="font-bold text-emerald-700 font-mono">{stat?.totalWeightKg || 0} kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <button
                          onClick={() => handleToggleRtActive(rt)}
                          className={`text-xs font-semibold flex items-center gap-1 ${
                            rt.isActive ? 'text-amber-700 hover:text-amber-800' : 'text-emerald-700 hover:text-emerald-800'
                          }`}
                        >
                          {rt.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          <span>{rt.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRtForEdit(rt);
                            setIsEditRtModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Ubah RT</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: JENIS & HARGA SAMPAH */}
        {/* ========================================================= */}
        {activeTab === 'wasteTypes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Katalog Master Jenis & Harga Sampah</h3>
                <p className="text-xs text-neutral-500">
                  Perubahan harga otomatis diterapkan untuk transaksi baru tanpa mengubah snapshot harga transaksi lama.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedWasteTypeForEdit(null);
                  setIsWasteTypeModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jenis Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wasteTypes.map((wt) => (
                <div 
                  key={wt.id}
                  className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                      <span>{wt.category}</span>
                      <span className="font-mono">{wt.id}</span>
                    </div>
                    <h4 className="text-base font-bold text-neutral-900">{wt.name}</h4>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-neutral-500 block">Harga Terkini:</span>
                      <span className="text-lg font-extrabold text-emerald-700 font-mono tabular-nums">
                        {formatRupiah(wt.pricePerKg)}
                      </span>
                      <span className="text-xs text-neutral-500 ml-1">/{wt.unit}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedWasteTypeForEdit(wt);
                        setIsWasteTypeModalOpen(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah Harga</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: PENARIKAN TUNAI */}
        {/* ========================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Pencatatan Penarikan Uang Tunai</h3>
                <p className="text-xs text-neutral-500">
                  Nasabah hadir langsung di kantor. Sistem memvalidasi saldo dan mencatat penyerahan uang secara aman.
                </p>
              </div>
              <button
                onClick={() => setIsWithdrawalModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Catat Penarikan Baru</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="py-3 px-4 font-semibold">No Penarikan</th>
                      <th className="py-3 px-4 font-semibold">Tanggal</th>
                      <th className="py-3 px-4 font-semibold">Nasabah</th>
                      <th className="py-3 px-4 font-semibold">Wilayah</th>
                      <th className="py-3 px-4 font-semibold text-right">Nominal Tunai</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Kwitansi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-neutral-400">
                          Belum ada riwayat penarikan uang tunai
                        </td>
                      </tr>
                    ) : (
                      withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-neutral-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-900">{w.id}</td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{formatDate(w.date)}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-neutral-900 block">{w.nasabahName}</span>
                            <span className="text-[11px] text-neutral-400 font-mono">{w.nasabahId}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-emerald-800">
                            {w.nasabahRt || '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-neutral-900 text-sm tabular-nums">
                            {formatRupiah(w.amount)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800">
                              SELESAI
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setReceiptWithdrawal(w)}
                              className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Receipt className="w-3.5 h-3.5 text-neutral-500" />
                              <span>Struk</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 7: MUTASI SALDO & AUDIT LOG */}
        {/* ========================================================= */}
        {activeTab === 'mutations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/60">
                <h3 className="text-sm font-bold text-neutral-900">Buku Mutasi Saldo Global</h3>
                <p className="text-xs text-neutral-500">Jejak audit perubahan saldo nasabah</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Waktu</th>
                      <th className="py-2.5 px-4 font-medium">Nasabah</th>
                      <th className="py-2.5 px-4 font-medium">Wilayah</th>
                      <th className="py-2.5 px-4 font-medium">Tipe</th>
                      <th className="py-2.5 px-4 font-medium">Keterangan</th>
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
                        <td className="py-2.5 px-4 font-medium text-neutral-900">
                          {m.nasabahName} <span className="font-mono text-neutral-400 text-[11px]">({m.nasabahId})</span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-emerald-800 font-semibold">
                          {m.nasabahRt || '-'}
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
                        <td className="py-2.5 px-4 text-neutral-700">{m.description}</td>
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

            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-neutral-100 bg-neutral-50/60">
                <h3 className="text-sm font-bold text-neutral-900">Log Audit Administratif & Koreksi</h3>
                <p className="text-xs text-neutral-500">Merekam semua aktivitas persetujuan, penolakan, koreksi, dan pengubahan data wilayah</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-4 font-medium">Waktu</th>
                      <th className="py-2.5 px-4 font-medium">Aktor</th>
                      <th className="py-2.5 px-4 font-medium">Aksi</th>
                      <th className="py-2.5 px-4 font-medium">Target</th>
                      <th className="py-2.5 px-4 font-medium">Rincian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-4 font-mono text-neutral-500 whitespace-nowrap">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="py-2.5 px-4 font-medium text-neutral-800">{log.actor}</td>
                        <td className="py-2.5 px-4 font-mono text-[11px] font-semibold text-neutral-700">{log.action}</td>
                        <td className="py-2.5 px-4 font-medium text-neutral-900">{log.target}</td>
                        <td className="py-2.5 px-4 text-neutral-600">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 8: LAPORAN OPERASIONAL & REKAP PER RT */}
        {/* ========================================================= */}
        {activeTab === 'reports' && reportsData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Laporan & Rekapitulasi Operasional Bank Sampah</h3>
                <p className="text-xs text-neutral-500">
                  Menyajikan rekapitulasi per RT, komposisi jenis sampah, dan ringkasan bulanan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                >
                  Cetak Laporan
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Rekap Spreadsheet</span>
                </button>
              </div>
            </div>

            {/* Rekapitulasi Kontribusi Setiap RT */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Rekapitulasi Kontribusi per Wilayah RT ({wilayahConfig?.nomorRw})</h4>
                  <p className="text-xs text-neutral-500">Rincian kontribusi sampah, nilai ekonomi, dan saldo warga per RT</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Wilayah RT</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Nasabah (Aktif/Total)</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Volume Sampah (kg)</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Kontribusi (%)</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Tabungan Terkumpul</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Penarikan Kas</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Saldo Tersimpan Warga</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(reportsData.rtSummary || []).map((row: RtStatistic) => (
                      <tr key={row.rtId} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-4 font-bold text-neutral-900 font-mono">
                          {row.nomorRt} {!row.isActive && <span className="text-[10px] text-neutral-400 font-normal">(Nonaktif)</span>}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums">
                          {row.totalNasabahActive} / {row.totalNasabah}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums">
                          {row.totalWeightKg} kg
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                          {row.percentageContribution}%
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {formatRupiah(row.totalDepositRp)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-700 tabular-nums">
                          {formatRupiah(row.totalWithdrawalRp)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                          {formatRupiah(row.totalSaldoRp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Waste Breakdown Summary Table */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
              <h4 className="text-sm font-bold text-neutral-900">Rekapitulasi Berdasarkan Komposisi Jenis Sampah</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Jenis Sampah</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Frekuensi Setoran</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Akumulasi Berat</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Nilai Tabungan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {Object.entries(reportsData.wasteBreakdown || {}).map(([name, data]: [string, any]) => (
                      <tr key={name} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-4 font-medium text-neutral-900">{name}</td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums">{data.count}x</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums">{data.weight} kg</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {formatRupiah(data.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5 space-y-4">
              <h4 className="text-sm font-bold text-neutral-900">Rekapitulasi Arus Kas Bulanan</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Periode Bulan</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Volume Sampah (kg)</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Setoran Tabungan</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Total Penarikan Kas</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Surplus Tabungan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {(reportsData.monthlySummary || []).map((row: any) => (
                      <tr key={row.month} className="hover:bg-neutral-50/50">
                        <td className="py-2.5 px-4 font-mono font-bold text-neutral-900">{row.month}</td>
                        <td className="py-2.5 px-4 text-right font-mono tabular-nums">{row.weight} kg</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 tabular-nums">
                          {formatRupiah(row.depositAmount)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-700 tabular-nums">
                          {formatRupiah(row.withdrawalAmount)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-neutral-900 tabular-nums">
                          {formatRupiah(row.depositAmount - row.withdrawalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* Tab: Database Server Management & Backup */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            
            {/* Header Card */}
            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>Pusat Data Server & Cadangan (data/db.json)</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Penyimpanan Permanen
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Seluruh transaksi, nasabah, harga sampah, dan mutasi saldo tersimpan langsung di berkas server <code>data/db.json</code>. Anda dapat mengunduh berkas cadangan, memulihkannya, atau menyunting data secara aman.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={loadDatabaseBackup}
                    disabled={dbIsLoading}
                    className="px-3 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition flex items-center gap-1.5"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${dbIsLoading ? 'animate-spin' : ''}`} />
                    <span>Segarkan Data</span>
                  </button>
                  <button
                    onClick={handleDownloadBackup}
                    disabled={!dbBackupData}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Cadangan (.json)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications */}
            {dbSaveSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{dbSaveSuccess}</span>
                </div>
                <button onClick={() => setDbSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {dbSaveError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{dbSaveError}</span>
                </div>
                <button onClick={() => setDbSaveError(null)} className="text-rose-700 hover:text-rose-900">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Akun Pengguna</span>
                <p className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                  {dbBackupStats?.userCount ?? nasabahList.length}
                </p>
                <span className="text-[11px] text-neutral-400">Termasuk Pengurus & Nasabah</span>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Riwayat Setoran</span>
                <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                  {dbBackupStats?.depositCount ?? deposits.length}
                </p>
                <span className="text-[11px] text-neutral-400">Semua transaksi setoran</span>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Transaksi Penarikan Kas</span>
                <p className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-400 mt-1">
                  {dbBackupStats?.withdrawalCount ?? withdrawals.length}
                </p>
                <span className="text-[11px] text-neutral-400">Pencairan saldo warga</span>
              </div>

              <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs">
                <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Katalog Jenis Sampah</span>
                <p className="text-2xl font-bold font-mono text-indigo-700 dark:text-indigo-400 mt-1">
                  {dbBackupStats?.wasteTypeCount ?? wasteTypes.length}
                </p>
                <span className="text-[11px] text-neutral-400">Kategori & harga per kg</span>
              </div>
            </div>

            {/* Upload & Restore Card */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Unggah Berkas Cadangan (Restore Database)
                </h4>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Pilih berkas format <code>.json</code> hasil cadangan sebelumnya untuk dipulihkan ke server. Data yang diunggah akan otomatis menggantikan isi database server saat Anda menekan tombol simpan di bawah.
              </p>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-xl transition inline-flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-600" />
                  <span>Pilih Berkas Cadangan (.json)</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleUploadBackupFile}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-neutral-500">
                  Tip: Pastikan format JSON valid sebelum menerapkan.
                </span>
              </div>
            </div>

            {/* Live JSON Inspector & Direct Editor */}
            <div className="p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Editor & Inspektur Data Berkas Server (Live Editor)
                    </h4>
                    <p className="text-xs text-neutral-500">
                      Anda dapat meninjau atau melakukan penyuntingan manual secara langsung pada data JSON di bawah ini.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (dbBackupData) {
                        setDbJsonText(JSON.stringify(dbBackupData, null, 2));
                        setDbSaveSuccess('Teks editor dikembalikan ke data server saat ini.');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg transition"
                  >
                    Reset Teks
                  </button>
                  <button
                    onClick={handleSaveJsonToServer}
                    disabled={isRestoring || !dbJsonText}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition shadow-xs flex items-center gap-1.5"
                  >
                    <Save className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                    <span>{isRestoring ? 'Menyimpan...' : 'Simpan Perubahan ke Server'}</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={dbJsonText}
                  onChange={(e) => setDbJsonText(e.target.value)}
                  rows={20}
                  spellCheck={false}
                  placeholder="Memuat data JSON dari server data/db.json..."
                  className="w-full p-4 text-xs font-mono bg-neutral-900 text-emerald-300 rounded-xl border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed overflow-x-auto shadow-inner"
                />
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Perubahan yang disimpan langsung diperbarui ke berkas <code>data/db.json</code> di lingkungan AI Studio ini dan otomatis direkam dalam log audit sistem demi keamanan.
                </span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL: TAMBAH WILAYAH RT BARU */}
      {/* ========================================================= */}
      {isNewRtModalOpen && (
        <NewRtModal
          nomorRw={wilayahConfig?.nomorRw || 'RW 05'}
          onClose={() => setIsNewRtModalOpen(false)}
          onSuccess={async () => {
            setIsNewRtModalOpen(false);
            showNotification('Wilayah RT baru berhasil ditambahkan');
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT DATA RT */}
      {/* ========================================================= */}
      {isEditRtModalOpen && selectedRtForEdit && (
        <EditRtModal
          rt={selectedRtForEdit}
          onClose={() => {
            setIsEditRtModalOpen(false);
            setSelectedRtForEdit(null);
          }}
          onSuccess={async () => {
            setIsEditRtModalOpen(false);
            setSelectedRtForEdit(null);
            showNotification('Data RT berhasil diperbarui');
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT PENGATURAN INDUK RW */}
      {/* ========================================================= */}
      {isEditRwConfigModalOpen && wilayahConfig && (
        <EditRwConfigModal
          config={wilayahConfig}
          onClose={() => setIsEditRwConfigModalOpen(false)}
          onSuccess={async () => {
            setIsEditRwConfigModalOpen(false);
            showNotification('Konfigurasi wilayah RW berhasil diperbarui');
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: CATAT SETORAN BARU */}
      {/* ========================================================= */}
      {isNewDepositOpen && (
        <NewDepositModal
          nasabahList={nasabahList.filter(n => n.status === 'active')}
          wasteTypes={wasteTypes.filter(w => w.isActive)}
          onClose={() => setIsNewDepositOpen(false)}
          onSuccess={async (dep) => {
            setIsNewDepositOpen(false);
            showNotification(`Setoran baru #${dep.id} disimpan dengan status Menunggu Verifikasi.`);
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: PENDAFTARAN NASABAH BARU DENGAN PILIHAN RT */}
      {/* ========================================================= */}
      {isNewNasabahOpen && (
        <NewNasabahModal
          activeRts={wilayahRtList.filter(r => r.isActive)}
          defaultRw={wilayahConfig?.nomorRw || 'RW 05'}
          onClose={() => setIsNewNasabahOpen(false)}
          onSuccess={async (res) => {
            setIsNewNasabahOpen(false);
            alert(`Nasabah Berhasil Didaftarkan!\n\nID Nasabah: ${res.user.id}\nNama: ${res.user.name}\nWilayah: ${res.user.rt} / ${res.user.rw}\nNomor HP: ${res.user.phone}\nPassword Awal: ${res.temporaryPassword}\n\nSilakan catat password awal ini untuk nasabah.`);
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT DATA NASABAH (TERMASUK RT) */}
      {/* ========================================================= */}
      {isEditNasabahOpen && selectedNasabahForEdit && (
        <EditNasabahModal
          nasabah={selectedNasabahForEdit}
          activeRts={wilayahRtList.filter(r => r.isActive)}
          onClose={() => {
            setIsEditNasabahOpen(false);
            setSelectedNasabahForEdit(null);
          }}
          onSuccess={async () => {
            setIsEditNasabahOpen(false);
            setSelectedNasabahForEdit(null);
            showNotification('Data nasabah berhasil diperbarui');
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: MASTER JENIS & HARGA SAMPAH */}
      {/* ========================================================= */}
      {isWasteTypeModalOpen && (
        <WasteTypeModal
          item={selectedWasteTypeForEdit}
          onClose={() => {
            setIsWasteTypeModalOpen(false);
            setSelectedWasteTypeForEdit(null);
          }}
          onSuccess={async () => {
            setIsWasteTypeModalOpen(false);
            setSelectedWasteTypeForEdit(null);
            showNotification('Data master jenis & harga sampah tersimpan');
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: PENARIKAN TUNAI */}
      {/* ========================================================= */}
      {isWithdrawalModalOpen && (
        <WithdrawalModal
          nasabahList={nasabahList.filter(n => n.status === 'active' && n.saldo > 0)}
          onClose={() => setIsWithdrawalModalOpen(false)}
          onSuccess={async (withdrawal) => {
            setIsWithdrawalModalOpen(false);
            setReceiptWithdrawal(withdrawal);
            showNotification(`Penarikan tunai Rp${withdrawal.amount.toLocaleString('id-ID')} berhasil dibukukan`);
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: KOREKSI AUDIT TRANSAKSI */}
      {/* ========================================================= */}
      {isCorrectModalOpen && selectedDepositForCorrect && (
        <CorrectionModal
          deposit={selectedDepositForCorrect}
          onClose={() => {
            setIsCorrectModalOpen(false);
            setSelectedDepositForCorrect(null);
          }}
          onSuccess={async () => {
            setIsCorrectModalOpen(false);
            setSelectedDepositForCorrect(null);
            showNotification('Koreksi transaksi berhasil dicatat ke audit log dan saldo disesuaikan');
            await refreshAllData();
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: ALASAN PENOLAKAN SETORAN */}
      {/* ========================================================= */}
      {rejectReasonModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Batalkan / Tolak Setoran</h3>
            <p className="text-xs text-neutral-500">
              Transaksi yang dibatalkan tidak akan menambah saldo nasabah. Masukkan alasan pembatalan untuk catatan audit:
            </p>
            <textarea
              rows={3}
              placeholder="Contoh: Sampah basah/terkontaminasi atau nasabah salah input..."
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectReasonModal({ id: '', isOpen: false })}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
              >
                Batal
              </button>
              <button
                onClick={handleRejectDeposit}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                Konfirmasi Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Modal */}
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

      {/* Receipt Modal */}
      <ReceiptModal
        deposit={receiptDeposit}
        withdrawal={receiptWithdrawal}
        onClose={() => {
          setReceiptDeposit(null);
          setReceiptWithdrawal(null);
        }}
      />

      {/* Buku Tabungan Resmi Modal */}
      <PassbookModal
        isOpen={passbookModal.isOpen}
        user={passbookModal.user}
        entries={passbookModal.entries}
        summary={passbookModal.summary}
        onClose={() => setPassbookModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

// ============================================================================
// SUB-MODAL COMPONENTS
// ============================================================================

// 1. New RT Modal
const NewRtModal: React.FC<{
  nomorRw: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ nomorRw, onClose, onSuccess }) => {
  const [nomorRt, setNomorRt] = useState('');
  const [ketuaRt, setKetuaRt] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!nomorRt.trim()) {
      setError('Nomor RT wajib diisi (Contoh: RT 06)');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createWilayahRt({
        nomorRt: nomorRt.trim(),
        ketuaRt: ketuaRt.trim() || undefined,
        phone: phone.trim() || undefined,
        description: description.trim() || undefined
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan wilayah RT');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Tambah Wilayah RT Baru</h3>
            <p className="text-xs text-neutral-500">Terdaftar di bawah {nomorRw}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nomor RT (Contoh: RT 06 atau 06) *
            </label>
            <input
              type="text"
              placeholder="Contoh: RT 06"
              value={nomorRt}
              onChange={(e) => setNomorRt(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nama Ketua RT (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Pak Supriyadi"
              value={ketuaRt}
              onChange={(e) => setKetuaRt(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nomor HP / WhatsApp Ketua RT (Opsional)
            </label>
            <input
              type="text"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Keterangan Lingkup Wilayah / KK (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Blok H & Asri Timur, 40 KK"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan RT Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Edit RT Modal
const EditRtModal: React.FC<{
  rt: WilayahRT;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ rt, onClose, onSuccess }) => {
  const [nomorRt, setNomorRt] = useState(rt.nomorRt);
  const [ketuaRt, setKetuaRt] = useState(rt.ketuaRt || '');
  const [phone, setPhone] = useState(rt.phone || '');
  const [description, setDescription] = useState(rt.description || '');
  const [isActive, setIsActive] = useState(rt.isActive);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateWilayahRt(rt.id, {
        nomorRt: nomorRt.trim(),
        ketuaRt: ketuaRt.trim() || undefined,
        phone: phone.trim() || undefined,
        description: description.trim() || undefined,
        isActive
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah wilayah RT');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-bold text-neutral-900">Ubah Data Wilayah {rt.nomorRt}</h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="text-xs text-rose-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nomor RT</label>
            <input
              type="text"
              value={nomorRt}
              onChange={(e) => setNomorRt(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Ketua RT</label>
            <input
              type="text"
              value={ketuaRt}
              onChange={(e) => setKetuaRt(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nomor Kontak</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Keterangan Wilayah</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Status Operasional</label>
            <select
              value={isActive ? 'true' : 'false'}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
            >
              <option value="true">Aktif (Dapat dipilih nasabah baru)</option>
              <option value="false">Nonaktif (Hanya untuk riwayat)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 3. Edit RW Config Modal
const EditRwConfigModal: React.FC<{
  config: WilayahConfig;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ config, onClose, onSuccess }) => {
  const [nomorRw, setNomorRw] = useState(config.nomorRw);
  const [namaWilayah, setNamaWilayah] = useState(config.namaWilayah);
  const [ketuaRw, setKetuaRw] = useState(config.ketuaRw || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateWilayahConfig({
        nomorRw: nomorRw.trim(),
        namaWilayah: namaWilayah.trim(),
        ketuaRw: ketuaRw.trim() || undefined
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-bold text-neutral-900">Ubah Konfigurasi Induk RW</h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nomor RW</label>
            <input
              type="text"
              value={nomorRw}
              onChange={(e) => setNomorRw(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-mono font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Resmi Wilayah</label>
            <input
              type="text"
              value={namaWilayah}
              onChange={(e) => setNamaWilayah(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Ketua RW</label>
            <input
              type="text"
              value={ketuaRw}
              onChange={(e) => setKetuaRw(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. New Nasabah Modal (Mandatory RT selection from configured active list)
const NewNasabahModal: React.FC<{
  activeRts: WilayahRT[];
  defaultRw: string;
  onClose: () => void;
  onSuccess: (data: any) => void;
}> = ({ activeRts, defaultRw, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rt, setRt] = useState(activeRts[0]?.nomorRt || '');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [initialPassword, setInitialPassword] = useState('');
  const [nasabahType, setNasabahType] = useState<'perorangan' | 'lembaga'>('perorangan');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !address.trim() || !rt) {
      setError('Nama lengkap, nomor HP, alamat, dan nomor RT wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.createNasabah({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        rt: rt.trim(),
        email: email.trim() || undefined,
        initialPassword: initialPassword.trim() || undefined,
        nasabahType
      });
      onSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftarkan nasabah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Pendaftaran Nasabah Baru</h3>
            <p className="text-xs text-neutral-500">
              Wajib terdata berdasarkan wilayah RT di lingkungan {defaultRw}.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Kategori Nasabah Sesuai SOP 1 */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Kategori Nasabah (SOP 1) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setNasabahType('perorangan')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  nasabahType === 'perorangan'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                    : 'bg-white border-neutral-200 text-neutral-600'
                }`}
              >
                Perorangan (Warga)
              </button>
              <button
                type="button"
                onClick={() => setNasabahType('lembaga')}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                  nasabahType === 'lembaga'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-bold'
                    : 'bg-white border-neutral-200 text-neutral-600'
                }`}
              >
                Bidang / Unit / Lembaga
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1">
              {nasabahType === 'perorangan'
                ? 'Hak Buku Tabungan: min. 3x setor atau saldo Rp20.000'
                : 'Hak Buku Tabungan: min. 3x setor atau saldo Rp50.000'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              placeholder="Contoh: Ahmad Santoso / Majelis Taklim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          {/* Wilayah RT Selection (NOT free text!) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Pilih Wilayah RT *
              </label>
              <select
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 bg-white font-mono font-bold text-emerald-800"
                required
              >
                {activeRts.map((r) => (
                  <option key={r.id} value={r.nomorRt}>
                    {r.nomorRt} {r.ketuaRt ? `- ${r.ketuaRt}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Wilayah RW (Induk)
              </label>
              <input
                type="text"
                value={defaultRw}
                readOnly
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 bg-neutral-100 font-mono text-neutral-600 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nomor Handphone (Identitas Login) *
            </label>
            <input
              type="text"
              placeholder="0812xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Alamat Lengkap / Keterangan Lokasi Rumah *
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Jl. Melati Blok B No. 07, dekat pos satpam"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Kata Sandi Awal (Kosongkan untuk otomatis)
            </label>
            <input
              type="text"
              placeholder="Default: sampah000X"
              value={initialPassword}
              onChange={(e) => setInitialPassword(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Nasabah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 5. Edit Nasabah Modal (Includes RT dropdown)
const EditNasabahModal: React.FC<{
  nasabah: User;
  activeRts: WilayahRT[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ nasabah, activeRts, onClose, onSuccess }) => {
  const [name, setName] = useState(nasabah.name);
  const [phone, setPhone] = useState(nasabah.phone);
  const [rt, setRt] = useState(nasabah.rt || activeRts[0]?.nomorRt || 'RT 01');
  const [address, setAddress] = useState(nasabah.address);
  const [status, setStatus] = useState(nasabah.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.updateNasabah(nasabah.id, {
        name: name.trim(),
        phone: phone.trim(),
        rt: rt.trim(),
        address: address.trim(),
        status
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah nasabah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-bold text-neutral-900">Edit Data {nasabah.id}</h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="text-xs text-rose-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-neutral-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Pilihan RT</label>
              <select
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-neutral-300 font-mono font-bold"
              >
                {activeRts.map((r) => (
                  <option key={r.id} value={r.nomorRt}>{r.nomorRt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Wilayah RW</label>
              <input
                type="text"
                value={nasabah.rw}
                readOnly
                className="w-full p-2 text-xs rounded-lg border border-neutral-200 bg-neutral-100 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Nomor HP</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-neutral-300 font-mono"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Alamat Domisili</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-neutral-300"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Status Akun</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2 text-xs rounded-lg border border-neutral-300"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 6. New Deposit Modal
const NewDepositModal: React.FC<{
  nasabahList: User[];
  wasteTypes: WasteType[];
  onClose: () => void;
  onSuccess: (dep: DepositTransaction) => void;
}> = ({ nasabahList, wasteTypes, onClose, onSuccess }) => {
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [items, setItems] = useState<Array<{ wasteTypeId: string; weight: number }>>([
    { wasteTypeId: wasteTypes[0]?.id || '', weight: 1 }
  ]);
  const [photoUrl, setPhotoUrl] = useState<string>('/assets/images/waste_sorting_guide_1793525358391.jpg');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addItemRow = () => {
    if (wasteTypes.length > 0) {
      setItems([...items, { wasteTypeId: wasteTypes[0].id, weight: 1 }]);
    }
  };

  const removeItemRow = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const updateItem = (idx: number, field: 'wasteTypeId' | 'weight', val: any) => {
    const copy = [...items];
    copy[idx] = { ...copy[idx], [field]: val };
    setItems(copy);
  };

  const calculatedRows = items.map((it) => {
    const wt = wasteTypes.find(w => w.id === it.wasteTypeId);
    const price = wt ? wt.pricePerKg : 0;
    const weight = Number(it.weight) || 0;
    return {
      weight,
      price,
      subtotal: Math.round(weight * price)
    };
  });

  const grandTotalWeight = calculatedRows.reduce((acc, r) => acc + r.weight, 0);
  const grandTotalAmount = calculatedRows.reduce((acc, r) => acc + r.subtotal, 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedNasabahId) {
      setError('Pilih nasabah penyetor');
      return;
    }

    if (items.some(i => !i.weight || i.weight <= 0)) {
      setError('Berat setiap item sampah harus lebih besar dari 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const dep = await api.createDeposit({
        nasabahId: selectedNasabahId,
        items,
        photoUrl,
        notes: notes.trim() || undefined
      });
      onSuccess(dep);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-8">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Catat Setoran Sampah Baru</h3>
            <p className="text-xs text-neutral-500">
              Transaksi otomatis tercatat dengan wilayah RT nasabah dan berstatus Menunggu Verifikasi.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              1. Pilih Nasabah Penyetor *
            </label>
            <select
              value={selectedNasabahId}
              onChange={(e) => setSelectedNasabahId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              required
            >
              <option value="">-- Pilih Nasabah Terdaftar --</option>
              {nasabahList.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} - {n.name} ({n.rt} / {n.rw}) · Saldo: Rp{n.saldo.toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700">
                2. Rincian Jenis Sampah & Timbangan *
              </label>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jenis Sampah</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((row, idx) => {
                const wt = wasteTypes.find(w => w.id === row.wasteTypeId);
                const sub = (row.weight || 0) * (wt?.pricePerKg || 0);
                return (
                  <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <div className="flex-1">
                      <select
                        value={row.wasteTypeId}
                        onChange={(e) => updateItem(idx, 'wasteTypeId', e.target.value)}
                        className="w-full p-1.5 text-xs rounded-lg border border-neutral-300 bg-white"
                      >
                        {wasteTypes.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name} (Rp{w.pricePerKg.toLocaleString('id-ID')}/{w.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          placeholder="Berat"
                          value={row.weight}
                          onChange={(e) => updateItem(idx, 'weight', parseFloat(e.target.value))}
                          className="w-full p-1.5 text-xs rounded-lg border border-neutral-300 pr-7 font-mono tabular-nums text-right"
                          required
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
                          {wt?.unit || 'kg'}
                        </span>
                      </div>
                    </div>

                    <div className="w-28 text-right font-mono font-semibold text-xs text-neutral-900 tabular-nums">
                      Rp{sub.toLocaleString('id-ID')}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-3 p-3 bg-neutral-100 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span className="text-neutral-600">Total Berat: <span className="text-neutral-900 font-mono">{Math.round(grandTotalWeight * 10) / 10} kg</span></span>
              <span className="text-neutral-600">Total Nilai Tabungan: <span className="text-emerald-700 font-bold font-mono text-sm">Rp{grandTotalAmount.toLocaleString('id-ID')}</span></span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              3. Foto Bukti Keseluruhan Setoran *
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 rounded-xl overflow-hidden border border-neutral-300 bg-neutral-100 shrink-0">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl cursor-pointer transition-colors border border-neutral-300">
                  <Camera className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Ambil / Unggah Foto Bukti Timbangan</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-neutral-400 mt-1">Satu foto wajib untuk seluruh timbangan fisik.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Catatan Setoran (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Kondisi kering, pilahan rumah tangga RT setempat"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Setoran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 7. Cash Withdrawal Modal
const WithdrawalModal: React.FC<{
  nasabahList: User[];
  onClose: () => void;
  onSuccess: (w: Withdrawal) => void;
}> = ({ nasabahList, onClose, onSuccess }) => {
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedNasabah = nasabahList.find(n => n.id === selectedNasabahId);

  const handleWithdrawAll = () => {
    if (selectedNasabah) {
      setAmount(selectedNasabah.saldo.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const nominal = Number(amount);

    if (!selectedNasabahId) {
      setError('Pilih nasabah penarik');
      return;
    }

    if (isNaN(nominal) || nominal <= 0) {
      setError('Nominal penarikan harus lebih dari Rp0');
      return;
    }

    if (selectedNasabah && nominal > selectedNasabah.saldo) {
      setError(`Nominal penarikan melebihi saldo tersedia (Maksimal Rp${selectedNasabah.saldo.toLocaleString('id-ID')})`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createWithdrawal({
        nasabahId: selectedNasabahId,
        amount: nominal,
        notes: notes.trim() || undefined
      });
      onSuccess(res.withdrawal);
    } catch (err: any) {
      setError(err.message || 'Gagal memproses penarikan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Catat Penarikan Uang Tunai</h3>
            <p className="text-xs text-neutral-500">Uang tunai diserahkan langsung kepada nasabah di loket.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Pilih Nasabah *</label>
            <select
              value={selectedNasabahId}
              onChange={(e) => setSelectedNasabahId(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300 bg-white"
              required
            >
              <option value="">-- Pilih Nasabah yang Memiliki Saldo --</option>
              {nasabahList.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id} - {n.name} ({n.rt}/{n.rw}) (Saldo: Rp{n.saldo.toLocaleString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          {selectedNasabah && (
            <div className="p-3 bg-neutral-100 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-neutral-500 block">Saldo Tabungan Saat Ini:</span>
                <span className="text-base font-bold text-emerald-800 font-mono tabular-nums">
                  Rp{selectedNasabah.saldo.toLocaleString('id-ID')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleWithdrawAll}
                className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
              >
                Tarik Semua Saldo
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Nominal Uang Tunai yang Diserahkan (Rp) *
            </label>
            <input
              type="number"
              placeholder="Contoh: 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2.5 text-sm rounded-xl border border-neutral-300 font-mono tabular-nums"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Catatan Kasir</label>
            <input
              type="text"
              placeholder="Contoh: Diterima oleh nasabah bersangkutan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 text-xs rounded-xl border border-neutral-300"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Memproses...' : 'Konfirmasi Penyerahan Uang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 8. Waste Type Modal
const WasteTypeModal: React.FC<{
  item: WasteType | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ item, onClose, onSuccess }) => {
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || 'Kertas & Karton');
  const [pricePerKg, setPricePerKg] = useState(item?.pricePerKg?.toString() || '');
  const [unit, setUnit] = useState(item?.unit || 'kg');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const price = Number(pricePerKg);
    if (!name.trim() || isNaN(price) || price <= 0) {
      setError('Nama dan harga valid wajib diisi');
      return;
    }
    setIsSubmitting(true);
    try {
      if (item) {
        await api.updateWasteType(item.id, {
          name: name.trim(),
          category: category.trim(),
          pricePerKg: price,
          unit
        });
      } else {
        await api.createWasteType({
          name: name.trim(),
          category: category.trim(),
          pricePerKg: price,
          unit
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan jenis sampah');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <h3 className="text-base font-bold text-neutral-900">
            {item ? `Ubah Jenis Sampah (${item.id})` : 'Tambah Jenis Sampah Baru'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="text-xs text-rose-600">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Nama Jenis Sampah</label>
            <input
              type="text"
              placeholder="Contoh: Kardus Gelombang"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-neutral-300"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Kategori</label>
            <input
              type="text"
              placeholder="Contoh: Kertas & Karton, Plastik, Logam"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-neutral-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Harga Beli (Rp)</label>
              <input
                type="number"
                placeholder="2000"
                value={pricePerKg}
                onChange={(e) => setPricePerKg(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-neutral-300 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">Satuan</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2 text-xs rounded-lg border border-neutral-300"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="liter">liter (Liter)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800"
            >
              Simpan Master
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 9. Correction Modal
const CorrectionModal: React.FC<{
  deposit: DepositTransaction;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ deposit, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [items, setItems] = useState<Array<{ wasteTypeId: string; wasteTypeName: string; weight: number; snapshotPricePerKg: number }>>(
    deposit.items.map(it => ({ ...it }))
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWeight = (idx: number, val: number) => {
    const copy = [...items];
    copy[idx].weight = val;
    setItems(copy);
  };

  const newTotal = items.reduce((acc, it) => acc + Math.round((it.weight || 0) * it.snapshotPricePerKg), 0);
  const delta = newTotal - deposit.totalAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError('Alasan koreksi audit wajib dicatat');
      return;
    }

    if (items.some(it => it.weight <= 0)) {
      setError('Berat semua item harus valid');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.correctDeposit(deposit.id, {
        reason: reason.trim(),
        newItems: items
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan koreksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900">Koreksi Audit Transaksi #{deposit.id}</h3>
            <p className="text-xs text-neutral-500">
              Nasabah: {deposit.nasabahName} ({deposit.nasabahRt || 'RT 01'})
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-neutral-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Alasan Koreksi Transaksi (Wajib diisi) *
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Koreksi berat timbangan kardus..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-neutral-300"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Penyesuaian Timbangan Per Item:
            </label>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-neutral-50 rounded-lg text-xs">
                  <span className="font-medium text-neutral-800 flex-1">{it.wasteTypeName}</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={it.weight}
                      onChange={(e) => updateWeight(idx, parseFloat(e.target.value))}
                      className="w-20 p-1 border rounded text-right font-mono"
                      required
                    />
                    <span className="text-neutral-500">kg</span>
                  </div>
                  <span className="w-24 text-right font-mono text-neutral-700">
                    Rp{Math.round((it.weight || 0) * it.snapshotPricePerKg).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-neutral-100 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="text-neutral-500">Total Sebelum: Rp{deposit.totalAmount.toLocaleString('id-ID')}</p>
              <p className="font-bold text-neutral-900">Total Baru: Rp{newTotal.toLocaleString('id-ID')}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-neutral-500 block">Penyesuaian Saldo Nasabah:</span>
              <span className={`text-base font-bold font-mono ${delta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {delta >= 0 ? `+Rp${delta.toLocaleString('id-ID')}` : `-Rp${Math.abs(delta).toLocaleString('id-ID')}`}
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Terapkan Koreksi Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
