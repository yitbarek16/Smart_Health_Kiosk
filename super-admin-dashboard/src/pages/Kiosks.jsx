import { useState, useEffect } from 'react';
import api from '../api/client';

const emptyForm = { kioskId: '', wifiSsid: '', latitude: '', longitude: '', address: '', firmwareVersion: '1.0.0' };

export default function Kiosks() {
  const [kiosks, setKiosks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await api.get('/admin/kiosks');
    setKiosks(data.kiosks);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/admin/kiosks', {
      ...form,
      latitude: Number(form.latitude) || 0,
      longitude: Number(form.longitude) || 0,
    });
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  const statusColors = { online: 'bg-green-50 text-green-700', offline: 'bg-gray-100 text-gray-600', maintenance: 'bg-yellow-50 text-yellow-700' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Kiosks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : '+ Register Kiosk'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="kioskId" value={form.kioskId} onChange={handleChange} placeholder="Kiosk ID (e.g., KIOSK-002)" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="wifiSsid" value={form.wifiSsid} onChange={handleChange} placeholder="WiFi SSID" required className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" type="number" step="any" className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" type="number" step="any" className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="address" value={form.address} onChange={handleChange} placeholder="Address" className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <input name="firmwareVersion" value={form.firmwareVersion} onChange={handleChange} placeholder="Firmware Version" className="border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700">
            Register Kiosk
          </button>
        </form>
      )}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Kiosk ID</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">WiFi SSID</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Address</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Last Heartbeat</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Firmware</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {kiosks.map((k) => (
              <tr key={k._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{k.kioskId}</td>
                <td className="px-6 py-4">{k.wifiSsid}</td>
                <td className="px-6 py-4 text-gray-500">{k.address}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[k.status]}`}>{k.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">
                  {k.lastHeartbeat ? new Date(k.lastHeartbeat).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-gray-500">{k.firmwareVersion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
