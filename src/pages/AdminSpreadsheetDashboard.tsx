import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Database,
  Layers,
  Globe,
  KeyRound,
  LogOut,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  Save,
  Scale,
  Wallet,
  Receipt,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ThemeToggle } from '../components/ThemeToggle';
import { AdminTokoProductsTab } from '../components/admin/AdminTokoProductsTab';
import { AdminOrgChartCard } from '../components/admin/AdminOrgChartCard';
import type { WasteSaleRecord, WasteType } from '../types';

type AdminTab = 'spreadsheet' | 'toko' | 'categories' | 'database';

interface AdminSpreadsheetDashboardProps {
  onGoPublic: () => void;
}

interface SaleFormRow {
  rowId: string;
  wasteTypeId: string;
  weight: string;
  pricePerKg: string;
}

function formatRupiah(val: number): string {
  return 'Rp' + Math.round(val || 0).toLocaleString('id-ID');
}

function toLocalDateTimeInput(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  const offsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function escapeCsvCell(value: string | number | undefined | null): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export const AdminSpreadsheetDashboard: React.FC<AdminSpreadsheetDashboardProps> = ({
  onGoPublic
}) => {
  const { user, logout, openChangePasswordModal } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('spreadsheet');

  // Sales & Waste Types State
  const [sales, setSales] = useState<WasteSaleRecord[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRt, setSelectedRt] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Photo lightbox
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Sale Create / Edit Modal
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<WasteSaleRecord | null>(null);
  const [formSellerName, setFormSellerName] = useState('');
  const [formSellerRt, setFormSellerRt] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formRows, setFormRows] = useState<SaleFormRow[]>([]);
  const [savingSale, setSavingSale] = useState(false);

  // Delete Confirmation Modal
  const [deletingSale, setDeletingSale] = useState<WasteSaleRecord | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Waste Category Modal
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<WasteType | null>(null);
  const [catName, setCatName] = useState('');
  const [catGroup, setCatGroup] = useState('Plastik');
  const [catUnit, setCatUnit] = useState('kg');
  const [savingCat, setSavingCat] = useState(false);

  // Database Tab State
  const [dbJsonText, setDbJsonText] = useState('');
  const [dbStats, setDbStats] = useState<any>(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbSaving, setDbSaving] = useState(false);
  const [pendingRestoreJson, setPendingRestoreJson] = useState<any>(null);
  const restoreFileRef = useRef<HTMLInputElement | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
  };

  const loadCoreData = async () => {
    setLoading(true);
    try {
      const [salesData, wtData] = await Promise.all([
        api.getAdminSales(),
        api.getWasteTypes()
      ]);
      setSales(salesData);
      setWasteTypes(wtData);
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal memuat data penjualan dari server.');
    } finally {
      setLoading(false);
    }
  };

  const loadDatabaseBackup = async () => {
    setDbLoading(true);
    try {
      const res = await api.getDatabaseBackup();
      setDbStats(res.stats);
      setDbJsonText(JSON.stringify(res.db, null, 2));
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal membaca basis data server.');
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    loadCoreData();
  }, []);

  useEffect(() => {
    if (activeTab === 'database' && !dbJsonText) {
      loadDatabaseBackup();
    }
  }, [activeTab]);

  // Distinct RT list for filter dropdown
  const availableRts = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => {
      if (s.sellerRt?.trim()) set.add(s.sellerRt.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [sales]);

  // Client-side filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (selectedRt !== 'ALL' && s.sellerRt.trim().toLowerCase() !== selectedRt.toLowerCase()) {
        return false;
      }
      if (startDate) {
        const saleMs = new Date(s.date).getTime();
        const startMs = new Date(`${startDate}T00:00:00`).getTime();
        if (saleMs < startMs) return false;
      }
      if (endDate) {
        const saleMs = new Date(s.date).getTime();
        const endMs = new Date(`${endDate}T23:59:59.999`).getTime();
        if (saleMs > endMs) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const inHeader =
          s.id.toLowerCase().includes(q) ||
          s.sellerName.toLowerCase().includes(q) ||
          s.sellerRt.toLowerCase().includes(q) ||
          (s.notes || '').toLowerCase().includes(q);
        const inItems = s.items.some(
          (it) =>
            it.wasteTypeName.toLowerCase().includes(q) ||
            (it.category || '').toLowerCase().includes(q)
        );
        if (!inHeader && !inItems) return false;
      }
      return true;
    });
  }, [sales, selectedRt, startDate, endDate, searchQuery]);

  // Flattened spreadsheet rows (1 row per waste item)
  const flattenedRows = useMemo(() => {
    const result: Array<{
      rowNumber: number;
      sale: WasteSaleRecord;
      item: WasteSaleRecord['items'][number];
      itemIndex: number;
      itemCount: number;
    }> = [];

    let counter = 1;
    filteredSales.forEach((sale) => {
      sale.items.forEach((item, idx) => {
        result.push({
          rowNumber: counter++,
          sale,
          item,
          itemIndex: idx,
          itemCount: sale.items.length
        });
      });
    });
    return result;
  }, [filteredSales]);

  // KPI metrics based on filtered dataset
  const summary = useMemo(() => {
    const totalTransactions = filteredSales.length;
    const totalItemRows = flattenedRows.length;
    const totalWeight = filteredSales.reduce((acc, s) => acc + (s.totalWeight || 0), 0);
    const totalAmount = filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    return {
      totalTransactions,
      totalItemRows,
      totalWeight: Number(totalWeight.toFixed(2)),
      totalAmount: Math.round(totalAmount)
    };
  }, [filteredSales, flattenedRows]);

  // Export CSV (UTF-8 BOM, Excel compatible)
  const handleExportCsv = () => {
    if (flattenedRows.length === 0) {
      showToast('error', 'Tidak ada baris data untuk diekspor.');
      return;
    }

    const headers = [
      'No',
      'Kode Transaksi',
      'Tanggal',
      'Nama Warga',
      'RT / Wilayah',
      'Jenis Sampah',
      'Kategori',
      'Berat',
      'Satuan',
      'Harga Per Satuan (Rp)',
      'Subtotal (Rp)',
      'Total Berat Transaksi',
      'Total Nilai Transaksi (Rp)',
      'Catatan',
      'Sumber'
    ];

    const lines = [headers.map(escapeCsvCell).join(',')];

    flattenedRows.forEach(({ rowNumber, sale, item }) => {
      const dateStr = new Date(sale.date).toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const rowCells = [
        rowNumber,
        sale.id,
        dateStr,
        sale.sellerName,
        sale.sellerRt,
        item.wasteTypeName,
        item.category || '',
        item.weight,
        item.unit || 'kg',
        item.pricePerKg,
        item.subtotal,
        sale.totalWeight,
        sale.totalAmount,
        sale.notes || '',
        sale.source === 'warga_beranda'
          ? 'Form Publik Warga'
          : sale.source === 'migrasi_2026'
          ? 'Migrasi Data 2026'
          : 'Input Admin'
      ];
      lines.push(rowCells.map(escapeCsvCell).join(','));
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Data_Penjualan_Bank_Sampah_Persatuan_${today}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('success', `Berhasil mengekspor ${flattenedRows.length} baris data ke file spreadsheet CSV.`);
  };

  // Open Sale Modal (Create or Edit)
  const openCreateSaleModal = () => {
    const defaultWtId = wasteTypes.find((w) => w.isActive !== false)?.id || wasteTypes[0]?.id || '';
    setEditingSale(null);
    setFormSellerName('');
    setFormSellerRt('');
    setFormDate(toLocalDateTimeInput());
    setFormNotes('');
    setFormRows([
      {
        rowId: `row-${Date.now()}`,
        wasteTypeId: defaultWtId,
        weight: '',
        pricePerKg: ''
      }
    ]);
    setSaleModalOpen(true);
  };

  const openEditSaleModal = (sale: WasteSaleRecord) => {
    setEditingSale(sale);
    setFormSellerName(sale.sellerName);
    setFormSellerRt(sale.sellerRt);
    setFormDate(toLocalDateTimeInput(sale.date));
    setFormNotes(sale.notes || '');
    setFormRows(
      sale.items.map((it, idx) => ({
        rowId: `edit-${idx}-${Date.now()}`,
        wasteTypeId: it.wasteTypeId,
        weight: String(it.weight),
        pricePerKg: String(it.pricePerKg)
      }))
    );
    setSaleModalOpen(true);
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSellerName.trim() || !formSellerRt.trim()) {
      showToast('error', 'Nama warga dan RT wajib diisi.');
      return;
    }

    const itemsPayload: Array<{ wasteTypeId: string; weight: number; pricePerKg: number }> = [];
    for (let i = 0; i < formRows.length; i++) {
      const r = formRows[i];
      const w = parseFloat(r.weight);
      const p = parseFloat(r.pricePerKg);
      if (!r.wasteTypeId || !Number.isFinite(w) || w <= 0 || !Number.isFinite(p) || p <= 0) {
        showToast('error', `Lengkapi jenis sampah, berat (> 0), dan harga aktual (> 0) pada baris #${i + 1}.`);
        return;
      }
      itemsPayload.push({
        wasteTypeId: r.wasteTypeId,
        weight: Number(w.toFixed(2)),
        pricePerKg: Math.round(p)
      });
    }

    setSavingSale(true);
    try {
      const isoDate = formDate ? new Date(formDate).toISOString() : new Date().toISOString();
      if (editingSale) {
        await api.updateAdminSale(editingSale.id, {
          sellerName: formSellerName.trim(),
          sellerRt: formSellerRt.trim(),
          date: isoDate,
          items: itemsPayload,
          notes: formNotes.trim()
        });
        showToast('success', `Data transaksi ${editingSale.id} berhasil diperbarui.`);
      } else {
        const res = await api.createAdminSale({
          sellerName: formSellerName.trim(),
          sellerRt: formSellerRt.trim(),
          date: isoDate,
          items: itemsPayload,
          notes: formNotes.trim()
        });
        showToast('success', `Data transaksi baru ${res.sale.id} berhasil ditambahkan.`);
      }
      setSaleModalOpen(false);
      await loadCoreData();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menyimpan data penjualan.');
    } finally {
      setSavingSale(false);
    }
  };

  const handleConfirmDeleteSale = async () => {
    if (!deletingSale) return;
    setDeletingLoading(true);
    try {
      await api.deleteAdminSale(deletingSale.id);
      showToast('success', `Transaksi ${deletingSale.id} berhasil dihapus.`);
      setDeletingSale(null);
      await loadCoreData();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menghapus transaksi.');
    } finally {
      setDeletingLoading(false);
    }
  };

  // Waste Category Handlers
  const openCreateCategoryModal = () => {
    setEditingCat(null);
    setCatName('');
    setCatGroup('Plastik');
    setCatUnit('kg');
    setCatModalOpen(true);
  };

  const openEditCategoryModal = (wt: WasteType) => {
    setEditingCat(wt);
    setCatName(wt.name);
    setCatGroup(wt.category || 'Plastik');
    setCatUnit(wt.unit || 'kg');
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      showToast('error', 'Nama jenis sampah wajib diisi.');
      return;
    }
    setSavingCat(true);
    try {
      if (editingCat) {
        await api.updateWasteType(editingCat.id, {
          name: catName.trim(),
          category: catGroup.trim() || 'Lainnya',
          unit: catUnit.trim() || 'kg'
        });
        showToast('success', `Jenis sampah "${catName.trim()}" berhasil diperbarui.`);
      } else {
        await api.createWasteType({
          name: catName.trim(),
          category: catGroup.trim() || 'Lainnya',
          unit: catUnit.trim() || 'kg',
          pricePerKg: 0
        });
        showToast('success', `Jenis sampah baru "${catName.trim()}" ditambahkan ke daftar form.`);
      }
      setCatModalOpen(false);
      await loadCoreData();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal menyimpan jenis sampah.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleToggleCategoryActive = async (wt: WasteType) => {
    try {
      await api.updateWasteType(wt.id, { isActive: !wt.isActive });
      showToast(
        'success',
        `Jenis sampah "${wt.name}" sekarang ${!wt.isActive ? 'Aktif di Form' : 'Disembunyikan dari Form'}.`
      );
      await loadCoreData();
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal mengubah status jenis sampah.');
    }
  };

  // Database Backup & Restore Handlers
  const handleDownloadDbJson = () => {
    if (!dbJsonText) return;
    const blob = new Blob([dbJsonText], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_db_bank_sampah_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'File backup basis data (.JSON) berhasil diunduh.');
  };

  const handleSaveDbJson = async () => {
    setDbSaving(true);
    try {
      const parsed = JSON.parse(dbJsonText);
      await api.restoreDatabase(parsed);
      showToast('success', 'Perubahan basis data server (data/db.json) berhasil disimpan permanen.');
      await Promise.all([loadCoreData(), loadDatabaseBackup()]);
    } catch (err: any) {
      showToast('error', `Gagal menyimpan JSON: ${err?.message || 'Format JSON tidak valid.'}`);
    } finally {
      setDbSaving(false);
    }
  };

  const handleUploadRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '{}'));
        setPendingRestoreJson(parsed);
      } catch {
        showToast('error', 'File JSON tidak valid dan tidak dapat dipulihkan.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestoreFile = async () => {
    if (!pendingRestoreJson) return;
    setDbSaving(true);
    try {
      await api.restoreDatabase(pendingRestoreJson);
      setPendingRestoreJson(null);
      showToast('success', 'Basis data server berhasil dipulihkan dari file backup.');
      await Promise.all([loadCoreData(), loadDatabaseBackup()]);
    } catch (err: any) {
      showToast('error', err?.message || 'Gagal memulihkan basis data.');
    } finally {
      setDbSaving(false);
    }
  };

  const hasActiveFilters = Boolean(searchQuery || selectedRt !== 'ALL' || startDate || endDate);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col transition-colors">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.12.54_f474b6b5.jpeg"
              alt="Logo Bank Sampah Persatuan"
              className="w-9 h-9 object-contain rounded-full border border-amber-400 bg-neutral-950 shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-white truncate">
                Admin Spreadsheet · Bank Sampah Persatuan
              </h1>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                Masuk sebagai {user?.name || 'Administrator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onGoPublic}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Halaman Publik</span>
            </button>

            <ThemeToggle />

            <button
              type="button"
              onClick={openChangePasswordModal}
              title="Ganti Kata Sandi Admin"
              className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'spreadsheet' as AdminTab, label: 'Data Penjualan (Spreadsheet)', icon: FileSpreadsheet },
            { id: 'toko' as AdminTab, label: 'Produk Toko & Foto', icon: ShoppingBag },
            { id: 'categories' as AdminTab, label: 'Daftar Jenis Sampah', icon: Layers },
            { id: 'database' as AdminTab, label: 'Bagan Profil & Basis Data', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Status Banner */}
        {banner && (
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm ${
              banner.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{banner.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setBanner(null)}
              className="opacity-70 hover:opacity-100"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: SPREADSHEET RAW DATA */}
        {activeTab === 'spreadsheet' && (
          <div className="space-y-5">
            {/* Compact KPI Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span className="text-xs font-semibold">Total Transaksi</span>
                  <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-1.5">
                  {summary.totalTransactions.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Bukti penjualan tercatat
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span className="text-xs font-semibold">Baris Spreadsheet</span>
                  <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-1.5">
                  {summary.totalItemRows.toLocaleString('id-ID')}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Total rincian jenis sampah
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span className="text-xs font-semibold">Total Berat Terjual</span>
                  <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-1.5">
                  {summary.totalWeight.toLocaleString('id-ID')} <span className="text-sm font-bold">kg</span>
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Akumulasi bobot sesuai filter
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/70">
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                  <span className="text-xs font-bold">Total Nilai Penjualan</span>
                  <Wallet className="w-4 h-4" />
                </div>
                <p className="text-2xl font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-1.5">
                  {formatRupiah(summary.totalAmount)}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Total nilai harga aktual warga
                </p>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-2.5 flex-1">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kode, nama warga, RT, jenis sampah..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    value={selectedRt}
                    onChange={(e) => setSelectedRt(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">Semua RT</option>
                    {availableRts.map((rt) => (
                      <option key={rt} value={rt}>
                        {rt}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Tanggal mulai"
                    className="px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-neutral-400">s/d</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="Tanggal selesai"
                    className="px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRt('ALL');
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="px-2.5 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={loadCoreData}
                    title="Muat ulang data"
                    className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>

                  <button
                    type="button"
                    onClick={openCreateSaleModal}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Catat Manual</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor Spreadsheet (.CSV)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Raw Spreadsheet Table */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <th className="py-3 px-3 font-bold text-center w-10">No</th>
                      <th className="py-3 px-3 font-bold whitespace-nowrap">Kode</th>
                      <th className="py-3 px-3 font-bold whitespace-nowrap">Tanggal</th>
                      <th className="py-3 px-3 font-bold">Nama Warga</th>
                      <th className="py-3 px-3 font-bold whitespace-nowrap">RT</th>
                      <th className="py-3 px-3 font-bold">Jenis Sampah</th>
                      <th className="py-3 px-3 font-bold text-right whitespace-nowrap">Berat</th>
                      <th className="py-3 px-3 font-bold text-right whitespace-nowrap">Harga / Satuan</th>
                      <th className="py-3 px-3 font-bold text-right whitespace-nowrap">Subtotal</th>
                      <th className="py-3 px-3 font-bold">Catatan</th>
                      <th className="py-3 px-3 font-bold text-center">Bukti</th>
                      <th className="py-3 px-3 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {loading ? (
                      <tr>
                        <td colSpan={12} className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                          Memuat data penjualan sampah...
                        </td>
                      </tr>
                    ) : flattenedRows.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                          Belum ada data penjualan yang cocok dengan filter saat ini.
                        </td>
                      </tr>
                    ) : (
                      flattenedRows.map(({ rowNumber, sale, item, itemIndex }) => {
                        const isFirstItem = itemIndex === 0;
                        const dateFormatted = new Date(sale.date).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <tr
                            key={`${sale.id}-${itemIndex}`}
                            className={`hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors ${
                              !isFirstItem ? 'bg-neutral-50/30 dark:bg-neutral-900/60' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-mono tabular-nums text-neutral-400">
                              {rowNumber}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                              {isFirstItem ? sale.id : <span className="text-neutral-400 font-normal">↳ {sale.id}</span>}
                            </td>
                            <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                              {dateFormatted}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                              {sale.sellerName}
                            </td>
                            <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                              {sale.sellerRt}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {item.wasteTypeName}
                              </span>
                              {item.category && (
                                <span className="ml-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                                  ({item.category})
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                              {item.weight} {item.unit || 'kg'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                              {formatRupiah(item.pricePerKg)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                              {formatRupiah(item.subtotal)}
                            </td>
                            <td className="py-2.5 px-3 max-w-[180px] truncate text-neutral-500 dark:text-neutral-400" title={sale.notes || ''}>
                              {isFirstItem ? sale.notes || '-' : ''}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {isFirstItem && sale.photoUrl ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewPhoto({
                                      url: sale.photoUrl!,
                                      title: `${sale.id} — ${sale.sellerName} (${sale.sellerRt})`
                                    })
                                  }
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800"
                                  title="Lihat foto bukti"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span className="text-neutral-300 dark:text-neutral-700">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              {isFirstItem ? (
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openEditSaleModal(sale)}
                                    title="Sunting transaksi"
                                    className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingSale(sale)}
                                    title="Hapus transaksi"
                                    className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUK TOKO & FOTO */}
        {activeTab === 'toko' && <AdminTokoProductsTab onNotify={showToast} />}

        {/* TAB 3: DAFTAR JENIS SAMPAH */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5">
              <div>
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  Daftar Tetap Jenis Sampah (Pilihan Form Beranda)
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Kelola kategori jenis sampah yang tampil di formulir warga. Harga bersifat fluktuatif dan selalu ditulis langsung oleh warga saat transaksi.
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateCategoryModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 w-fit shrink-0 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Jenis Sampah</span>
              </button>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      <th className="py-3 px-4 font-bold">Nama Jenis Sampah</th>
                      <th className="py-3 px-4 font-bold">Kelompok / Kategori</th>
                      <th className="py-3 px-4 font-bold">Satuan</th>
                      <th className="py-3 px-4 font-bold">Status di Form</th>
                      <th className="py-3 px-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {wasteTypes.map((wt) => (
                      <tr key={wt.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40">
                        <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">
                          {wt.name}
                        </td>
                        <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                          {wt.category}
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-600 dark:text-neutral-300">
                          {wt.unit || 'kg'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                              wt.isActive !== false
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700'
                            }`}
                          >
                            {wt.isActive !== false ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                          <button
                            type="button"
                            onClick={() => openEditCategoryModal(wt)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                          >
                            Sunting
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryActive(wt)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                          >
                            {wt.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
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

        {/* TAB 4: BAGAN PROFIL & BASIS DATA SERVER */}
        {activeTab === 'database' && (
          <div className="space-y-5">
            <AdminOrgChartCard onNotify={showToast} />

            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                    Kelola Basis Data File Server (data/db.json)
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Semua data penjualan warga tersimpan permanen di file server. Anda dapat mengunduh cadangan, memulihkan dari file backup, atau menyunting JSON secara langsung.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={loadDatabaseBackup}
                    disabled={dbLoading}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
                    <span>Muat Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDbJson}
                    disabled={!dbJsonText}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Backup (.JSON)</span>
                  </button>

                  <input
                    ref={restoreFileRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleUploadRestoreFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => restoreFileRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pulihkan dari File</span>
                  </button>
                </div>
              </div>

              {dbStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-500 dark:text-neutral-400">Transaksi Penjualan</p>
                    <p className="text-lg font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-0.5">
                      {dbStats.salesCount ?? 0}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-500 dark:text-neutral-400">Total Berat Penjualan</p>
                    <p className="text-lg font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-0.5">
                      {(dbStats.totalSalesWeight ?? 0).toLocaleString('id-ID')} kg
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-500 dark:text-neutral-400">Total Nilai Penjualan</p>
                    <p className="text-lg font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {formatRupiah(dbStats.totalSalesAmount ?? 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                    <p className="text-neutral-500 dark:text-neutral-400">Jenis Sampah</p>
                    <p className="text-lg font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-0.5">
                      {dbStats.wasteTypeCount ?? wasteTypes.length}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Editor JSON Langsung (data/db.json)
                </label>
                <textarea
                  rows={16}
                  value={dbJsonText}
                  onChange={(e) => setDbJsonText(e.target.value)}
                  spellCheck={false}
                  className="w-full p-4 font-mono text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-950 text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveDbJson}
                  disabled={dbSaving || !dbJsonText}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 flex items-center gap-2 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{dbSaving ? 'Menyimpan...' : 'Simpan Perubahan ke Server'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: CREATE / EDIT SALE */}
      {saleModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  {editingSale ? `Sunting Data Penjualan (${editingSale.id})` : 'Catat Penjualan Sampah Manual'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Perubahan langsung tersimpan ke data spreadsheet server.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSaleModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Nama Warga *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSellerName}
                    onChange={(e) => setFormSellerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    RT / Wilayah *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSellerRt}
                    onChange={(e) => setFormSellerRt(e.target.value)}
                    placeholder="Contoh: RT 003"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Tanggal & Waktu *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Rincian Jenis Sampah & Harga Aktual
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultWtId = wasteTypes.find((w) => w.isActive !== false)?.id || wasteTypes[0]?.id || '';
                      setFormRows((prev) => [
                        ...prev,
                        { rowId: `r-${Date.now()}-${Math.random()}`, wasteTypeId: defaultWtId, weight: '', pricePerKg: '' }
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                {formRows.map((row, idx) => {
                  const wt = wasteTypes.find((w) => w.id === row.wasteTypeId);
                  const wNum = parseFloat(row.weight) || 0;
                  const pNum = parseFloat(row.pricePerKg) || 0;
                  const sub = Math.round(wNum * pNum);
                  return (
                    <div
                      key={row.rowId}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700"
                    >
                      <div className="sm:col-span-4 space-y-1">
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Jenis Sampah #{idx + 1}
                        </label>
                        <select
                          value={row.wasteTypeId}
                          onChange={(e) =>
                            setFormRows((prev) =>
                              prev.map((item) =>
                                item.rowId === row.rowId ? { ...item, wasteTypeId: e.target.value } : item
                              )
                            )
                          }
                          className="w-full px-2.5 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        >
                          {wasteTypes.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.name} ({type.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Berat ({wt?.unit || 'kg'})
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          required
                          value={row.weight}
                          onChange={(e) =>
                            setFormRows((prev) =>
                              prev.map((item) =>
                                item.rowId === row.rowId ? { ...item, weight: e.target.value } : item
                              )
                            )
                          }
                          className="w-full px-2.5 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-3 space-y-1">
                        <label className="block text-[10px] font-bold text-neutral-500">
                          Harga / {wt?.unit || 'kg'} (Rp)
                        </label>
                        <input
                          type="number"
                          step="50"
                          min="1"
                          required
                          value={row.pricePerKg}
                          onChange={(e) =>
                            setFormRows((prev) =>
                              prev.map((item) =>
                                item.rowId === row.rowId ? { ...item, pricePerKg: e.target.value } : item
                              )
                            )
                          }
                          className="w-full px-2.5 py-2 text-xs font-mono tabular-nums rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold text-neutral-500">Subtotal</label>
                        <div className="px-2.5 py-2 text-xs font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700 truncate">
                          {formatRupiah(sub)}
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          disabled={formRows.length === 1}
                          onClick={() =>
                            setFormRows((prev) =>
                              prev.length > 1 ? prev.filter((item) => item.rowId !== row.rowId) : prev
                            )
                          }
                          className="p-2 rounded-lg text-neutral-500 hover:text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setSaleModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingSale}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60"
                >
                  {savingSale ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {deletingSale && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Hapus Catatan Penjualan?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Anda yakin ingin menghapus transaksi <strong className="font-mono text-neutral-900 dark:text-white">{deletingSale.id}</strong> atas nama <strong className="text-neutral-900 dark:text-white">{deletingSale.sellerName}</strong> ({formatRupiah(deletingSale.totalAmount)})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSale(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deletingLoading}
                onClick={handleConfirmDeleteSale}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
              >
                {deletingLoading ? 'Menghapus...' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WASTE CATEGORY CREATE / EDIT */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                {editingCat ? 'Sunting Jenis Sampah' : 'Tambah Jenis Sampah Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setCatModalOpen(false)}
                className="p-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Nama Jenis Sampah *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Contoh: Botol PET Bening"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={catGroup}
                    onChange={(e) => setCatGroup(e.target.value)}
                    placeholder="Plastik / Kertas / Logam"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Satuan
                  </label>
                  <select
                    value={catUnit}
                    onChange={(e) => setCatUnit(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="liter">liter</option>
                    <option value="pcs">pcs</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingCat}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60"
                >
                  {savingCat ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESTORE CONFIRMATION */}
      {pendingRestoreJson && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Konfirmasi Pemulihan Basis Data
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Memulihkan file JSON ini akan menimpa data server (<code className="font-mono">data/db.json</code>) saat ini. Pastikan Anda sudah mengunduh cadangan terlebih dahulu.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingRestoreJson(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={dbSaving}
                onClick={handleConfirmRestoreFile}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-60"
              >
                {dbSaving ? 'Memulihkan...' : 'Ya, Pulihkan Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-700 shadow-2xl"
          >
            <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-800 text-white">
              <p className="text-xs font-bold truncate">{previewPhoto.title}</p>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-neutral-950">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
