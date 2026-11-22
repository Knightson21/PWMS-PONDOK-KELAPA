import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Download,
  Plus,
  Search,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Receipt,
  Scale,
  Wallet,
  MapPin,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import type { WasteSaleRecord, WasteType } from '../../types';
import { buildWasteCategoryOptions, filterAndProjectSales } from '../../utils/adminSalesFilter';

interface AdminMonthlySectionProps {
  sales: WasteSaleRecord[];
  wasteTypes: WasteType[];
  loading: boolean;
  onCreateSale: (defaultMonthKey?: string) => void;
  onEditSale: (sale: WasteSaleRecord) => void;
  onDeleteSale: (sale: WasteSaleRecord) => void;
  onPreviewPhoto: (photo: { url: string; title: string }) => void;
  onExportMonthCsv: (
    monthKey: string,
    monthLabel: string,
    monthSales: WasteSaleRecord[],
    activeCategory?: string
  ) => void;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const CHART_COLORS = [
  '#059669', // emerald-600
  '#2563eb', // blue-600
  '#d97706', // amber-600
  '#0891b2', // cyan-600
  '#7c3aed', // violet-600
  '#dc2626', // red-600
  '#4f46e5', // indigo-600
  '#65a30d'  // lime-600
];

function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getSaleMonthKey(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string): string {
  const [yStr, mStr] = monthKey.split('-');
  const y = Number(yStr);
  const mIdx = Number(mStr) - 1;
  if (!y || mIdx < 0 || mIdx > 11) return monthKey;
  return `${MONTH_NAMES_ID[mIdx]} ${y}`;
}

function shiftMonthKey(monthKey: string, delta: number): string {
  const [yStr, mStr] = monthKey.split('-');
  const d = new Date(Number(yStr), Number(mStr) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(monthKey: string): number {
  const [yStr, mStr] = monthKey.split('-');
  return new Date(Number(yStr), Number(mStr), 0).getDate();
}

function formatRupiah(val: number): string {
  return 'Rp' + Math.round(val || 0).toLocaleString('id-ID');
}

function formatCompactRupiah(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)} jt`;
  if (val >= 1000) return `${Math.round(val / 1000)} rb`;
  return String(Math.round(val));
}

export const AdminMonthlySection: React.FC<AdminMonthlySectionProps> = ({
  sales,
  wasteTypes,
  loading,
  onCreateSale,
  onEditSale,
  onDeleteSale,
  onPreviewPhoto,
  onExportMonthCsv
}) => {
  const currentMonthKey = useMemo(() => getCurrentMonthKey(), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [chartMetric, setChartMetric] = useState<'amount' | 'weight'>('amount');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [monthSearch, setMonthSearch] = useState<string>('');

  // Exact database waste categories + guaranteed "Organik"
  const categoryOptions = useMemo(
    () => buildWasteCategoryOptions(wasteTypes, sales),
    [wasteTypes, sales]
  );

  // Collect all months present in sales + current month + selected month
  const availableMonthOptions = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((s) => {
      const k = getSaleMonthKey(s.date);
      if (k) map.set(k, (map.get(k) || 0) + 1);
    });
    if (!map.has(currentMonthKey)) map.set(currentMonthKey, 0);
    if (!map.has(selectedMonth)) map.set(selectedMonth, 0);

    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, count]) => ({
        key,
        label: formatMonthLabel(key),
        count
      }));
  }, [sales, currentMonthKey, selectedMonth]);

  // Latest month that actually contains data (for quick jump if current month is empty)
  const latestPopulatedMonth = useMemo(() => {
    const found = availableMonthOptions.find((m) => m.count > 0);
    return found || null;
  }, [availableMonthOptions]);

  // Sales strictly in selectedMonth
  const monthSales = useMemo(() => {
    return sales
      .filter((s) => getSaleMonthKey(s.date) === selectedMonth)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, selectedMonth]);

  // Filtered & category-projected sales feeding KPIs, charts, table, and CSV export
  const { projectedSales: activeMonthSales, originalById } = useMemo(
    () =>
      filterAndProjectSales(monthSales, {
        category: selectedCategory,
        searchQuery: monthSearch
      }),
    [monthSales, selectedCategory, monthSearch]
  );

  const hasActiveFilter = selectedCategory !== 'ALL' || Boolean(monthSearch.trim());

  // Monthly KPI summary (dynamically synced with active filter)
  const kpi = useMemo(() => {
    const totalTransactions = activeMonthSales.length;
    const totalWeight = Number(
      activeMonthSales.reduce((acc, s) => acc + (s.totalWeight || 0), 0).toFixed(2)
    );
    const totalAmount = Math.round(
      activeMonthSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0)
    );

    const rtTotals = new Map<string, { amount: number; weight: number; count: number }>();
    activeMonthSales.forEach((s) => {
      const rt = (s.sellerRt || 'Lainnya').trim();
      const prev = rtTotals.get(rt) || { amount: 0, weight: 0, count: 0 };
      prev.amount += s.totalAmount || 0;
      prev.weight += s.totalWeight || 0;
      prev.count += 1;
      rtTotals.set(rt, prev);
    });

    let topRtName = 'Belum ada';
    let topRtWeight = 0;
    rtTotals.forEach((val, key) => {
      if (val.weight > topRtWeight) {
        topRtWeight = val.weight;
        topRtName = key;
      }
    });

    return {
      totalTransactions,
      totalWeight,
      totalAmount,
      topRtName,
      topRtWeight: Number(topRtWeight.toFixed(2)),
      activeRtCount: rtTotals.size
    };
  }, [activeMonthSales]);

  // Chart 1: Daily trend for selected month (synced with active filter)
  const dailyChartData = useMemo(() => {
    const daysCount = getDaysInMonth(selectedMonth);
    const buckets: Array<{ day: string; label: string; amount: number; weight: number; transactions: number }> = [];
    for (let d = 1; d <= daysCount; d++) {
      buckets.push({
        day: String(d),
        label: `Tgl ${d}`,
        amount: 0,
        weight: 0,
        transactions: 0
      });
    }

    activeMonthSales.forEach((sale) => {
      const dt = new Date(sale.date);
      const dayIdx = dt.getDate() - 1;
      if (dayIdx >= 0 && dayIdx < buckets.length) {
        buckets[dayIdx].amount += Math.round(sale.totalAmount || 0);
        buckets[dayIdx].weight = Number((buckets[dayIdx].weight + (sale.totalWeight || 0)).toFixed(2));
        buckets[dayIdx].transactions += 1;
      }
    });

    return buckets;
  }, [activeMonthSales, selectedMonth]);

  // Chart 2: Waste category composition (synced with active filter)
  const categoryData = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; weight: number }>();
    activeMonthSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const cat = (item.category || 'Anorganik').trim();
        const prev = map.get(cat) || { name: cat, amount: 0, weight: 0 };
        prev.amount += Math.round(item.subtotal || 0);
        prev.weight = Number((prev.weight + (item.weight || 0)).toFixed(2));
        map.set(cat, prev);
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      chartMetric === 'amount' ? b.amount - a.amount : b.weight - a.weight
    );
  }, [activeMonthSales, chartMetric]);

  const categoryMetricTotal = useMemo(() => {
    return categoryData.reduce(
      (sum, item) => sum + (chartMetric === 'amount' ? item.amount : item.weight),
      0
    );
  }, [categoryData, chartMetric]);

  // Chart 3: Contribution per RT (synced with active filter)
  const rtChartData = useMemo(() => {
    const map = new Map<string, { rt: string; amount: number; weight: number; count: number }>();
    activeMonthSales.forEach((sale) => {
      const rt = (sale.sellerRt || 'Lainnya').trim();
      const prev = map.get(rt) || { rt, amount: 0, weight: 0, count: 0 };
      prev.amount += Math.round(sale.totalAmount || 0);
      prev.weight = Number((prev.weight + (sale.totalWeight || 0)).toFixed(2));
      prev.count += 1;
      map.set(rt, prev);
    });

    return Array.from(map.values())
      .sort((a, b) => (chartMetric === 'amount' ? b.amount - a.amount : b.weight - a.weight))
      .slice(0, 8);
  }, [activeMonthSales, chartMetric]);

  const selectedMonthLabel = formatMonthLabel(selectedMonth);
  const isCurrentMonth = selectedMonth === currentMonthKey;

  return (
    <div className="space-y-6">
      {/* Month Control Header Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Periode Laporan Bulanan</span>
            {isCurrentMonth && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Bulan Berjalan</span>
              </>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {selectedMonthLabel}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Prev / Dropdown / Next Month Selector */}
          <div className="inline-flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-1">
            <button
              type="button"
              onClick={() => setSelectedMonth((m) => shiftMonthKey(m, -1))}
              title="Bulan sebelumnya"
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              aria-label="Pilih bulan laporan"
              className="px-2.5 py-1 text-xs font-bold bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {availableMonthOptions.map((opt) => (
                <option
                  key={opt.key}
                  value={opt.key}
                  className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                >
                  {opt.label} ({opt.count} trx)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setSelectedMonth((m) => shiftMonthKey(m, 1))}
              title="Bulan berikutnya"
              className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setSelectedMonth(currentMonthKey)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors whitespace-nowrap"
            >
              Bulan Ini
            </button>
          )}

          {/* Metric Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setChartMetric('amount')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                chartMetric === 'amount'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Nilai (Rp)
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('weight')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                chartMetric === 'weight'
                  ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Berat (kg)
            </button>
          </div>

          <button
            type="button"
            onClick={() =>
              onExportMonthCsv(
                selectedMonth,
                selectedMonthLabel,
                activeMonthSales,
                selectedCategory !== 'ALL' ? selectedCategory : undefined
              )
            }
            disabled={activeMonthSales.length === 0}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{hasActiveFilter ? 'Ekspor CSV Terfilter' : 'Ekspor CSV Bulan Ini'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter & Search Toolbar (Controls KPIs, Charts, Table, and CSV) */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 sm:p-4 space-y-2.5">
        <div className="flex flex-col md:flex-row md:items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={monthSearch}
              onChange={(e) => setMonthSearch(e.target.value)}
              placeholder="Cari kode transaksi, nama warga, RT, atau jenis sampah..."
              aria-label="Cari transaksi bulan ini"
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {monthSearch && (
              <button
                type="button"
                onClick={() => setMonthSearch('')}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Waste Category Dropdown */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="relative flex items-center">
              <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 absolute left-3 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter kategori sampah bulan ini"
                className="pl-8 pr-7 py-2 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="ALL">Semua Kategori Sampah</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setMonthSearch('');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors whitespace-nowrap"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {hasActiveFilter && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              Filter aktif diterapkan ke KPI, grafik, tabel & CSV
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {activeMonthSales.length} dari {monthSales.length} transaksi
            </span>
            {selectedCategory !== 'ALL' && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Kategori: <strong className="text-neutral-800 dark:text-neutral-200">{selectedCategory}</strong>
                </span>
              </>
            )}
            {monthSearch.trim() && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  Kata kunci: <strong className="text-neutral-800 dark:text-neutral-200">&ldquo;{monthSearch.trim()}&rdquo;</strong>
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Empty Month Helper Banner with Quick Jump */}
      {!loading && monthSales.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Belum ada transaksi tercatat di {selectedMonthLabel}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xl leading-relaxed">
              Transaksi penjualan sampah dari formulir Beranda maupun input manual Admin pada bulan {selectedMonthLabel} akan langsung muncul di KPI, grafik, dan tabel di bawah ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {latestPopulatedMonth && latestPopulatedMonth.key !== selectedMonth && (
              <button
                type="button"
                onClick={() => setSelectedMonth(latestPopulatedMonth.key)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <span>Lihat {latestPopulatedMonth.label} ({latestPopulatedMonth.count} trx)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onCreateSale(selectedMonth)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Penjualan Pertama</span>
            </button>
          </div>
        </div>
      )}

      {/* Empty Filter Match Banner (Month has data, but filter yields 0 results) */}
      {!loading && monthSales.length > 0 && activeMonthSales.length === 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Tidak ada transaksi yang cocok dengan filter di {selectedMonthLabel}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Bulan {selectedMonthLabel} memiliki {monthSales.length} transaksi, namun belum ada yang cocok dengan{' '}
              {selectedCategory !== 'ALL' ? `kategori "${selectedCategory}"` : 'pencarian saat ini'}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              setMonthSearch('');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Monthly KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold">Transaksi Bulan Ini</span>
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-2">
            {kpi.totalTransactions.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Dari {kpi.activeRtCount} RT aktif berpartisipasi
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold">Total Berat Terkumpul</span>
            <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-black font-mono tabular-nums text-neutral-900 dark:text-white mt-2">
            {kpi.totalWeight.toLocaleString('id-ID')}{' '}
            <span className="text-sm font-bold text-neutral-500 dark:text-neutral-400">kg</span>
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Akumulasi bobot di {selectedMonthLabel}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-emerald-200 dark:border-emerald-800/70">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold">Total Nilai Penjualan</span>
            <Wallet className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-2">
            {formatRupiah(kpi.totalAmount)}
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Rata-rata{' '}
            {kpi.totalTransactions > 0
              ? formatRupiah(kpi.totalAmount / kpi.totalTransactions)
              : 'Rp0'}{' '}
            / transaksi
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
            <span className="text-xs font-semibold">RT Teraktif</span>
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-2 truncate">
            {kpi.topRtName}
          </p>
          <p className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 mt-1">
            {kpi.topRtWeight > 0 ? `${kpi.topRtWeight.toLocaleString('id-ID')} kg terkumpul` : 'Menunggu setoran'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Chart 1: Daily Trend Area Chart (Full Width or 12 cols) */}
        <div className="xl:col-span-12 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Tren Harian Penjualan · {selectedMonthLabel}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Pergerakan {chartMetric === 'amount' ? 'nilai transaksi (Rp)' : 'volume berat sampah (kg)'} per tanggal sepanjang bulan.
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
              {chartMetric === 'amount'
                ? `Total: ${formatRupiah(kpi.totalAmount)}`
                : `Total: ${kpi.totalWeight.toLocaleString('id-ID')} kg`}
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData} margin={{ top: 10, right: 12, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="monthlyTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={chartMetric === 'amount' ? '#059669' : '#2563eb'}
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="95%"
                      stopColor={chartMetric === 'amount' ? '#059669' : '#2563eb'}
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: '#737373' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#737373' }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => (chartMetric === 'amount' ? formatCompactRupiah(v) : `${v} kg`)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#262626',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fafafa'
                  }}
                  labelFormatter={(day) => `Tanggal ${day} ${selectedMonthLabel}`}
                  formatter={(value: any) => [
                    chartMetric === 'amount'
                      ? formatRupiah(Number(value))
                      : `${Number(value).toLocaleString('id-ID')} kg`,
                    chartMetric === 'amount' ? 'Nilai Penjualan' : 'Berat Sampah'
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={chartMetric}
                  stroke={chartMetric === 'amount' ? '#059669' : '#2563eb'}
                  strokeWidth={2.5}
                  fill="url(#monthlyTrendFill)"
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Donut Chart */}
        <div className="xl:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Komposisi Kategori Sampah
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Proporsi {chartMetric === 'amount' ? 'nilai Rupiah' : 'berat (kg)'} berdasarkan kategori di {selectedMonthLabel}.
            </p>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-xs text-neutral-400">
              Belum ada data kategori pada bulan ini.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey={chartMetric}
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={84}
                      paddingAngle={2}
                    >
                      {categoryData.map((entry, idx) => (
                        <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#171717',
                        borderColor: '#262626',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: '#fafafa'
                      }}
                      formatter={(value: any) => [
                        chartMetric === 'amount'
                          ? formatRupiah(Number(value))
                          : `${Number(value).toLocaleString('id-ID')} kg`,
                        chartMetric === 'amount' ? 'Nilai' : 'Berat'
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="sm:col-span-6 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {categoryData.map((item, idx) => {
                  const val = chartMetric === 'amount' ? item.amount : item.weight;
                  const pct = categoryMetricTotal > 0 ? Math.round((val / categoryMetricTotal) * 100) : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        <span className="text-neutral-700 dark:text-neutral-200 font-medium truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right font-mono tabular-nums shrink-0">
                        <span className="font-bold text-neutral-900 dark:text-white">
                          {chartMetric === 'amount'
                            ? formatCompactRupiah(item.amount)
                            : `${item.weight} kg`}
                        </span>
                        <span className="text-neutral-400 ml-1.5 text-[11px]">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Chart 3: Contribution per RT Horizontal Bar Chart */}
        <div className="xl:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Kontribusi per RT / Wilayah · {selectedMonthLabel}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Perbandingan 8 wilayah RT dengan {chartMetric === 'amount' ? 'nilai penjualan' : 'berat setoran'} tertinggi bulan ini.
            </p>
          </div>

          {rtChartData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-xs text-neutral-400">
              Belum ada kontribusi RT pada bulan ini.
            </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rtChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 18, left: 10, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#737373' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (chartMetric === 'amount' ? formatCompactRupiah(v) : `${v} kg`)}
                  />
                  <YAxis
                    type="category"
                    dataKey="rt"
                    width={72}
                    tick={{ fontSize: 11, fill: '#737373', fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#171717',
                      borderColor: '#262626',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#fafafa'
                    }}
                    formatter={(value: any) => [
                      chartMetric === 'amount'
                        ? formatRupiah(Number(value))
                        : `${Number(value).toLocaleString('id-ID')} kg`,
                      chartMetric === 'amount' ? 'Total Nilai' : 'Total Berat'
                    ]}
                  />
                  <Bar
                    dataKey={chartMetric}
                    fill={chartMetric === 'amount' ? '#059669' : '#2563eb'}
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Transactions Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Rincian Transaksi · {selectedMonthLabel}
              {selectedCategory !== 'ALL' ? ` · ${selectedCategory}` : ''}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Menampilkan {activeMonthSales.length} dari {monthSales.length} transaksi khusus periode ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onCreateSale(selectedMonth)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat di Bulan Ini</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/80 border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400">
                <th className="py-3 px-4 font-bold whitespace-nowrap">Tanggal</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">Kode</th>
                <th className="py-3 px-4 font-bold">Nama Warga</th>
                <th className="py-3 px-4 font-bold whitespace-nowrap">RT</th>
                <th className="py-3 px-4 font-bold">Rincian Sampah</th>
                <th className="py-3 px-4 font-bold text-right whitespace-nowrap">Total Berat</th>
                <th className="py-3 px-4 font-bold text-right whitespace-nowrap">Total Nilai</th>
                <th className="py-3 px-4 font-bold text-center">Bukti</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-neutral-500 dark:text-neutral-400">
                    Memuat transaksi bulan ini...
                  </td>
                </tr>
              ) : activeMonthSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-neutral-500 dark:text-neutral-400">
                    Tidak ada transaksi di {selectedMonthLabel}
                    {selectedCategory !== 'ALL' ? ` untuk kategori ${selectedCategory}` : ''}
                    {monthSearch ? ` yang cocok dengan "${monthSearch}"` : ''}.
                  </td>
                </tr>
              ) : (
                activeMonthSales.map((sale) => {
                  const intactSale = originalById.get(sale.id) || sale;
                  const dateFormatted = new Date(sale.date).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono tabular-nums text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                        {dateFormatted}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {sale.id}
                      </td>
                      <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        {sale.sellerName}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                        {sale.sellerRt}
                      </td>
                      <td className="py-3 px-4 text-neutral-700 dark:text-neutral-300">
                        <div className="space-y-0.5">
                          {sale.items.map((it, idx) => (
                            <div key={idx} className="text-xs">
                              <span className="font-semibold text-neutral-900 dark:text-white">
                                {it.wasteTypeName}
                              </span>
                              {it.category && (
                                <span className="ml-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                                  ({it.category})
                                </span>
                              )}
                              <span className="text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                                {' '}· {it.weight} {it.unit || 'kg'} × {formatRupiah(it.pricePerKg)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                        {sale.totalWeight} kg
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatRupiah(sale.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {sale.photoUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewPhoto({
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
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditSale(intactSale)}
                            title="Sunting transaksi"
                            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSale(intactSale)}
                            title="Hapus transaksi"
                            className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
  );
};
