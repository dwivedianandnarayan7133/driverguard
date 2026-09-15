import { useState, useEffect } from 'react';
import { History, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/sessions/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-gray-400">Loading sessions...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center"><History className="mr-3"/> Session History</h1>
      
      {sessions.length === 0 ? (
        <div className="bg-[#121214] border border-white/5 rounded-xl p-12 text-center text-gray-500">
          <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p>No driving sessions available.</p>
        </div>
      ) : (
        <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-[#18181b] border-b border-white/5 text-gray-300">
              <tr>
                <th className="px-6 py-4 font-medium">Session ID</th>
                <th className="px-6 py-4 font-medium">Start Time</th>
                <th className="px-6 py-4 font-medium">Duration (s)</th>
                <th className="px-6 py-4 font-medium text-right">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s: any) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">#{s.id}</td>
                  <td className="px-6 py-4">{new Date(s.start_time).toLocaleString()}</td>
                  <td className="px-6 py-4">{s.duration} s</td>
                  <td className="px-6 py-4 text-right">
                     <span className={`px-2 py-1 rounded-md bg-opacity-20 ${s.average_score < 20 ? 'bg-green-500 text-green-400' : 'bg-red-500 text-red-400'}`}>
                        {s.average_score.toFixed(1)}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
