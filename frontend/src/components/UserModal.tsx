import React from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UserModal: React.FC = () => {
  const {
    showUserModal,
    setShowUserModal,
    selectedUser,
    userForm,
    setUserForm,
    handleSaveUser
  } = useApp();

  if (!showUserModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
          <span className="font-bold text-slate-800">{selectedUser ? 'Edit User' : 'Tambah User Baru'}</span>
          <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowUserModal(false)}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSaveUser}>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Nama Lengkap</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                type="text"
                placeholder="Masukkan nama lengkap..."
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Email</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                  type="email"
                  placeholder="contoh@mail.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Username</label>
                <input
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                  type="text"
                  placeholder="Username..."
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Password {selectedUser && '(Kosongkan jika tidak diubah)'}
              </label>
              <input
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all"
                type="password"
                placeholder="Masukkan password..."
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required={!selectedUser}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Role / Group</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light bg-white transition-all"
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="PEMBELI">Pembeli</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-600">Status</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light bg-white transition-all"
                  value={userForm.status ? 'true' : 'false'}
                  onChange={(e) => setUserForm({ ...userForm, status: e.target.value === 'true' })}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
            <button className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors text-slate-700" type="button" onClick={() => setShowUserModal(false)}>
              Batal
            </button>
            <button className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-colors" type="submit">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
