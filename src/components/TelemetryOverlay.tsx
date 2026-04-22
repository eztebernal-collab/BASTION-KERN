import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export default function TelemetryOverlay() {
  const [mse, setMse] = useState(0.00124);
  const timeRef = useRef<HTMLSpanElement>(null);
  const msRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    
    // Unrounded microsecond clock for psycho-visual precision (Heartbeat)
    const tick = () => {
      if (timeRef.current && msRef.current) {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        const ms = String(now.getMilliseconds()).padStart(3, '0');
        
        timeRef.current.innerText = `${hrs}:${mins}:${secs}`;
        msRef.current.innerText = `:${ms}`;
      }
      animationFrameId = requestAnimationFrame(tick);
    };
    animationFrameId = requestAnimationFrame(tick);

    // Simulated MSE drift (Mean Squared Error) based on Kullback-Leibler logic
    const driftInterval = setInterval(() => {
      setMse(prev => Math.abs(prev + (Math.random() - 0.5) * 0.0001));
    }, 150);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(driftInterval);
    };
  }, []);

  const isHighMSE = mse > 0.0014;

  // TIER-8: Biological Information Encoding
  // Calculate logarithmic glow radius and opacity inversely proportional to MSE
  const glowOpacity = isHighMSE ? 0.8 : Math.max(0.2, Math.min(1, Math.abs(Math.log10(mse + 0.0001)) / 4));
  const glowRadius = isHighMSE ? 40 : Math.max(10, 25 * glowOpacity);
  const glowColor = isHighMSE ? `rgba(255, 0, 0, ${glowOpacity})` : `rgba(0, 255, 255, ${glowOpacity})`;
  const borderColor = isHighMSE ? `rgba(255, 0, 0, 0.8)` : `rgba(0, 255, 255, ${glowOpacity * 0.5})`;

  return (
    <div 
      className={`absolute top-6 right-6 z-[60] bg-black/90 p-4 rounded-lg backdrop-blur-md pointer-events-none w-64 spline-trans ${isHighMSE ? 'animate-mse-critical-blink' : ''}`}
      style={{ 
        boxShadow: `0 0 ${glowRadius}px ${glowColor}`,
        border: `1px solid ${borderColor}`
      }}
    >
      <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
        <h3 className="text-[10px] font-bold text-white/50 tracking-[0.2em] uppercase flex items-center gap-2">
          <Activity size={12} className={isHighMSE ? "text-red-500 animate-pulse" : "text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]"} />
          SYS-HEARTBEAT
        </h3>
        <div className={`w-2 h-2 rounded-full ${isHighMSE ? 'bg-red-500 animate-ping' : 'bg-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.8)]'}`} />
      </div>
      
      {/* High-Precision Clock Rendering */}
      <div className="flex justify-start items-baseline mb-3 font-mono font-black text-white tracking-widest">
        <span ref={timeRef} className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">00:00:00</span>
        <span ref={msRef} className="text-sm text-red-500 ml-1">...</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <span className="text-[10px] text-white/40">Drift Eq (MSE):</span>
          <span className={`text-xs font-mono font-black ${isHighMSE ? 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]' : 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]'}`}>
            {mse.toFixed(6)}
          </span>
        </div>
        
        {/* Simple inline Sparkline simulation */}
        <div className="w-full h-6 mt-2 flex items-end gap-[2px] opacity-70">
           {[...Array(24)].map((_, i) => (
             <motion.div 
               key={i}
               className={`flex-1 ${isHighMSE ? 'bg-red-500' : 'bg-cyan-400'}`}
               animate={{ height: `${20 + Math.random() * 80}%` }}
               transition={{ duration: 0.1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
             />
           ))}
        </div>
      </div>
    </div>
  );
}
