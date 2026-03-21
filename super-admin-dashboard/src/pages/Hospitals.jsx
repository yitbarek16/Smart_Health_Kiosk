import { useState, useEffect } from 'react';
import api from '../api/client';

const emptyForm = { name: '', latitude: '', longitude: '', address: '', phone: '', specializations: '', bookingFee: '' };

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api.get('/admin/hospitals');
    setHospitals(data.hospitals);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const body = {
      ...form,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
      bookingFee: Number(form.bookingFee) || 0,
      specializations: form.specializations.split(',').map((s) => s.trim()).filter(Boolean),
    };
    if (editing) {
      await api.put(`/admin/hospitals/${editing}`, body);
    } else {
      await api.post('/admin/hospitals', body);
    }
    setForm(emptyForm);
    setEditing(null);
    setShowForm(false);
    load();
  }

  function startEdit(h) {
    setForm({
      name: h.name,
      latitude: h.location?.coordinates?.[1] || '',
      longitude: h.location?.coordinates?.[0] || '',
      address: h.address,
      phone: h.phone,
      specializations: h.specializations.join(', '),
      bookingFee: h.bookingFee,
    });
    setEditing(h._id);
    setShowForm(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Hospitals</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditing(null); setForm(emptyForm); }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Add Hospital'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Hospital Name" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" type="number" step="any" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" type="number" step="any" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="bookingFee" value={form.bookingFee} onChange={handleChange} placeholder="Booking Fee (ETB)" type="number" className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="specializations" value={form.specializations} onChange={handleChange} placeholder="Specializations (comma-separated)" className="md:col-span-2 border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700">
            {editing ? 'Update' : 'Create'} Hospital
          </button>
        </form>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Address</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Specializations</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Fee</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {hospitals.map((h) => (
              <tr key={h._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{h.name}</td>
                <td className="px-6 py-4 text-gray-500">{h.address}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {h.specializations.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{s}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">{h.bookingFee} ETB</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${h.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {h.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => startEdit(h)} className="text-indigo-600 hover:underline text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
