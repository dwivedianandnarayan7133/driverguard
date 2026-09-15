import { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState({
    earThreshold: 0.25,
    marThreshold: 0.50,
    perclosWindow: 60,
    cameraResolution: '640x480'
  });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white flex items-center"><SettingsIcon className="mr-3" /> System Settings</h1>
      
      <div className="bg-[#121214] border border-white/5 p-6 rounded-xl space-y-6">
        <h2 className="text-lg font-medium text-gray-300 border-b border-white/5 pb-2">Detection Thresholds</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">EAR Threshold (Eye Aspect Ratio)</label>
            <input type="number" step="0.01" value={config.earThreshold} onChange={e => setConfig({...config, earThreshold: parseFloat(e.target.value)})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Value below which eyes are considered closed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">MAR Threshold (Mouth Aspect Ratio)</label>
            <input type="number" step="0.01" value={config.marThreshold} onChange={e => setConfig({...config, marThreshold: parseFloat(e.target.value)})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Value above which mouth is considered yawning.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">PERCLOS Window (seconds)</label>
            <input type="number" value={config.perclosWindow} onChange={e => setConfig({...config, perclosWindow: parseInt(e.target.value)})}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            <p className="text-xs text-gray-500 mt-1">Rolling window for calculating eye closure percentage.</p>
          </div>
        </div>

        <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors mt-4">
          <Save size={18} className="mr-2" /> Save Config
        </button>
      </div>
      
      <div className="bg-[#121214] border border-white/5 p-6 rounded-xl space-y-6">
         <h2 className="text-lg font-medium text-red-400 border-b border-red-500/20 pb-2">Privacy & Data Retention</h2>
         <p className="text-sm text-gray-400">By default, webcam video frames are processed in-memory and discarded. Frames are never permanently saved to disk.</p>
         <div className="flex items-center">
            <input type="checkbox" id="logging" defaultChecked className="mr-3" />
            <label htmlFor="logging" className="text-white text-sm">Store anonymized numerical metrics (EAR, PERCLOS) for session history.</label>
         </div>
      </div>
    </div>
  );
}
