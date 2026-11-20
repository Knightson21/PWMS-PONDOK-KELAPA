import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Camera,
  Upload,
  Search,
  ShoppingBag,
  X,
  Image as ImageIcon,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { api } from '../../services/api';
import type { TokoProduct } from '../../types';

interface AdminTokoProductsTabProps {
  onNotify: (type: 'success' | 'error', text: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Olahan Organik & Mijel',
  'Kerajinan Daur Ulang',
  'Busana & Karnaval',
  'Perlengkapan Pilah'
];

function formatRupiah(val: number): string {
  return 'Rp' + Math.round(val || 0).toLocaleString('id-ID');
}

function compressProductImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = () => {
      const result = String(reader.result || '');
      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxWidth = 1200;
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
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

export const AdminTokoProductsTab: React.FC<AdminTokoProductsTabProps> = ({ onNotify }) => {
  const [products, setProducts] = useState<TokoProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Quick photo upload state
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const [quickPhotoTargetId, setQuickPhotoTargetId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Create / Edit Product Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<TokoProduct | null>(null);
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState(DEFAULT_CATEGORIES[0]);
  const [harga, setHarga] = useState('');
  const [unit, setUnit] = useState('buah');
  const [deskripsi, setDeskripsi] = useState('');
  const [manfaat, setManfaat] = useState('');
  const [badge, setBadge] = useState('');
  const [tersedia, setTersedia] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete Confirmation Modal
  const [deletingProduct, setDeletingProduct] = useState<TokoProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminProducts();
      setProducts(data);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal memuat daftar produk Toko.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [products, search]);

  const triggerQuickPhotoUpload = (productId: string) => {
    setQuickPhotoTargetId(productId);
    quickFileInputRef.current?.click();
  };

  const handleQuickPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !quickPhotoTargetId) return;

    if (!file.type.startsWith('image/')) {
      onNotify('error', 'Berkas harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onNotify('error', 'Ukuran gambar maksimal 10 MB.');
      return;
    }

    const targetId = quickPhotoTargetId;
    setUploadingId(targetId);
    try {
      const compressed = await compressProductImage(file);
      const res = await api.updateAdminProduct(targetId, { imageUrl: compressed });
      setProducts((prev) => prev.map((p) => (p.id === targetId ? res.product : p)));
      onNotify('success', `Foto produk "${res.product.nama}" berhasil diperbarui.`);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal mengunggah foto produk.');
    } finally {
      setUploadingId(null);
      setQuickPhotoTargetId(null);
    }
  };

  const handleClearProductPhoto = async (product: TokoProduct) => {
    setUploadingId(product.id);
    try {
      const res = await api.updateAdminProduct(product.id, { imageUrl: '' });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.product : p)));
      onNotify('success', `Foto produk "${product.nama}" dihapus.`);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal menghapus foto produk.');
    } finally {
      setUploadingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setNama('');
    setKategori(DEFAULT_CATEGORIES[0]);
    setHarga('');
    setUnit('buah');
    setDeskripsi('');
    setManfaat('');
    setBadge('');
    setTersedia(true);
    setImageUrl('');
    setModalOpen(true);
  };

  const openEditModal = (product: TokoProduct) => {
    setEditingProduct(product);
    setNama(product.nama);
    setKategori(product.kategori || DEFAULT_CATEGORIES[0]);
    setHarga(String(product.harga));
    setUnit(product.unit || 'buah');
    setDeskripsi(product.deskripsi || '');
    setManfaat(product.manfaat || '');
    setBadge(product.badge || '');
    setTersedia(product.tersedia !== false);
    setImageUrl(product.imageUrl || '');
    setModalOpen(true);
  };

  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onNotify('error', 'Berkas foto harus berupa gambar (JPG, PNG, WEBP).');
      return;
    }
    try {
      const compressed = await compressProductImage(file);
      setImageUrl(compressed);
    } catch {
      onNotify('error', 'Gagal memproses gambar.');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedHarga = Number(harga);
    if (!nama.trim()) {
      onNotify('error', 'Nama produk wajib diisi.');
      return;
    }
    if (!Number.isFinite(parsedHarga) || parsedHarga < 0) {
      onNotify('error', 'Harga produk harus berupa angka valid.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nama: nama.trim(),
        kategori: kategori.trim() || 'Kerajinan Daur Ulang',
        harga: Math.round(parsedHarga),
        unit: unit.trim() || 'buah',
        deskripsi: deskripsi.trim(),
        manfaat: manfaat.trim(),
        badge: badge.trim() || undefined,
        tersedia,
        imageUrl: imageUrl.trim()
      };

      if (editingProduct) {
        const res = await api.updateAdminProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? res.product : p)));
        onNotify('success', res.message);
      } else {
        const res = await api.createAdminProduct(payload);
        setProducts((prev) => [res.product, ...prev]);
        onNotify('success', res.message);
      }
      setModalOpen(false);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal menyimpan produk.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    try {
      const res = await api.deleteAdminProduct(deletingProduct.id);
      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setDeletingProduct(null);
      onNotify('success', res.message);
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal menghapus produk.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleTersedia = async (product: TokoProduct) => {
    try {
      const res = await api.updateAdminProduct(product.id, { tersedia: !product.tersedia });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? res.product : p)));
      onNotify(
        'success',
        `Status stok "${product.nama}" diubah menjadi ${res.product.tersedia ? 'Tersedia' : 'Stok Habis'}.`
      );
    } catch (err: any) {
      onNotify('error', err?.message || 'Gagal memperbarui status stok.');
    }
  };

  const tokoStats = useMemo(() => {
    const tersediaCount = products.filter((p) => p.tersedia).length;
    const withPhotoCount = products.filter((p) => Boolean(p.imageUrl)).length;
    const catMap = new Map<string, { kategori: string; tersedia: number; habis: number; total: number }>();
    products.forEach((p) => {
      const cat = (p.kategori || 'Lainnya').trim();
      const prev = catMap.get(cat) || { kategori: cat, tersedia: 0, habis: 0, total: 0 };
      if (p.tersedia) prev.tersedia += 1;
      else prev.habis += 1;
      prev.total += 1;
      catMap.set(cat, prev);
    });
    return {
      tersediaCount,
      habisCount: products.length - tersediaCount,
      withPhotoCount,
      chartData: Array.from(catMap.values()).sort((a, b) => b.total - a.total)
    };
  }, [products]);

  return (
    <div className="space-y-5">
      {/* Hidden Quick Photo Input */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuickPhotoChange}
        className="hidden"
      />

      {/* Toolbar Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Kelola Produk Toko & Foto Katalog ({products.length} Produk)</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Tambah, sunting, hapus, atau ganti foto produk Toko UP2K Kreasi 308 secara langsung. Perubahan langsung tampil di halaman Toko publik.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk Toko..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            type="button"
            onClick={loadProducts}
            title="Muat ulang daftar produk"
            className="p-2 rounded-xl text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Product Category & Stock Availability Chart */}
      {!loading && tokoStats.chartData.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Sebaran Produk Toko per Kategori & Status Stok
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {tokoStats.tersediaCount} tersedia · {tokoStats.habisCount} stok habis · {tokoStats.withPhotoCount} dari {products.length} produk sudah memiliki foto
              </p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-600" />
                Tersedia
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 dark:bg-neutral-600" />
                Stok Habis
              </span>
            </div>
          </div>

          <div className="h-[175px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tokoStats.chartData}
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
                  dataKey="kategori"
                  width={136}
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
                    `${value} produk`,
                    name === 'tersedia' ? 'Tersedia' : 'Stok Habis'
                  ]}
                />
                <Bar dataKey="tersedia" stackId="toko" fill="#d97706" barSize={16} />
                <Bar dataKey="habis" stackId="toko" fill="#a3a3a3" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          Memuat daftar produk Toko...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-12 text-center space-y-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm font-bold text-neutral-900 dark:text-white">
            Belum ada produk ditemukan.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800"
          >
            + Tambah Produk Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProducts.map((p) => {
            const isUploading = uploadingId === p.id;
            return (
              <div
                key={p.id}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col justify-between"
              >
                {/* Photo Preview Header */}
                <div className="aspect-[16/10] bg-neutral-100 dark:bg-neutral-800/80 relative border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-center overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.nama}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-500 gap-1.5 p-4 text-center">
                      <ImageIcon className="w-7 h-7" />
                      <span className="text-[11px] font-medium">Belum ada foto produk</span>
                    </div>
                  )}

                  {/* Quick Photo Controls Overlay */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => triggerQuickPhotoUpload(p.id)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-neutral-900/85 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Mengunggah...' : p.imageUrl ? 'Ganti Foto' : 'Unggah Foto'}</span>
                    </button>

                    {p.imageUrl && (
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => handleClearProductPhoto(p)}
                        title="Hapus foto produk"
                        className="p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-colors disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-mono text-neutral-400">{p.id}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTersedia(p)}
                        className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                          p.tersedia
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700'
                        }`}
                      >
                        {p.tersedia ? 'Tersedia' : 'Stok Habis'}
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                      {p.nama}
                    </h3>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                      {p.kategori}
                      {p.badge ? ` · ${p.badge}` : ''}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                      {p.deskripsi || 'Tanpa deskripsi.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-black font-mono tabular-nums text-neutral-900 dark:text-white">
                        {formatRupiah(p.harga)}
                      </span>
                      <span className="text-[11px] text-neutral-500 ml-1">/{p.unit}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 flex items-center gap-1"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Sunting</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProduct(p)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Hapus produk"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
                {editingProduct ? `Sunting Produk (${editingProduct.id})` : 'Tambah Produk Toko Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Photo Upload Block */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Foto Produk
                </label>
                <input
                  ref={modalFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleModalPhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                  <div className="w-full sm:w-36 aspect-[4/3] rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-xs text-neutral-600 dark:text-neutral-300">
                      Unggah foto asli produk (JPG, PNG, WEBP). Gambar dikompresi otomatis agar cepat dimuat.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{imageUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
                      </button>
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Tas Anyaman Sachet Kopi Kreasi 308"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    list="toko-category-suggestions"
                    required
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                  <datalist id="toko-category-suggestions">
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Label Sorotan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Contoh: Best Seller / Favorit Warga"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Harga (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={harga}
                    onChange={(e) => setHarga(e.target.value)}
                    placeholder="25000"
                    className="w-full px-3 py-2 text-xs font-mono tabular-nums rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Satuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Contoh: buah, sak 5 kg, botol 500 ml"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Manfaat & Fungsi
                </label>
                <textarea
                  rows={2}
                  value={manfaat}
                  onChange={(e) => setManfaat(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={tersedia}
                  onChange={(e) => setTersedia(e.target.checked)}
                  className="rounded accent-emerald-600 w-4 h-4"
                />
                <span>Produk tersedia untuk dipesan warga</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : 'Simpan Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-md p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-extrabold text-neutral-900 dark:text-white">
              Hapus Produk Toko?
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Anda yakin ingin menghapus produk <strong className="text-neutral-900 dark:text-white">{deletingProduct.nama}</strong> ({deletingProduct.id}) dari katalog Toko?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
