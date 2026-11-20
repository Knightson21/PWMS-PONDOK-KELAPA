import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Phone, AlertCircle } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset inputs whenever modal opens or closes
  useEffect(() => {
    if (isLoginModalOpen) {
      setPhone('');
      setPassword('');
      setError(null);
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!phone.trim() || !password) {
      setError('Nomor HP dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(phone.trim(), password);
      setPhone('');
      setPassword('');
      closeLoginModal();
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa nomor HP dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Authentic Round Logo */}
        <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between bg-neutral-50/70 dark:bg-neutral-850">
          <div className="flex items-center gap-3">
            <img 
              src="/assets/aistudio/WhatsApp_Image_2026-10-29_at_15.12.54_f474b6b5.jpeg" 
              alt="Logo Resmi Bank Sampah Persatuan" 
              className="w-12 h-12 object-contain rounded-full shadow-sm border-2 border-amber-400 bg-neutral-950"
            />
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">Masuk Sistem PWMS</h3>
              <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Bank Sampah Persatuan</p>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">Kreasi 308 · Wadah Kreativitas</p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Form without Demo Cards */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4" autoComplete="off">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Nomor Handphone (ID Login)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Memverifikasi...' : 'Masuk Sekarang'}
            </button>
          </div>

          <div className="pt-1 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Nasabah baru didaftarkan langsung oleh pengelola di lokasi Bank Sampah Persatuan.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
