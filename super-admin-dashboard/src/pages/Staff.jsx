import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Staff() {
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'provider', hospitalId: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const [staffRes, hospRes] = await Promise.all([
      api.get('/admin/staff'),
      api.get('/admin/hospitals'),
    ]);
    setUsers(staffRes.data.users);
    setHospitals(hospRes.data.hospitals);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/admin/staff', {
      ...form,
      hospitalId: form.hospitalId || null,
    });
    setForm({ username: '', password: '', name: '', role: 'provider', hospitalId: '' });
    setShowForm(false);
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Staff Accounts</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Create Account'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="provider">Hospital Provider</option>
            <option value="super_admin">Super Admin</option>
          </select>
          {form.role === 'provider' && (
            <select value={form.hospitalId} onChange={(e) => setForm({ ...form, hospitalId: e.target.value })} className="md:col-span-2 border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Select Hospital</option>
              {hospitals.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
            </select>
          )}
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700">
            Create Account
          </button>
        </form>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Username</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Role</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Hospital</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{u.name}</td>
                <td className="px-6 py-4">{u.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'super_admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{u.hospitalId?.name || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
