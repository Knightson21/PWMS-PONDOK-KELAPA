import React, { useState } from 'react';
import { 
  PhoneCall, 
  MapPin, 
  Mail, 
  Calendar, 
  Clock, 
  Share2, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  ChevronDown,
  ExternalLink
} from 'lucide-react';

export const KontakSection: React.FC = () => {
  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    rt: 'RT 001',
    kategoriPesan: 'Pertanyaan Pendaftaran Nasabah',
    pesan: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const sendDirectWa = () => {
    const text = encodeURIComponent(
      `Halo Pengurus Bank Sampah Persatuan (Kreasi 308),\n\nSaya ingin menyampaikan pesan/pertanyaan:\n- Nama: ${formData.nama || '-'}\n- Asal Wilayah: ${formData.rt}\n- Topik: ${formData.kategoriPesan}\n- Pesan: ${formData.pesan || '-'}\n\nMohon info dan tanggapannya. Terima kasih!`
    );
    window.open(`https://wa.me/6285775437617?text=${text}`, '_blank');
  };

  const faqs = [
    {
      q: 'Bagaimana cara mendaftar menjadi nasabah baru Bank Sampah Persatuan?',
      a: 'Warga di lingkungan RT 001 s.d. RT 016 RW 08 Kp. Curug cukup membawa KTP dan sampah terpilah pertama ke posko sekretariat. Petugas akan membuatkan akun digital di sistem PWMS dan memberikan Buku Tabungan setelah 3x penyetoran atau saldo mencapai Rp20.000,-.'
    },
    {
      q: 'Kapan saja waktu operasional penyetoran sampah warga?',
      a: 'Penyetoran sampah untuk warga internal RW 08 dilayani setiap hari dari pukul 09.00 s/d 15.00 WIB. Sedangkan hari pemilahan khusus bersama pengurus diadakan setiap hari Kamis mulai pukul 13.00 WIB s/d selesai.'
    },
    {
      q: 'Kapan uang saldo tabungan dapat ditarik atau dicairkan?',
      a: 'Uang tabungan nasabah dapat ditarik tunai kapan saja sesuai permintaan nasabah pada jam layanan operasional pengurus di sekretariat. Petugas akan mencatat penarikan secara transparan di buku tabungan dan sistem digital.'
    },
    {
      q: 'Apakah sekolah, kantor, atau komunitas di luar RW 08 boleh bekerjasama?',
      a: 'Tentu saja! Bank Sampah Persatuan menerima kerjasama penyetoran sampah anorganik, pelatihan pembuatan kerajinan daur ulang Kreasi 308, maupun studi banding pengelolaan sampah berbasis warga. Silakan hubungi kami melalui formulir kontak atau WhatsApp.'
    }
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10">
      
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-emerald-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-neutral-800">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-700/70 px-3.5 py-1 rounded-full text-xs font-bold border border-emerald-500/40">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pusat Komunikasi & Layanan Pengunjung</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Hubungi Bank Sampah “Persatuan”
          </h1>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
            Kami siap melayani kebutuhan informasi pendaftaran nasabah, penyetoran sampah, pembelian produk daur ulang, hingga kolaborasi program lingkungan di wilayah RW 08 Kelurahan Pondok Kelapa.
          </p>
        </div>
      </section>

      {/* Grid: Kontak Info & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Direct Contact Info & Schedules */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 transition-colors">
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              Informasi Sekretariat
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">Alamat Lengkap:</h4>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-0.5 leading-relaxed">
                    Kp. Curug RT 003 / RW 08 Gang Persatuan No. 50, Kelurahan Pondok Kelapa, Kecamatan Duren Sawit, Kota Jakarta Timur, DKI Jakarta 13450.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">Telepon / WhatsApp Hotline:</h4>
                  <p className="text-neutral-900 dark:text-white font-bold font-mono mt-0.5">
                    0857-7543-7617 / 0855-1844-274
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Fast response pada jam kerja</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white">Email Resmi:</h4>
                  <p className="text-neutral-900 dark:text-white font-semibold font-mono mt-0.5">
                    curugraya308@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Jam Layanan */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Jadwal Layanan Resmi (SOP)
              </h4>
              <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">Penyetoran Warga Internal RW 08:</p>
                    <p className="text-neutral-500 dark:text-neutral-400">Setiap Hari, pukul 09.00 - 15.00 WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white">Hari Pemilahan Sampah Khusus:</p>
                    <p className="text-neutral-500 dark:text-neutral-400">Setiap Hari Kamis, pukul 13.00 WIB s/d selesai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tautan Media Sosial */}
            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Media Sosial Resmi
              </h4>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="https://bit.ly/BSPersatuan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-1.5 transition-colors border border-neutral-200 dark:border-neutral-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram @BSPersatuan</span>
                </a>
                <a
                  href="https://bit.ly/Kreasi308"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-1.5 transition-colors border border-neutral-200 dark:border-neutral-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-neutral-800 dark:text-white" />
                  <span>TikTok @Kreasi308</span>
                </a>
                <a
                  href="http://bit.ly/KREASI308"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold flex items-center gap-1.5 transition-colors border border-neutral-200 dark:border-neutral-700"
                >
                  <Share2 className="w-3.5 h-3.5 text-red-600" />
                  <span>YouTube KREASI 308</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Message Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 transition-colors">
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Formulir Komunikasi
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
                Kirim Pesan, Pertanyaan, atau Saran
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Sampaikan tanggapan, pertanyaan jadwal, pemesanan produk daur ulang, atau ajakan kerjasama Anda kepada pengurus.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Pesan Anda Berhasil Terkirim!</span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Terima kasih <strong>{formData.nama}</strong>. Pengurus Bank Sampah “Persatuan” telah menerima pesan Anda dan akan merespon melalui WhatsApp atau Email secepatnya.
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        nama: '',
                        kontak: '',
                        rt: 'RT 001',
                        kategoriPesan: 'Pertanyaan Pendaftaran Nasabah',
                        pesan: ''
                      });
                    }}
                    className="px-4 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-850 transition-colors"
                  >
                    Kirim Pesan Lain
                  </button>
                  <button
                    onClick={sendDirectWa}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Lanjutkan ke WA Pengurus</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Nama Lengkap Anda *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Ibu Rina / Pak Joko"
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Nomor WhatsApp / HP Aktif *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0812xxxxxxxx"
                      value={formData.kontak}
                      onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Asal Wilayah RT (RW 08) *
                    </label>
                    <select
                      value={formData.rt}
                      onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {Array.from({ length: 16 }, (_, i) => {
                        const num = String(i + 1).padStart(3, '0');
                        return (
                          <option key={num} value={`RT ${num}`}>
                            RT {num} (RW 08)
                          </option>
                        );
                      })}
                      <option value="Luar RW 08">Luar RW 08 / Lembaga / Sekolah</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                      Kategori Pesan *
                    </label>
                    <select
                      value={formData.kategoriPesan}
                      onChange={(e) => setFormData({ ...formData, kategoriPesan: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="Pertanyaan Pendaftaran Nasabah">Pendaftaran Nasabah Baru</option>
                      <option value="Jadwal & Penyetoran Sampah">Jadwal & Penyetoran Sampah</option>
                      <option value="Pemesanan Produk Kreasi 308">Pemesanan Produk Daur Ulang / UP2K</option>
                      <option value="Ajakan Kerjasama / Studi Banding">Kerjasama Sekolah / Lembaga</option>
                      <option value="Saran & Masukan Pelayanan">Saran & Kritik Pelayanan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Isi Pesan / Pertanyaan / Saran *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tuliskan pesan lengkap Anda di sini..."
                    value={formData.pesan}
                    onChange={(e) => setFormData({ ...formData, pesan: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  ></textarea>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Mengirim...' : 'Kirim Pesan Sekarang'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={sendDirectWa}
                    className="px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-xs transition-colors flex items-center gap-2 border border-neutral-300 dark:border-neutral-700"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Kirim Langsung via WA</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Peta Lokasi & Petunjuk Arah */}
      <section className="bg-neutral-50 dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Peta Lokasi
            </span>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              Lokasi Posko & Sekretariat Kp. Curug
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
              Akses strategis di kawasan Pondok Kelapa, Duren Sawit, Jakarta Timur.
            </p>
          </div>

          <a
            href="https://maps.google.com/?q=Pondok+Kelapa+Duren+Sawit+Jakarta+Timur"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm w-fit"
          >
            <MapPin className="w-4 h-4" />
            <span>Buka Petunjuk Arah Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>

        {/* Map Visualization Card */}
        <div className="rounded-2xl overflow-hidden border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Titik Kumpul Penyetoran Sampah Warga</span>
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              Sekretariat Bank Sampah Persatuan (Kreasi 308)
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Patokan lokasi: Masuk melalui Jl. Pondok Kelapa Selatan atau Jl. Curug Raya, menuju Gang Persatuan No. 50 (Pos Ronda / Balai Warga RW 08).
            </p>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
              <p>• RT Cakupan: RT 001 hingga RT 016 RW 08</p>
              <p>• Area parkir motor & gerobak pemilahan tersedia</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-950 dark:to-neutral-850 border border-emerald-300 dark:border-emerald-700 text-center flex flex-col items-center justify-center min-w-[240px]">
            <MapPin className="w-10 h-10 text-emerald-700 dark:text-emerald-400 mb-2 animate-bounce" />
            <span className="text-xs font-bold text-neutral-900 dark:text-white">RW 08 Pondok Kelapa</span>
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400">Duren Sawit, Jakarta Timur</span>
            <span className="mt-3 text-[10px] font-mono text-emerald-900 dark:text-emerald-300 bg-white dark:bg-neutral-800 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-700">
              Kode Pos: 13450
            </span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white dark:bg-neutral-900 rounded-3xl p-8 sm:p-12 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 transition-colors">
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-950 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
            Tanya Jawab Populer
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Jawaban cepat untuk pertanyaan yang paling sering diajukan masyarakat mengenai operasional Bank Sampah Persatuan.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-neutral-900 dark:text-white text-xs sm:text-sm flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
