import { useEffect, useRef, useState } from 'react';
import { CameraOff, AlertTriangle } from 'lucide-react';
import { WS_BASE_URL } from '../config';

interface Metrics {
  state: string;
  drowsinessScore: number;
  confidence: number;
  ear: number;
  perclos: number;
  blinkRate: number;
  yawnCount: number;
  faceDetected: boolean;
  reasons: string[];
}

interface CameraStreamProps {
  onMetricsUpdate: (metrics: Metrics) => void;
  isActive: boolean;
}

export default function CameraStream({ onMetricsUpdate, isActive }: CameraStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [error, setError] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      startCamera();
      connectWebSocket();
    } else {
      stopCamera();
      if (wsRef.current) wsRef.current.close();
    }
    return () => {
      stopCamera();
      if (wsRef.current) wsRef.current.close();
    };
  }, [isActive]);

  const connectWebSocket = () => {
    wsRef.current = new WebSocket(`${WS_BASE_URL}/ws/detection/1`); // Mock session ID 1
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.faceDetected) {
          onMetricsUpdate({
            state: data.state,
            drowsinessScore: data.drowsinessScore,
            confidence: data.confidence,
            ear: data.ear,
            perclos: data.perclos,
            blinkRate: data.blinkRate,
            yawnCount: data.yawnCount,
            faceDetected: true,
            reasons: data.reasons || []
          });
        }
      } catch (err) {
        console.error("WS Parse error", err);
      }
    };
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError('');
    } catch (err) {
      setError('Camera access is required for real-time drowsiness detection. Please allow camera access and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Frame capture loop
  useEffect(() => {
    if (!isActive || !stream) return;
    
    let animationFrameId: number;
    let lastTime = 0;
    const fps = 10; // Throttle to 10 fps to save bandwidth
    const interval = 1000 / fps;

    const processFrame = (time: number) => {
      if (time - lastTime >= interval) {
        if (videoRef.current && canvasRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          const context = canvasRef.current.getContext('2d');
          if (context) {
            context.drawImage(videoRef.current, 0, 0, 640, 480);
            const base64Frame = canvasRef.current.toDataURL('image/jpeg', 0.6);
            wsRef.current.send(JSON.stringify({ frame: base64Frame }));
          }
        }
        lastTime = time;
      }
      animationFrameId = requestAnimationFrame(processFrame);
    };

    animationFrameId = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, stream]);

  return (
    <div className="relative w-full h-full bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
      {error ? (
        <div className="text-center p-6 max-w-sm">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <p className="text-gray-300 text-sm">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${isActive ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* Hidden canvas for extracting frames */}
          <canvas ref={canvasRef} width={640} height={480} className="hidden" />
          
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-black/80">
              <CameraOff size={48} className="mb-4 opacity-50" />
              <p>Camera inactive. Start session to begin monitoring.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
