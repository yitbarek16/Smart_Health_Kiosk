import { useState, useEffect } from 'react';
import api from '../api/client';

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { load(); }, [filter]);

  async function load() {
    const url = filter === 'pending' ? '/subscriptions/pending' : `/subscriptions?status=${filter}`;
    const { data } = await api.get(url);
    setSubs(data.subscriptions);
  }

  async function review(id, action) {
    const body = { action };
    if (action === 'reject') {
      const reason = prompt('Rejection reason:');
      if (reason === null) return;
      body.rejectionReason = reason;
    }
    await api.patch(`/subscriptions/${id}/review`, body);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Subscriptions</h2>
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'expired'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Patient</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Amount</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Method</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Receipt</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Date</th>
              {filter === 'pending' && <th className="text-left px-6 py-3 font-medium text-gray-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {subs.map((sub) => (
              <tr key={sub._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium">{sub.patientId?.name}</p>
                  <p className="text-gray-500 text-xs">{sub.patientId?.phone}</p>
                </td>
                <td className="px-6 py-4">{sub.amount} ETB</td>
                <td className="px-6 py-4">{sub.paymentMethod}</td>
                <td className="px-6 py-4">
                  <a href={sub.receiptImageUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                    View
                  </a>
                </td>
                <td className="px-6 py-4 text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</td>
                {filter === 'pending' && (
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => review(sub._id, 'approve')} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
                      Approve
                    </button>
                    <button onClick={() => review(sub._id, 'reject')} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                      Reject
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {subs.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No subscriptions found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
