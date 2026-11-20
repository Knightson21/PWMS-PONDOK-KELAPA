import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import type { WasteType } from '../../types';

interface AdminCategoriesChartProps {
  wasteTypes: WasteType[];
}

export const AdminCategoriesChart: React.FC<AdminCategoriesChartProps> = ({ wasteTypes }) => {
  const summary = useMemo(() => {
    const active = wasteTypes.filter((w) => w.isActive !== false).length;
    const inactive = wasteTypes.length - active;

    const map = new Map<string, { category: string; aktif: number; nonaktif: number; total: number }>();
    wasteTypes.forEach((w) => {
      const cat = (w.category || 'Lainnya').trim();
      const prev = map.get(cat) || { category: cat, aktif: 0, nonaktif: 0, total: 0 };
      if (w.isActive !== false) prev.aktif += 1;
      else prev.nonaktif += 1;
      prev.total += 1;
      map.set(cat, prev);
    });

    const chartData = Array.from(map.values()).sort((a, b) => b.total - a.total);
    return { active, inactive, groupsCount: chartData.length, chartData };
  }, [wasteTypes]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
            Sebaran Jenis Sampah per Kelompok Kategori
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {wasteTypes.length} jenis sampah · {summary.active} aktif tampil di form warga · {summary.inactive} disembunyikan · {summary.groupsCount} kelompok
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
            Aktif di Form
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 dark:bg-neutral-600" />
            Nonaktif
          </span>
        </div>
      </div>

      {summary.chartData.length > 0 && (
        <div className="h-[190px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={summary.chartData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 10, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" horizontal={false} />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#737373' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="category"
                width={118}
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
                formatter={(value: any, name: any) => [
                  `${value} jenis`,
                  name === 'aktif' ? 'Aktif di Form' : 'Disembunyikan'
                ]}
              />
              <Bar dataKey="aktif" stackId="a" fill="#059669" radius={[0, 0, 0, 0]} barSize={16} />
              <Bar dataKey="nonaktif" stackId="a" fill="#a3a3a3" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
