import React from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Login: React.FC = () => {
  const {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    isLoggingIn,
    handleLogin
  } = useApp();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8 flex flex-col items-center animate-slide">
        <div className="w-14 h-14 bg-primary-light text-primary rounded-full flex items-center justify-center mb-4">
          <CreditCard size={28} />
        </div>
        <h2 className="text-2xl font-bold tracking-wide text-slate-800 mb-1">DOMPET PNBP</h2>
        <p className="text-xs text-center text-slate-500 mb-6 max-w-[280px]">
          Digital Online Management & Payment Electronic Transaction
        </p>

        {loginError && (
          <div className="w-full flex items-center gap-2 bg-danger-light border border-red-200 text-danger p-3 rounded-lg text-sm mb-4">
            <AlertCircle size={16} className="shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="username">
              Username / Email
            </label>
            <input
              id="username"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              type="text"
              placeholder="Masukkan username atau email..."
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
              type="password"
              placeholder="Masukkan password..."
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>

          <button
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2 disabled:opacity-50"
            type="submit"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
};
