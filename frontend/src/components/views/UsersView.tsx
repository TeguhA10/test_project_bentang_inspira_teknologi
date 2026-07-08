import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UsersView: React.FC = () => {
  const {
    currentUser,
    users,
    handleOpenUserModal,
    handleDeleteUser,
    formatDate
  } = useApp();

  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-slide">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-800">Manajemen Users</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex items-center flex-1 sm:flex-initial">
            <Search className="absolute left-3 text-slate-400 pointer-events-none" size={16} />
            <input
              className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition-all w-full sm:w-64 bg-white"
              type="text"
              placeholder="Cari user (nama, role)..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0" onClick={() => handleOpenUserModal()}>
            <Plus size={16} />
            Tambah User
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">#</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Nama Lengkap</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Email</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Role / Group</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Status</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Tanggal Dibuat</th>
              <th className="px-6 py-4 bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, idx) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{idx + 1}</td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle font-semibold">{user.name}</td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{user.email}</td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user.status ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {user.status ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">{formatDate(user.created_at)}</td>
                <td className="px-6 py-4 text-slate-700 border-b border-slate-100 align-middle">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                      onClick={() => handleOpenUserModal(user)}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Delete"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.id === currentUser?.user_id} // self delete safety
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  Tidak ada data user.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
