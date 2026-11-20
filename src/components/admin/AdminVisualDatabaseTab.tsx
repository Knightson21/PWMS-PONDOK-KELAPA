import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  MapPin,
  Plus,
  Pencil,
  Save,
  ShieldCheck,
  History,
  FileSpreadsheet,
  ShoppingBag,
  Layers,
  CheckCircle2,
  X,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import { AdminOrgChartCard } from './AdminOrgChartCard';
import type { WilayahConfig, WilayahRT, AuditLog } from '../../types';

interface AdminVisualDatabaseTabProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
  onDataRestored: () => Promise<void>;
  onNavigateTab: (tab: 'monthly' | 'spreadsheet' | 'toko' | 'categories' | 'database') => void;
}

interface BackupPreviewSummary {
  fileName: string;
  rawObject: any;
  salesCount: number;
  productsCount: number;
  wasteTypesCount: number;
  wilayahCount: number;
  totalSalesAmount: number;
  totalSalesWeight: number;
}

function formatRupiah(val: number): string {
  return 'Rp' + Math.round(val || 0).toLocaleString('id-ID');
}

function translateAuditAction(action: string): string {
  const map: Record<string, string> = {
    CREATE_SALE: 'Pencatatan Penjualan Baru',
    UPDATE_SALE: 'Perubahan Data Penjualan',
    DELETE_SALE: 'Penghapusan Data Penjualan',
    PUBLIC_SALE: 'Input Penjualan dari Warga',
    CREATE_TOKO_PRODUCT: 'Tambah Produk Toko',
    UPDATE_TOKO_PRODUCT: 'Perbarui Produk / Foto Toko',
    DELETE_TOKO_PRODUCT: 'Hapus Produk Toko',
    UPDATE_ORG_CHART: 'Pembaruan Bagan Struktur Profil',
    CREATE_WASTE_TYPE: 'Tambah Jenis Sampah',
    UPDATE_WASTE_TYPE: 'Perbarui Jenis Sampah',
    UPDATE_WILAYAH_CONFIG: 'Perbarui Identitas Wilayah RW',
    CREATE_WILAYAH_RT: 'Tambah Wilayah RT Baru',
    UPDATE_WILAYAH_RT: 'Perbarui Data Wilayah RT',
    RESTORE_DATABASE: 'Pemulihan Cadangan Basis Data'
  };
  return map[action] || action.replace(/_/g, ' ');
}

