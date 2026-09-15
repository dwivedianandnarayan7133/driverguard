import { useState, useEffect, useRef } from 'react';
import { Play, Square, AlertOctagon, Activity, Eye, Zap, Clock, AlertTriangle } from 'lucide-react';
import CameraStream from '../components/CameraStream';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [sessionActive, setSessionActive] = useState(false);
  const [metrics, setMetrics] = useState<{
    state: string;
    drowsinessScore: number;
    confidence: number;
    ear: number;
    perclos: number;
    blinkRate: number;
    yawnCount: number;
    faceDetected?: boolean;
    reasons: string[];
  }>({
    state: 'SAFE',
    drowsinessScore: 0,
    confidence: 100,
    ear: 0.35,
    perclos: 0,
    blinkRate: 0,
    yawnCount: 0,
    reasons: []
  });
  const [history, setHistory] = useState<any[]>([]);
  
  // Siren audio refs
  const oscRef = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (sessionActive && (metrics.state === 'CAUTION' || metrics.state === 'CRITICAL')) {
      if (!oscRef.current) {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const mainGain = ctx.createGain();

            osc.type = 'square';
            osc.frequency.value = 800; 

            lfo.type = 'sine';
            lfo.frequency.value = 2; 

            lfoGain.gain.value = 400; 
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency); 

            osc.connect(mainGain);
            mainGain.connect(ctx.destination);
            mainGain.gain.value = 0.05; 

            osc.start();
            lfo.start();
            
            oscRef.current = osc;
            lfoRef.current = lfo;
          }
        } catch (e) {
          console.error("Failed to play siren", e);
        }
      }
    } else {
      stopSiren();
    }
  }, [metrics.state, sessionActive]);

  const stopSiren = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
    if (lfoRef.current) {
      try {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
      } catch (e) {}
      lfoRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup on unmount or session end
    return () => {
      stopSiren();
    };
  }, []);

  useEffect(() => {
    if (sessionActive && metrics.state !== 'SAFE') {
      setHistory(prev => {
        const newHist = [...prev, { time: new Date().toLocaleTimeString(), score: metrics.drowsinessScore }];
        if (newHist.length > 20) return newHist.slice(newHist.length - 20);
        return newHist;
      });
    }
  }, [metrics, sessionActive]);

  const getStateColor = (state: string) => {
    switch(state) {
      case 'SAFE': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'CAUTION': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'DROWSY': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time driver monitoring and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30">
            DEMO MODE — SIMULATED DATA ALLOWED IF NO CAMERA
          </span>
          <button
            onClick={() => setSessionActive(!sessionActive)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              sessionActive 
                ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20' 
                : 'bg-blue-600 text-white hover:bg-blue-500'
            }`}
          >
            {sessionActive ? <><Square size={18} className="mr-2" /> End Session</> : <><Play size={18} className="mr-2" /> Start Session</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Camera Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video relative rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#121214]">
            <div className="absolute top-4 left-4 z-10 flex items-center bg-black/60 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
              <div className={`w-2 h-2 rounded-full mr-2 ${sessionActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-xs font-medium tracking-wider">{sessionActive ? 'LIVE' : 'OFFLINE'}</span>
            </div>
            
            <CameraStream isActive={sessionActive} onMetricsUpdate={setMetrics} />
            
            {/* Overlay Status */}
            {sessionActive && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className={`px-4 py-2 rounded-lg border backdrop-blur-md ${getStateColor(metrics.state)}`}>
                  <div className="text-xs uppercase tracking-wider opacity-80 mb-1">Driver Status</div>
                  <div className="text-xl font-bold">{metrics.state}</div>
                </div>
                {metrics.state === 'CRITICAL' && (
                  <div className="bg-red-600 text-white px-4 py-2 rounded-lg animate-bounce flex items-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                    <AlertOctagon className="mr-2" /> PLEASE STOP DRIVING
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Real-time chart */}
          <div className="bg-[#121214] border border-white/5 p-6 rounded-xl">
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center">
              <Activity size={16} className="mr-2" /> Drowsiness Timeline
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history.length ? history : [{time: '0', score: 0}]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="time" stroke="#ffffff50" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#ffffff50" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#ffffff20' }} />
                  <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Metrics Sidebar */}
        <div className="space-y-4">
          <div className={`p-6 rounded-xl border ${getStateColor(metrics.state)} flex flex-col items-center justify-center text-center transition-all bg-opacity-20`}>
            <div className="text-sm uppercase tracking-wider mb-2 font-medium opacity-80">AI Confidence</div>
            <div className="text-5xl font-bold tabular-nums">{(metrics.confidence * 100).toFixed(0)}%</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#121214] border border-white/5 p-5 rounded-xl">
              <div className="text-gray-500 text-xs uppercase mb-2 flex items-center"><Zap size={14} className="mr-1"/> Drowsiness</div>
              <div className="text-2xl font-bold text-white tabular-nums">{metrics.drowsinessScore.toFixed(0)}</div>
            </div>
            <div className="bg-[#121214] border border-white/5 p-5 rounded-xl">
              <div className="text-gray-500 text-xs uppercase mb-2 flex items-center"><Activity size={14} className="mr-1"/> EAR</div>
              <div className="text-2xl font-bold text-white tabular-nums">{metrics.ear.toFixed(2)}</div>
            </div>
            <div className="bg-[#121214] border border-white/5 p-5 rounded-xl">
              <div className="text-gray-500 text-xs uppercase mb-2 flex items-center"><Eye size={14} className="mr-1"/> PERCLOS</div>
              <div className="text-2xl font-bold text-white tabular-nums">{(metrics.perclos * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-[#121214] border border-white/5 p-5 rounded-xl">
              <div className="text-gray-500 text-xs uppercase mb-2 flex items-center"><Clock size={14} className="mr-1"/> Blinks</div>
              <div className="text-2xl font-bold text-white tabular-nums">{metrics.blinkRate}</div>
            </div>
          </div>
          
          <div className="bg-[#121214] border border-white/5 p-6 rounded-xl mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-4">Detection Reasons</h3>
            {metrics.reasons && metrics.reasons.length > 0 ? (
              <ul className="space-y-2">
                {metrics.reasons.map((r, i) => (
                  <li key={i} className="flex items-center text-sm text-red-400 bg-red-500/10 py-2 px-3 rounded">
                    <AlertTriangle size={14} className="mr-2 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 italic">No critical events detected.</div>
            )}
          </div>
          
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
             <p className="text-xs text-yellow-500 leading-relaxed text-opacity-80">
                <strong>Safety Disclaimer:</strong> DriveGuard AI is an assistive prototype system. Drivers must not rely solely on this software and should always follow safe-driving practices.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
