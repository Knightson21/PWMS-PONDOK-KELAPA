import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Camera,
  ZoomIn,
  Download,
  X,
  BookOpen
} from 'lucide-react';

export const EdukasiSection: React.FC = () => {
  // Poster Lightbox state
  const [selectedPoster, setSelectedPoster] = useState<{
    src: string;
    title: string;
    subtitle: string;
    filename: string;
  } | null>(null);

  const educationalPosters = [
    {
      src: '/assets/aistudio/WhatsApp_Image_2026-11-12_at_18.32.10__1__b4b97a8d.jpeg',
      title: 'Ekonomi Sirkular',
      subtitle: 'Mengubah Pola: Dari Sekali Pakai Menjadi Berkelanjutan',
      description:
        'Infografis prinsip utama 3R (Reduce, Reuse, Recycle), manfaat ekologis dan ekonomi hijau, serta langkah nyata memilah sampah dari rumah bersama Bank Sampah Persatuan.',
      filename: 'Poster-Ekonomi-Sirkular-BSP.jpeg'
    },
    {
      src: '/assets/aistudio/WhatsApp_Image_2026-11-12_at_18.32.10_a5d0b31a.jpeg',
      title: 'Responsible Consumption',
      subtitle: 'Konsumsi Bijak, Hidup Lebih Baik',
      description:
        'Panduan konsumsi bertanggung jawab melalui 4 prinsip utama: pikirkan dampaknya, gunakan secukupnya, pilih produk ramah lingkungan, dan dukung pengelolaan sampah.',
      filename: 'Poster-Responsible-Consumption-BSP.jpeg'
    }
  ];

  return (
    <div className="space-y-14 py-6 sm:py-10">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-blue-900 via-teal-900 to-neutral-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-teal-800/40">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-200">
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Pusat Edukasi Lingkungan Hidup & Keberlanjutan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-balance">
            Edukasi Pengelolaan Sampah Berkelanjutan
          </h1>
          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Sarana pembelajaran publik mengenai <strong>Ekonomi Sirkular</strong>, prinsip konsumsi bertanggung jawab, serta panduan pemilahan sampah dari rumah demi lingkungan RW 08 yang bersih dan lestari.
          </p>
        </div>
      </section>

      {/* POSTER EDUKASI RESMI BANK SAMPAH PERSATUAN (Langsung Ditampilkan) */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-8 transition-colors">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Poster Edukasi Resmi</span>
            <span aria-hidden="true">·</span>
            <span>Bank Sampah Persatuan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white text-balance">
            Poster Edukasi Ekonomi Sirkular & Konsumsi Bijak
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Media edukasi visual resmi Bank Sampah Persatuan untuk warga. Klik gambar poster untuk memperbesar agar lebih nyaman dibaca, atau unduh untuk keperluan sosialisasi lingkungan RT/RW.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {educationalPosters.map((poster) => (
            <article
              key={poster.src}
              className="flex flex-col justify-between rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setSelectedPoster(poster)}
                className="group relative w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4 sm:p-6 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label={`Perbesar poster ${poster.title}`}
              >
                <img
                  src={poster.src}
                  alt={`Poster Edukasi ${poster.title} - ${poster.subtitle}`}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[560px] object-contain rounded-xl shadow-md transition-transform duration-200 group-hover:scale-[1.01]"
                />
                <span className="absolute bottom-7 right-7 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/85 text-white text-xs font-semibold shadow-lg backdrop-blur-xs opacity-90 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Perbesar Poster</span>
                </span>
              </button>

              <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-neutral-900/80">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {poster.title}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {poster.subtitle}
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pt-1">
                    {poster.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPoster(poster)}
                    className="px-4 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Lihat Penuh</span>
                  </button>
                  <a
                    href={poster.src}
                    download={poster.filename}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PANDUAN PEMILAHAN SAMPAH 4 KATEGORI */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-8 transition-colors">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 tracking-wide">
            Panduan Teknis Pemilahan
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white text-balance">
            Cara Memilah Sampah Dari Rumah Sesuai Standar Bank Sampah
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Kunci keberhasilan pengelolaan sampah bermula dari pemilahan yang disiplin dan bersih di dapur masing-masing keluarga.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
              01 · Organik / Basah
            </p>
            <h4 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
              Sampah Dapur & Daun
            </h4>
            <p className="text-xs text-emerald-900 dark:text-emerald-300 leading-relaxed">
              Sisa sayuran mentah, kulit buah, ampas teh/kopi, dedaunan pekarangan.
            </p>
            <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-400">
              <strong>Solusi:</strong> Masukkan lubang biopori atau olah jadi kompos organik.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
            <p className="text-xs font-bold text-blue-800 dark:text-blue-400">
              02 · Anorganik Kering
            </p>
            <h4 className="text-base font-bold text-blue-950 dark:text-blue-200">
              Bernilai Jual Ekonomi
            </h4>
            <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
              Kardus, kertas HVS, koran, botol plastik bening/PET, kaleng susu, besi, aluminium.
            </p>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-400">
              <strong>Solusi:</strong> Bersihkan, keringkan, pipihkan, jual ke Bank Sampah Persatuan.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400">
              03 · Minyak Jelantah
            </p>
            <h4 className="text-base font-bold text-amber-950 dark:text-amber-200">
              Minyak Goreng Bekas
            </h4>
            <p className="text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
              Minyak jelantah sisa menggoreng yang sudah disaring dari remah makanan.
            </p>
            <div className="pt-2 border-t border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-400">
              <strong>Solusi:</strong> Simpan di botol tertutup, serahkan untuk diolah jadi lilin aromaterapi / sabun.
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3">
            <p className="text-xs font-bold text-rose-800 dark:text-rose-400">
              04 · Residu & B3
            </p>
            <h4 className="text-base font-bold text-rose-950 dark:text-rose-200">
              Sampah Khusus / Bahaya
            </h4>
            <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed">
              Baterai, lampu TL, popok bayi, pembalut, obat kedaluwarsa, pecahan kaca kotor.
            </p>
            <div className="pt-2 border-t border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-400">
              <strong>Solusi:</strong> Pisahkan dalam kantong khusus untuk diangkut petugas DLH ke tempat pengolahan akhir B3.
            </div>
          </div>
        </div>
      </section>

 {/* DOKUMENTASI NYATA SOSIALISASI WARGA */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wide">
              Edukasi Lapangan Nyata · RW 08 Kp. Curug
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white text-balance">
              Sosialisasi & Pendampingan Warga Secara Langsung
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Edukasi di Bank Sampah Persatuan tidak hanya berlangsung di atas kertas. Pengurus dan relawan terjun langsung ke lingkungan RT 001 s.d. RT 016 untuk memberikan pelatihan pemilahan sampah dari rumah serta tata cara pencatatan penjualan sampah warga.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Pendampingan langsung pencatatan digital warga</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Diskusi interaktif pemilahan 4 kategori sampah</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700 shadow-md aspect-[16/10] bg-neutral-900">
              <img
                src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.58.58_f75d5c65.jpeg"
                alt="Sosialisasi Edukasi Pemilahan Sampah bersama Ibu-Ibu Warga RW 08"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 text-center flex items-center justify-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Dokumentasi Edukasi Lapangan Pengurus BSP KREASI 308</span>
            </p>
          </div>
        </div>
      </section>

      {/* Poster Lightbox Modal */}
      {selectedPoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPoster(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Pratinjau ${selectedPoster.title}`}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white truncate">
                  {selectedPoster.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {selectedPoster.subtitle}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedPoster.src}
                  download={selectedPoster.filename}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Poster</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedPoster(null)}
                  className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  aria-label="Tutup pratinjau poster"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center">
              <img
                src={selectedPoster.src}
                alt={`Poster Edukasi ${selectedPoster.title}`}
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