export const AdminVisualDatabaseTab: React.FC<AdminVisualDatabaseTabProps> = ({
  onNotify,
  onDataRestored,
  onNavigateTab
}) => {
  const [loading, setLoading] = useState(true);
  const [dbStats, setDbStats] = useState<any>(null);
  const [backupSnapshot, setBackupSnapshot] = useState<any>(null);
  const [productsCount, setProductsCount] = useState<number>(0);

  // Wilayah RW & RT state
  const [rwConfig, setRwConfig] = useState<WilayahConfig>({
    nomorRw: 'RW 08',
    namaWilayah: 'Kp. Curug, Kel. Pondok Kelapa, Kec. Duren Sawit, Jakarta Timur',
    ketuaRw: ''
  });
  const [rtList, setRtList] = useState<WilayahRT[]>([]);
  const [savingRw, setSavingRw] = useState(false);

  // RT create / edit modal
  const [rtModalOpen, setRtModalOpen] = useState(false);
  const [editingRt, setEditingRt] = useState<WilayahRT | null>(null);
  const [rtNomor, setRtNomor] = useState('');
  const [rtKetua, setRtKetua] = useState('');
  const [rtPhone, setRtPhone] = useState('');
  const [rtDesc, setRtDesc] = useState('');
  const [savingRt, setSavingRt] = useState(false);

  // Visual Backup / Restore state (No raw JSON code ever shown)
  const [restorePreview, setRestorePreview] = useState<BackupPreviewSummary | null>(null);
  const [restoring, setRestoring] = useState(false);
  const restoreInputRef = useRef<HTMLInputElement | null>(null);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [backupRes, wilayahRes, logsRes] = await Promise.all([
        api.getDatabaseBackup(),
        api.getAdminWilayah(),
        api.getAuditLogs().catch(() => [] as AuditLog[])
      ]);
      setDbStats(backupRes.stats);
      setBackupSnapshot(backupRes.db);
      setProductsCount(Array.isArray(backupRes.db?.products) ? backupRes.db.products.length : 0);
      if (wilayahRes.config) setRwConfig(wilayahRes.config);
      setRtList(wilayahRes.rtList || []);
      const sortedLogs = [...(logsRes || [])].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setAuditLogs(sortedLogs.slice(0, 12));
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal memuat ringkasan pengelola data server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSaveRwConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rwConfig.nomorRw.trim() || !rwConfig.namaWilayah.trim()) {
      onNotify('error', 'Nomor RW dan nama wilayah wajib diisi.');
      return;
    }
    setSavingRw(true);
    try {
      const res = await api.updateWilayahConfig({
        nomorRw: rwConfig.nomorRw.trim(),
        namaWilayah: rwConfig.namaWilayah.trim(),
        ketuaRw: (rwConfig.ketuaRw || '').trim()
      });
      setRwConfig(res.config);
      onNotify('success', 'Identitas wilayah RW berhasil disimpan ke basis data.');
      await loadAll();
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal menyimpan identitas wilayah RW.');
    } finally {
      setSavingRw(false);
    }
  };

  const openCreateRtModal = () => {
    setEditingRt(null);
    setRtNomor('');
    setRtKetua('');
    setRtPhone('');
    setRtDesc('');
    setRtModalOpen(true);
  };

  const openEditRtModal = (rt: WilayahRT) => {
    setEditingRt(rt);
    setRtNomor(rt.nomorRt);
    setRtKetua(rt.ketuaRt || '');
    setRtPhone(rt.phone || '');
    setRtDesc(rt.description || '');
    setRtModalOpen(true);
  };

  const handleSaveRt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rtNomor.trim()) {
      onNotify('error', 'Nama / nomor RT wajib diisi.');
      return;
    }
    setSavingRt(true);
    try {
      if (editingRt) {
        await api.updateWilayahRt(editingRt.id, {
          nomorRt: rtNomor.trim(),
          ketuaRt: rtKetua.trim(),
          phone: rtPhone.trim(),
          description: rtDesc.trim()
        });
        onNotify('success', `Data wilayah ${rtNomor.trim()} berhasil diperbarui.`);
      } else {
        await api.createWilayahRt({
          nomorRt: rtNomor.trim(),
          ketuaRt: rtKetua.trim(),
          phone: rtPhone.trim(),
          description: rtDesc.trim()
        });
        onNotify('success', `Wilayah baru ${rtNomor.trim()} berhasil ditambahkan.`);
      }
      setRtModalOpen(false);
      await loadAll();
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal menyimpan data wilayah RT.');
    } finally {
      setSavingRt(false);
    }
  };

  const handleToggleRtActive = async (rt: WilayahRT) => {
    try {
      await api.updateWilayahRt(rt.id, { isActive: !rt.isActive });
      onNotify(
        'success',
        `${rt.nomorRt} sekarang berstatus ${!rt.isActive ? 'Aktif' : 'Nonaktif'}.`
      );
      await loadAll();
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal mengubah status wilayah RT.');
    }
  };

  // Visual Backup Download (1 click, no code visible)
  const handleDownloadBackup = () => {
    if (!backupSnapshot) {
      onNotify('error', 'Data cadangan belum siap, silakan muat ulang.');
      return;
    }
    const content = JSON.stringify(backupSnapshot, null, 2);
    const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Cadangan_Data_Bank_Sampah_Persatuan_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onNotify('success', 'Salinan cadangan data lengkap berhasil diunduh ke perangkat Anda.');
  };

  // Parse selected backup file silently and show user-friendly visual summary
  const handleChooseRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        if (!parsed || !Array.isArray(parsed.wasteTypes) || (!Array.isArray(parsed.sales) && !Array.isArray(parsed.deposits))) {
          onNotify('error', 'Berkas yang dipilih bukan salinan cadangan Bank Sampah Persatuan yang sah.');
          return;
        }
        const salesArr = Array.isArray(parsed.sales) ? parsed.sales : [];
        const totalSalesAmount = salesArr.reduce((acc: number, s: any) => acc + (Number(s.totalAmount) || 0), 0);
        const totalSalesWeight = Number(
          salesArr.reduce((acc: number, s: any) => acc + (Number(s.totalWeight) || 0), 0).toFixed(2)
        );
        setRestorePreview({
          fileName: file.name,
          rawObject: parsed,
          salesCount: salesArr.length,
          productsCount: Array.isArray(parsed.products) ? parsed.products.length : 0,
          wasteTypesCount: Array.isArray(parsed.wasteTypes) ? parsed.wasteTypes.length : 0,
          wilayahCount: Array.isArray(parsed.wilayahRt) ? parsed.wilayahRt.length : 0,
          totalSalesAmount,
          totalSalesWeight
        });
      } catch {
        onNotify('error', 'Berkas tidak dapat dibaca. Pastikan Anda memilih file cadangan (.json) hasil unduhan dari sistem ini.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = async () => {
    if (!restorePreview) return;
    setRestoring(true);
    try {
      await api.restoreDatabase(restorePreview.rawObject);
      setRestorePreview(null);
      onNotify('success', 'Seluruh data berhasil dipulihkan dari berkas cadangan.');
      await Promise.all([loadAll(), onDataRestored()]);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal memulihkan data cadangan.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. RINGKASAN ISI BASIS DATA (VISUAL SHORTCUTS) */}
      <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Ringkasan Penyimpanan Data Bank Sampah
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Seluruh data tersimpan otomatis dan aman di server. Anda dapat mengelola setiap jenis data secara visual tanpa menyentuh kode apa pun.
            </p>
          </div>
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5 w-fit transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Ringkasan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span className="text-xs font-semibold">Transaksi Penjualan</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-1.5">
                {(dbStats?.salesCount ?? 0).toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 mt-0.5">
                {(dbStats?.totalSalesWeight ?? 0).toLocaleString('id-ID')} kg · {formatRupiah(dbStats?.totalSalesAmount ?? 0)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('spreadsheet')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 w-fit"
            >
              <span>Kelola di Spreadsheet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span className="text-xs font-semibold">Katalog Produk Toko</span>
                <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-1.5">
                {productsCount.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Produk UP2K Kreasi 308 & foto
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('toko')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 w-fit"
            >
              <span>Kelola Produk & Foto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span className="text-xs font-semibold">Daftar Jenis Sampah</span>
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-1.5">
                {(dbStats?.wasteTypeCount ?? 0).toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Pilihan pada formulir warga
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('categories')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 w-fit"
            >
              <span>Kelola Jenis Sampah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                <span className="text-xs font-semibold">Wilayah Layanan RT</span>
                <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-1.5">
                {rtList.length.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {rtList.filter((r) => r.isActive).length} wilayah aktif di {rwConfig.nomorRw}
              </p>
            </div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Dikelola pada form di bawah
            </span>
          </div>
        </div>
      </section>

      {/* 2. CADANGAN & PEMULIHAN DATA RAMAH AWAM (NO JSON CODE) */}
      <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Cadangan & Pemulihan Data Aman
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
              Simpan salinan data secara berkala ke komputer/HP Anda sebagai arsip pengaman, atau kembalikan data dari berkas cadangan lama hanya dengan memilih berkasnya.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Backup */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Langkah 1 · Simpan Arsip Pengaman
              </p>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Unduh Salinan Cadangan Data
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Mengunduh seluruh transaksi penjualan, katalog produk beserta foto, daftar jenis sampah, dan pengaturan wilayah ke dalam satu berkas cadangan bertanggal otomatis.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadBackup}
              disabled={!backupSnapshot}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 inline-flex items-center justify-center gap-2 transition-colors w-full sm:w-fit"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Salinan Cadangan Sekarang</span>
            </button>
          </div>

          {/* Card 2: Restore */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex flex-col justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Langkah 2 · Kembalikan dari Arsip
              </p>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Pulihkan Data dari Berkas Cadangan
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Pilih berkas cadangan yang pernah diunduh sebelumnya. Sistem akan menampilkan ringkasan isi berkas terlebih dahulu untuk Anda periksa sebelum data dipulihkan.
              </p>
            </div>

            <div>
              <input
                ref={restoreInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleChooseRestoreFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => restoreInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 inline-flex items-center justify-center gap-2 transition-colors w-full sm:w-fit"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih Berkas Cadangan...</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PENGATURAN IDENTITAS WILAYAH RW & DAFTAR RT (VISUAL FORM) */}
      <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-6">
        <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
            Pengaturan Identitas Wilayah RW & Daftar RT
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Ubah keterangan wilayah layanan atau tambah dan sunting daftar RT langsung melalui formulir ini.
          </p>
        </div>

        {/* RW Config Form */}
        <form onSubmit={handleSaveRwConfig} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-2 space-y-1">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Nomor RW
            </label>
            <input
              type="text"
              required
              value={rwConfig.nomorRw}
              onChange={(e) => setRwConfig((prev) => ({ ...prev, nomorRw: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Nama Wilayah Layanan
            </label>
            <input
              type="text"
              required
              value={rwConfig.namaWilayah}
              onChange={(e) => setRwConfig((prev) => ({ ...prev, namaWilayah: e.target.value }))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-3 space-y-1">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Nama Ketua RW / Pembina
            </label>
            <input
              type="text"
              value={rwConfig.ketuaRw || ''}
              onChange={(e) => setRwConfig((prev) => ({ ...prev, ketuaRw: e.target.value }))}
              placeholder="Opsional"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={savingRw}
              className="w-full px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingRw ? 'Menyimpan...' : 'Simpan RW'}</span>
            </button>
          </div>
        </form>

        {/* RT List Management */}
        <div className="space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Daftar Wilayah RT Terdaftar ({rtList.length})
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Kelola nama koordinator, nomor kontak, dan status aktif tiap RT.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateRtModal}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 inline-flex items-center gap-1.5 w-fit transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Wilayah RT</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
                  <th className="py-2.5 px-3.5 font-bold">Wilayah RT</th>
                  <th className="py-2.5 px-3.5 font-bold">Koordinator / Ketua RT</th>
                  <th className="py-2.5 px-3.5 font-bold">Kontak</th>
                  <th className="py-2.5 px-3.5 font-bold">Keterangan</th>
                  <th className="py-2.5 px-3.5 font-bold">Status</th>
                  <th className="py-2.5 px-3.5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {rtList.map((rt) => (
                  <tr key={rt.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 px-3.5 font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                      {rt.nomorRt}
                    </td>
                    <td className="py-2.5 px-3.5 text-neutral-700 dark:text-neutral-300">
                      {rt.ketuaRt || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono tabular-nums text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {rt.phone || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 text-neutral-500 dark:text-neutral-400 max-w-[220px] truncate">
                      {rt.description || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold ${
                          rt.isActive
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-neutral-400 dark:text-neutral-500'
                        }`}
                      >
                        {rt.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        type="button"
                        onClick={() => openEditRtModal(rt)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 inline-flex items-center gap-1 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Sunting</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleRtActive(rt)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                      >
                        {rt.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4. GAMBAR BAGAN STRUKTUR ORGANISASI PROFIL */}
      <AdminOrgChartCard onNotify={onNotify} />

      {/* 5. RIWAYAT AKTIVITAS PENGURUS TERBARU */}
      <section className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 dark:border-neutral-800 pb-3.5">
          <History className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
          <div>
            <h2 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Riwayat Perubahan Data Terbaru
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Catatan otomatis 12 aktivitas pengelolaan terakhir oleh pengurus.
            </p>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 py-4 text-center">
            Belum ada catatan riwayat perubahan data.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {translateAuditAction(log.action)}
                    </span>
                    <span className="text-neutral-400" aria-hidden="true">·</span>
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                      {log.actor || 'Admin'}
                    </span>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-relaxed">
                    {log.details}
                  </p>
                </div>
                <span className="text-[11px] font-mono tabular-nums text-neutral-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL: TAMBAH / SUNTING RT */}
      {rtModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                {editingRt ? `Sunting ${editingRt.nomorRt}` : 'Tambah Wilayah RT Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setRtModalOpen(false)}
                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRt} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Nama / Nomor RT *
                </label>
                <input
                  type="text"
                  required
                  value={rtNomor}
                  onChange={(e) => setRtNomor(e.target.value)}
                  placeholder="Contoh: RT 017"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Nama Koordinator / Ketua RT
                </label>
                <input
                  type="text"
                  value={rtKetua}
                  onChange={(e) => setRtKetua(e.target.value)}
                  placeholder="Nama penanggung jawab wilayah"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={rtPhone}
                  onChange={(e) => setRtPhone(e.target.value)}
                  placeholder="Contoh: 0812xxxxxxxx"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Keterangan Wilayah
                </label>
                <input
                  type="text"
                  value={rtDesc}
                  onChange={(e) => setRtDesc(e.target.value)}
                  placeholder="Contoh: Wilayah Kp. Curug Utara"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRtModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingRt}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50"
                >
                  {savingRt ? 'Menyimpan...' : 'Simpan Wilayah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRATINJAU VISUAL PEMULIHAN CADANGAN (ZERO JSON CODE) */}
      {restorePreview && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg p-6 space-y-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  Periksa Isi Berkas Cadangan Sebelum Dipulihkan
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Berkas terpilih: <strong className="text-neutral-800 dark:text-neutral-200">{restorePreview.fileName}</strong>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-500 dark:text-neutral-400">Transaksi Penjualan</p>
                <p className="text-lg font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-0.5">
                  {restorePreview.salesCount.toLocaleString('id-ID')} data
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-500 dark:text-neutral-400">Total Nilai Penjualan</p>
                <p className="text-lg font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {formatRupiah(restorePreview.totalSalesAmount)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-500 dark:text-neutral-400">Produk Toko & Jenis Sampah</p>
                <p className="text-sm font-bold font-mono tabular-nums text-neutral-900 dark:text-white mt-1">
                  {restorePreview.productsCount} produk · {restorePreview.wasteTypesCount} jenis
                </p>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-500 dark:text-neutral-400">Wilayah RT & Total Berat</p>
                <p className="text-sm font-bold font-mono tabular-nums text-neutral-900 dark:text-white mt-1">
                  {restorePreview.wilayahCount} RT · {restorePreview.totalSalesWeight} kg
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Memulihkan berkas ini akan menggantikan seluruh data aktif saat ini dengan isi di atas. Disarankan mengunduh cadangan terlebih dahulu sebelum melanjutkan.
              </span>
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setRestorePreview(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={restoring}
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
              >
                {restoring ? 'Memulihkan Data...' : 'Ya, Pulihkan Data Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
