import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

const STATUS_MESSAGES = [
  { time: 0, text: 'Connecting to Claude...' },
  { time: 5, text: 'Searching LinkedIn and the web...' },
  { time: 15, text: 'Scanning Reddit and blogs...' },
  { time: 30, text: 'Analyzing signals and matching pain points...' },
  { time: 60, text: 'Deep research in progress...' },
  { time: 90, text: 'Still working — thorough research takes time...' }
];

export default function StatusBar({ isActive, mode }) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startRef.current = Date.now();
      const tick = () => {
        setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    } else {
      setElapsed(0);
      startRef.current = null;
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isActive]);

  if (!isActive) return null;

  const currentMessage = [...STATUS_MESSAGES]
    .reverse()
    .find(m => elapsed >= m.time)?.text || 'Starting...';

  const modeLabel = mode === 'leads' ? 'Finding warm leads' : 'Researching company';

  return (
    <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Loader2 className="w-5 h-5 animate-spin text-red-400" />
            <div className="absolute inset-0 w-5 h-5 rounded-full bg-red-400/20 animate-ping" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{modeLabel}</p>
            <p className="text-xs text-slate-400">{currentMessage}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-semibold text-white">{elapsed}s</p>
          <p className="text-xs text-slate-500">elapsed</p>
        </div>
      </div>
    </div>
  );
}
