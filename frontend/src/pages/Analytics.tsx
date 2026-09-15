import { useState, useEffect } from 'react';
import { Activity, BellRing } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // In a real app we'd fetch /api/analytics
    // Here we'll just mock for the demo
    const mockData = Array.from({ length: 24 }).map((_, i) => ({
      hour: `${i}:00`,
      alerts: Math.floor(Math.random() * 5),
      drowsiness: Math.random() * 40 + (i > 2 && i < 5 ? 40 : 0) // Peak drowsiness at 3-4 AM
    }));
    setData(mockData);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center"><Activity className="mr-3"/> System Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#121214] border border-white/5 p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-6 flex items-center">
            <Activity size={16} className="mr-2" /> Average Drowsiness by Hour
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="hour" stroke="#ffffff50" fontSize={12} tickMargin={10} />
                <YAxis stroke="#ffffff50" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20' }} />
                <Line type="monotone" dataKey="drowsiness" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-[#121214] border border-white/5 p-6 rounded-xl">
          <h3 className="text-sm font-medium text-gray-400 mb-6 flex items-center">
            <BellRing size={16} className="mr-2" /> Alerts Frequency
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="hour" stroke="#ffffff50" fontSize={12} tickMargin={10} />
                <YAxis stroke="#ffffff50" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20' }} />
                <Line type="stepAfter" dataKey="alerts" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-[#121214] border border-white/5 p-6 rounded-xl mt-6 flex justify-between items-center">
         <div>
            <h3 className="text-md font-medium text-white mb-2">Export Data for College Project Presentation</h3>
            <p className="text-sm text-gray-400">Download the comprehensive CSV dataset and PDF report.</p>
         </div>
         <div className="space-x-4">
            <button className="px-4 py-2 border border-white/10 rounded hover:bg-white/5 text-sm text-gray-300">Download CSV</button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm text-white">Generate PDF</button>
         </div>
      </div>
    </div>
  );
}
