import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';

interface AdminLoginPageProps {
  onGoPublic: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onGoPublic }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ensure clean empty fields whenever this login page mounts
  useEffect(() => {
    setIdentifier('');
    setPassword('');
    setError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Masukkan identitas admin dan kata sandi terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(identifier.trim(), password);
      if (loggedInUser.role !== 'admin') {
        setError('Akses ditolak. Halaman ini khusus untuk Administrator Bank Sampah.');
      }
    } catch (err: any) {
      setError(err?.message || 'Identitas atau kata sandi admin tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col justify-between p-4 sm:p-6 transition-colors">
      {/* Top Bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <button
          type="button"
          onClick={onGoPublic}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Halaman Publik</span>
        </button>

        <ThemeToggle />
      </header>

      {/* Main Centered Login Card */}
      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
          <div className="px-7 pt-8 pb-6 text-center border-b border-neutral-100 dark:border-neutral-800 space-y-3">
            <img
              src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.12.54_f474b6b5.jpeg"
              alt="Logo Resmi Bank Sampah Persatuan"
              className="w-16 h-16 mx-auto object-contain rounded-full border-2 border-amber-400 bg-neutral-950 shadow-sm"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akses Terbatas Pengurus</span>
              </div>
              <h1 className="text-xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Login Admin Bank Sampah
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Masuk untuk mengelola spreadsheet data penjualan sampah warga & ekspor data.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" className="p-7 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="admin-identifier"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300"
              >
                Username / Email / No. HP Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-identifier"
                  name="admin_identifier_input"
                  type="text"
                  autoComplete="off"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan identitas admin"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-neutral-700 dark:text-neutral-300"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  name="admin_password_input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk ke Panel Admin</span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-neutral-400 dark:text-neutral-500 py-2">
        Bank Sampah “Persatuan” (Kreasi 308) · RW 08 Kelurahan Pondok Kelapa
      </footer>
    </div>
  );
};
