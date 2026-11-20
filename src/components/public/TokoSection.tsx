import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Tag,
  Scale,
  MessageCircle,
  Heart,
  ZoomIn,
  X,
  Image as ImageIcon
} from 'lucide-react';
import type { WasteType, TokoProduct } from '../../types';

interface TokoSectionProps {
  wasteTypes: WasteType[];
  products: TokoProduct[];
  loadingProducts?: boolean;
}

export const TokoSection: React.FC<TokoSectionProps> = ({
  wasteTypes,
  products,
  loadingProducts = false
}) => {
  const [activeKategori, setActiveKategori] = useState<string>('Semua');
  const [searchProduct, setSearchProduct] = useState<string>('');
  const [zoomProduct, setZoomProduct] = useState<TokoProduct | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  // Waste catalog search & filter
  const [wasteSearch, setWasteSearch] = useState<string>('');
  const [wasteCatFilter, setWasteCatFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const dynamicCats = Array.from(new Set(products.map((p) => p.kategori).filter(Boolean)));
    return ['Semua', ...dynamicCats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchProduct.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat = activeKategori === 'Semua' || p.kategori === activeKategori;
      const matchesSearch =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        p.deskripsi.toLowerCase().includes(q) ||
        p.kategori.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, activeKategori, searchProduct]);

  const formatRupiah = (val: number) => {
    return 'Rp' + Number(val || 0).toLocaleString('id-ID');
  };

  const getWaLink = (product: TokoProduct) => {
    const text = encodeURIComponent(
      `Halo Pengurus Bank Sampah Persatuan (Kreasi 308), saya tertarik untuk memesan / menanyakan produk berikut dari menu Toko Website:\n\n*${product.nama}*\nHarga: ${formatRupiah(product.harga)} / ${product.unit}\n\nMohon info ketersediaan stok dan cara pengambilan/pengirimannya. Terima kasih!`
    );
    return `https://wa.me/6285775437617?text=${text}`;
  };

  const wasteCategories = ['all', ...Array.from(new Set(wasteTypes.map((w) => w.category)))];
  const filteredWasteTypes = wasteTypes.filter((item) => {
    const matchesCat = wasteCatFilter === 'all' || item.category === wasteCatFilter;
    const matchesQuery =
      item.name.toLowerCase().includes(wasteSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(wasteSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-14 py-6 sm:py-10">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-amber-800 via-orange-900 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-amber-700/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-200">
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Ruang Informasi & Promosi Produk Pemanfaatan Sampah</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-balance">
            Toko Produk Daur Ulang & UP2K Kreasi 308
          </h1>
          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            Memperkenalkan produk-produk ramah lingkungan hasil olahan sampah organik dan anorganik warga Bank Sampah “Persatuan” yang memiliki nilai guna tinggi serta bernilai ekonomi nyata.
          </p>
        </div>
      </section>

      {/* Nilai Guna & Ekonomi Highlight */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Nilai Guna Tinggi</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Produk diolah secara higienis, kokoh, dan berdaya guna tinggi untuk kebutuhan harian rumah tangga, taman, dan busana.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Memberdayakan Ekonomi Warga</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                100% pendapatan produk kembali untuk mendukung ibu-ibu perajin UP2K RW 08 dan operasional bank sampah.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Dukungan Pemanfaatan Kembali</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Membeli produk daur ulang berarti Anda secara nyata mencegah sampah mencemari got, tanah, dan laut.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Controls */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
              Katalog Produk Ramah Lingkungan
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Pilih produk yang ingin Anda beli atau tanyakan langsung ketersediaannya kepada pengurus via WhatsApp.
            </p>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari produk di toko..."
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-neutral-200/60 dark:bg-neutral-800 rounded-2xl w-fit">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveKategori(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                activeKategori === cat
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-neutral-200 dark:bg-neutral-800" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                  <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
                  <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-2">
            <ShoppingBag className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-sm font-bold text-neutral-900 dark:text-white">
              Belum ada produk yang cocok dengan pencarian Anda.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Coba pilih kategori lain atau bersihkan kata kunci pencarian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => {
              const hasValidImage = Boolean(p.imageUrl && !brokenImages[p.id]);
              return (
                <article
                  key={p.id}
                  className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top 4:3 Product Photo Frame */}
                  <div className="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-800/80 relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800">
                    {hasValidImage ? (
                      <button
                        type="button"
                        onClick={() => setZoomProduct(p)}
                        className="w-full h-full block cursor-zoom-in focus:outline-none"
                        aria-label={`Perbesar foto ${p.nama}`}
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.nama}
                          referrerPolicy="no-referrer"
                          onError={() => setBrokenImages((prev) => ({ ...prev, [p.id]: true }))}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-3 right-3 p-2 rounded-lg bg-neutral-900/75 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-4 h-4" />
                        </span>
                      </button>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center bg-gradient-to-br from-neutral-100 to-amber-50/50 dark:from-neutral-800 dark:to-neutral-900">
                        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-xs">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                          {p.kategori}
                        </p>
                      </div>
                    )}

                    {!p.tersedia && (
                      <div className="absolute inset-0 bg-neutral-950/55 flex items-center justify-center">
                        <span className="px-3 py-1 rounded-lg bg-neutral-900 text-white text-xs font-bold border border-neutral-700">
                          Stok Sementara Habis
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex-wrap">
                        <span className="text-amber-800 dark:text-amber-400 font-bold">{p.kategori}</span>
                        {p.badge && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{p.badge}</span>
                          </>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-snug">
                        {p.nama}
                      </h3>

                      {p.deskripsi && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {p.deskripsi}
                        </p>
                      )}

                      {p.manfaat && (
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl text-[11px] text-neutral-700 dark:text-neutral-300 space-y-1 border border-neutral-200/60 dark:border-neutral-700">
                          <span className="font-bold text-emerald-800 dark:text-emerald-400 block">
                            Manfaat & Fungsi:
                          </span>
                          <p>{p.manfaat}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                          Harga Produk:
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-black text-amber-800 dark:text-amber-400 font-mono tabular-nums">
                            {formatRupiah(p.harga)}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-1">
                            /{p.unit}
                          </span>
                        </div>
                      </div>

                      <a
                        href={getWaLink(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs ${
                          p.tersedia
                            ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                            : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{p.tersedia ? 'Pesan / Tanya via WhatsApp' : 'Tanya Ketersediaan Stok'}</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bagian Khusus: Katalog Jenis Sampah Diterima */}
      <section className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 space-y-8 transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <Scale className="w-4 h-4" />
            <span>Daftar Jenis Sampah Diterima</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            Jenis Sampah Anorganik yang Dapat Dijual Warga
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Harga jual sampah bersifat fluktuatif menyesuaikan harga pasar pengepul dan ditulis langsung pada formulir penjualan di Beranda.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
            {wasteCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setWasteCatFilter(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all capitalize ${
                  wasteCatFilter === cat
                    ? 'bg-emerald-700 text-white'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari jenis sampah..."
              value={wasteSearch}
              onChange={(e) => setWasteSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Waste Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWasteTypes.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-400">{item.category}</span>
                  <span className="font-mono text-neutral-400 dark:text-neutral-500">{item.id}</span>
                </div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{item.name}</h4>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700 flex items-baseline justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Satuan Timbang:</span>
                <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  per {item.unit || 'kg'} · Harga Fluktuatif
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
          <strong>Syarat Penjualan Sesuai SOP:</strong> Sampah anorganik wajib dalam kondisi bersih, kering, tidak berlumut atau tercampur sisa makanan. Minyak jelantah harus disaring dari remah sisa penggorengan.
        </div>
      </section>

      {/* Product Photo Lightbox */}
      {zoomProduct && zoomProduct.imageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
          onClick={() => setZoomProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto ${zoomProduct.nama}`}
        >
          <div
            className="relative max-w-3xl w-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
                  {zoomProduct.nama}
                </h3>
                <p className="text-xs font-mono text-amber-700 dark:text-amber-400 font-bold">
                  {formatRupiah(zoomProduct.harga)} / {zoomProduct.unit}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomProduct(null)}
                className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                aria-label="Tutup pratinjau foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 sm:p-6 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
              <img
                src={zoomProduct.imageUrl}
                alt={zoomProduct.nama}
                referrerPolicy="no-referrer"
                className="max-h-[72vh] w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
