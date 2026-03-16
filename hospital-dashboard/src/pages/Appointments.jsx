import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Appointments() {
  const { socket } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('pending');

  useEffect(() => { load(); }, [filter]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => load();
    socket.on('new_appointment_request', handler);
    return () => socket.off('new_appointment_request', handler);
  }, [socket]);

  async function load() {
    const { data } = await api.get(`/appointments/hospital?status=${filter}`);
    setAppointments(data.appointments);
  }

  async function review(id, action) {
    const body = { action };
    if (action === 'approve') {
      const dateStr = prompt('Appointment date (YYYY-MM-DD):');
      if (dateStr) body.appointmentDate = dateStr;
    }
    if (action === 'reject') {
      const reason = prompt('Rejection reason:');
      if (reason === null) return;
      body.rejectionReason = reason;
    }
    await api.patch(`/appointments/${id}/review`, body);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Appointment Requests</h2>
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === s ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {filter === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
          Pending appointments show patient name, condition, and receipt only. Vital sign data is shared after you approve.
        </div>
      )}
      <div className="space-y-4">
        {appointments.map((a) => (
          <div key={a._id} className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{a.patientId?.name || 'Patient'}</h3>
                <p className="text-sm text-gray-500">{a.patientId?.phone}</p>
                {a.conditionLabel && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {a.conditionLabel}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{a.bookingFee} ETB</p>
                <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <a href={a.receiptImageUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline text-sm">
                View Receipt
              </a>
              {filter === 'pending' && (
                <div className="ml-auto flex gap-2">
                  <button onClick={() => review(a._id, 'approve')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => review(a._id, 'reject')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
                    Reject
                  </button>
                </div>
              )}
              {a.status === 'approved' && a.appointmentDate && (
                <p className="ml-auto text-sm text-green-700 font-medium">
                  Scheduled: {new Date(a.appointmentDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <p className="text-center text-gray-400 py-12">No {filter} appointments</p>
        )}
      </div>
    </div>
  );
}
