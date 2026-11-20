import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import type { WasteSaleRecord } from '../../types';

interface AdminAllSalesChartsProps {
  sales: WasteSaleRecord[];
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatRupiah(val: number): string {
  return 'Rp' + Math.round(val || 0).toLocaleString('id-ID');
}

function formatCompactRupiah(val: number): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)} jt`;
  if (val >= 1000) return `${Math.round(val / 1000)} rb`;
  return String(Math.round(val));
}

export const AdminAllSalesCharts: React.FC<AdminAllSalesChartsProps> = ({ sales }) => {
  const [metric, setMetric] = useState<'amount' | 'weight'>('amount');
  const [breakdownMode, setBreakdownMode] = useState<'category' | 'rt'>('category');

  // Monthly chronological trend across filtered sales
  const monthlyData = useMemo(() => {
    const map = new Map<string, { key: string; label: string; amount: number; weight: number; count: number }>();

    sales.forEach((sale) => {
      const d = new Date(sale.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${SHORT_MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`;
      const prev = map.get(key) || { key, label, amount: 0, weight: 0, count: 0 };
      prev.amount += Math.round(sale.totalAmount || 0);
      prev.weight = Number((prev.weight + (sale.totalWeight || 0)).toFixed(2));
      prev.count += 1;
      map.set(key, prev);
    });

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [sales]);

  // Breakdown by category or RT
  const breakdownData = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; weight: number }>();

    if (breakdownMode === 'category') {
      sales.forEach((sale) => {
        sale.items.forEach((it) => {
          const name = (it.category || 'Anorganik').trim();
          const prev = map.get(name) || { name, amount: 0, weight: 0 };
          prev.amount += Math.round(it.subtotal || 0);
          prev.weight = Number((prev.weight + (it.weight || 0)).toFixed(2));
          map.set(name, prev);
        });
      });
    } else {
      sales.forEach((sale) => {
        const name = (sale.sellerRt || 'Lainnya').trim();
        const prev = map.get(name) || { name, amount: 0, weight: 0 };
        prev.amount += Math.round(sale.totalAmount || 0);
        prev.weight = Number((prev.weight + (sale.totalWeight || 0)).toFixed(2));
        map.set(name, prev);
      });
    }

    return Array.from(map.values())
      .sort((a, b) => (metric === 'amount' ? b.amount - a.amount : b.weight - a.weight))
      .slice(0, 7);
  }, [sales, breakdownMode, metric]);

  if (sales.length === 0) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      {/* Monthly Trend Bar Chart */}
      <div className="xl:col-span-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Tren Penjualan Antar-Bulan
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Perkembangan {metric === 'amount' ? 'total nilai (Rp)' : 'total berat (kg)'} sesuai filter aktif.
            </p>
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setMetric('amount')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                metric === 'amount'
                  ? 'bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Nilai (Rp)
            </button>
            <button
              type="button"
              onClick={() => setMetric('weight')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                metric === 'weight'
                  ? 'bg-white dark:bg-neutral-900 text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Berat (kg)
            </button>
          </div>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 8, right: 12, left: 2, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.22)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#737373' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#737373' }}
                tickLine={false}
                axisLine={false}
                width={56}
                tickFormatter={(v) => (metric === 'amount' ? formatCompactRupiah(v) : `${v} kg`)}
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
                  metric === 'amount'
                    ? formatRupiah(Number(value))
                    : `${Number(value).toLocaleString('id-ID')} kg`,
                  metric === 'amount' ? 'Total Nilai' : 'Total Berat'
                ]}
              />
              <Bar
                dataKey={metric}
                fill={metric === 'amount' ? '#059669' : '#2563eb'}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category or RT Horizontal Bar Chart */}
      <div className="xl:col-span-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Peringkat {breakdownMode === 'category' ? 'Kategori Sampah' : 'Wilayah RT'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Top 7 berdasarkan {metric === 'amount' ? 'nilai jual' : 'volume berat'}.
            </p>
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setBreakdownMode('category')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                breakdownMode === 'category'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Kategori
            </button>
            <button
              type="button"
              onClick={() => setBreakdownMode('rt')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                breakdownMode === 'rt'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Per RT
            </button>
          </div>
        </div>

        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={breakdownData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 6, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#737373' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (metric === 'amount' ? formatCompactRupiah(v) : `${v} kg`)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={94}
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
                  metric === 'amount'
                    ? formatRupiah(Number(value))
                    : `${Number(value).toLocaleString('id-ID')} kg`,
                  metric === 'amount' ? 'Nilai' : 'Berat'
                ]}
              />
              <Bar
                dataKey={metric}
                fill={breakdownMode === 'category' ? '#d97706' : '#0891b2'}
                radius={[0, 6, 6, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
