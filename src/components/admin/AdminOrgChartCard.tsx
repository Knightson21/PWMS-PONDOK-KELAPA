import React, { useState, useEffect, useRef } from 'react';
import { Upload, RotateCcw, Network, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface AdminOrgChartCardProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

function compressOrgChartImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxWidth = 1600;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminOrgChartCard: React.FC<AdminOrgChartCardProps> = ({ onNotify }) => {
  const [orgChartImageUrl, setOrgChartImageUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    api
      .getPublicProfile()
      .then((profile) => {
        setOrgChartImageUrl(profile?.orgChartImageUrl || '');
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotify('error', 'Berkas bagan harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onNotify('error', 'Ukuran gambar bagan maksimal 10 MB.');
      return;
    }

    setSaving(true);
    try {
      const compressed = await compressOrgChartImage(file);
      const res = await api.updateOrgChartImage(compressed);
      setOrgChartImageUrl(res.orgChartImageUrl);
      onNotify('success', res.message);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal mengunggah gambar bagan struktur.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToAutoDiagram = async () => {
    setSaving(true);
    try {
      const res = await api.updateOrgChartImage('');
      setOrgChartImageUrl('');
      onNotify('success', res.message);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal mengatur ulang bagan struktur.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <Network className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Bagan Struktur Organisasi (Halaman Profil)</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Secara bawaan, halaman Profil menampilkan bagan hierarki otomatis sesuai SK Lurah No. 184 Tahun 2025. Unggah gambar bagan resmi Anda di sini jika ingin menampilkannya sebagai gambar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadFile}
            className="hidden"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{saving ? 'Menyimpan...' : orgChartImageUrl ? 'Ganti Gambar Bagan' : 'Unggah Gambar Bagan'}</span>
          </button>

          {orgChartImageUrl && (
            <button
              type="button"
              disabled={saving}
              onClick={handleResetToAutoDiagram}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Gunakan Bagan Otomatis</span>
            </button>
          )}
        </div>
      </div>

      {orgChartImageUrl ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Aktif: Menampilkan gambar bagan unggahan kustom di halaman Profil</span>
          </p>
          <div className="rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-4 flex justify-center">
            <img
              src={orgChartImageUrl}
              alt="Pratinjau bagan struktur organisasi"
              className="max-h-72 w-auto object-contain rounded-lg"
            />
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Aktif: Bagan Hierarki Visual Otomatis</strong> (Ketua → Sekretaris & Bendahara → Humas, Pelaksana, Pemilah). Unggah file gambar kapan saja jika ingin menggantinya dengan gambar bagan kustom.
          </span>
        </div>
      )}
    </div>
  );
};
