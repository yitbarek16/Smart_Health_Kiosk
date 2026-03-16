import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Patients() {
  const { socket } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = () => load();
    socket.on('patient_data_granted', handler);
    return () => socket.off('patient_data_granted', handler);
  }, [socket]);

  async function load() {
    const { data } = await api.get('/appointments/hospital/patients');
    setPatients(data.patients);
  }

  const detail = selected ? patients.find((p) => p.patient._id === selected) : null;

  const chartData = detail?.measurements?.slice(0, 20).reverse().map((m) => ({
    date: new Date(m.measuredAt).toLocaleDateString(),
    systolic: m.vitals?.systolicBP,
    diastolic: m.vitals?.diastolicBP,
    hr: m.vitals?.heartRate,
    spo2: m.vitals?.spo2,
  })) || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Patient Records</h2>
      <div className="flex gap-6">
        <div className="w-80 space-y-2 shrink-0">
          {patients.map((p) => {
            const latestInsight = p.insights?.[0];
            return (
              <div
                key={p.patient._id}
                onClick={() => setSelected(p.patient._id)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selected === p.patient._id ? 'bg-emerald-50 border-emerald-300' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold">{p.patient.name}</p>
                <p className="text-xs text-gray-500">{p.patient.phone}</p>
                {latestInsight && (
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                    latestInsight.riskLevel === 'critical' ? 'bg-red-50 text-red-700' :
                    latestInsight.riskLevel === 'high' ? 'bg-orange-50 text-orange-700' :
                    latestInsight.riskLevel === 'moderate' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {latestInsight.riskLevel} risk
                  </span>
                )}
              </div>
            );
          })}
          {patients.length === 0 && <p className="text-gray-400 text-center py-8">No patients with confirmed appointments</p>}
        </div>
        <div className="flex-1">
          {detail ? (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-xl font-bold mb-2">{detail.patient.name}</h3>
                <p className="text-gray-500 text-sm">{detail.patient.phone} | {detail.patient.address || 'No address'}</p>
              </div>
              {detail.measurements?.[0] && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="font-semibold mb-4">Latest Vitals</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'BP', value: `${detail.measurements[0].vitals?.systolicBP ?? '-'}/${detail.measurements[0].vitals?.diastolicBP ?? '-'} mmHg` },
                      { label: 'Heart Rate', value: `${detail.measurements[0].vitals?.heartRate ?? '-'} bpm` },
                      { label: 'SpO2', value: `${detail.measurements[0].vitals?.spo2 ?? '-'}%` },
                      { label: 'Temperature', value: `${detail.measurements[0].vitals?.temperatureCelsius ?? '-'}°C` },
                      { label: 'Weight', value: `${detail.measurements[0].vitals?.weightKg ?? '-'} kg` },
                      { label: 'Height', value: `${detail.measurements[0].vitals?.heightCm ?? '-'} cm` },
                      { label: 'BMI', value: `${detail.measurements[0].vitals?.bmi ?? '-'}` },
                      { label: 'MAP', value: `${detail.measurements[0].vitals?.meanArterialPressure ?? '-'}` },
                    ].map((v) => (
                      <div key={v.label} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">{v.label}</p>
                        <p className="text-lg font-semibold">{v.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {detail.insights?.[0] && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="font-semibold mb-2">AI Health Insight</h4>
                  <p className="text-sm">{detail.insights[0].summaryText}</p>
                  {detail.insights[0].preventiveAdvice && (
                    <p className="text-sm text-gray-600 mt-2 italic">{detail.insights[0].preventiveAdvice}</p>
                  )}
                  <p className="text-xs text-amber-700 mt-3 bg-amber-50 p-2 rounded">{detail.insights[0].disclaimer}</p>
                </div>
              )}
              {chartData.length > 1 && (
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h4 className="font-semibold mb-4">Blood Pressure Trend</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="systolic" stroke="#ef4444" name="Systolic" />
                      <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" name="Diastolic" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              Select a patient to view their records
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
