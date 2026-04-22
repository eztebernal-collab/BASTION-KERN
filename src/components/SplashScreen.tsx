import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

// Sigmoid Logistic Function for mathematically precise loading
const logisticSigmoid = (t: number, k = 12, t0 = 0.5) => 1 / (1 + Math.exp(-k * (t - t0)));

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    "INITIALISING BASTION-KERN TERMINAL...",
    "VERIFICANDO INTEGRIDAD DE CAPA 7 (TLS 1.3)...",
    "CARGANDO LLVM OBFUSCATOR & CONTROL FLOW FLATTENING...",
    "ESTABLECIENDO FILTRO DE KALMAN EXTENDIDO (EKF)...",
    "INICIANDO MOTOR DE VERACIDAD BAYESIANA (P ≈ 99.9%)...",
    "SOPORTE PSICOACÚSTICO NATIVO: ACTIVO.",
    "BÚSQUEDA DE SEÑAL L3: CUAUTITLÁN IZCALLI...",
    "KERN LOCK ESTABLECIDO."
  ];

  useEffect(() => {
    let startTime = performance.now();
    const DURATION = 4000; // 4 seconds total boot time

    const updatePhase = () => {
      const elapsed = performance.now() - startTime;
      const normalizedTime = Math.min(elapsed / DURATION, 1);
      
      // Apply Logistic Sigmoid
      const sigmoidValue = logisticSigmoid(normalizedTime);
      setProgress(sigmoidValue * 100);

      const expectedLogIndex = Math.floor(sigmoidValue * logs.length);
      if (expectedLogIndex !== logIndex && expectedLogIndex < logs.length) {
        setLogIndex(expectedLogIndex);
      }

      if (normalizedTime < 1) {
        requestAnimationFrame(updatePhase);
      } else {
        setTimeout(onComplete, 200);
      }
    };

    requestAnimationFrame(updatePhase);
  }, []);

  return (
    <div className="fixed inset-0 z-[5000] bg-[#050505] flex flex-col items-center justify-center font-mono text-white selection:bg-red-500/30">
      
      {/* Background Matrix/Radar sweep simulation */}
      <div className="absolute inset-0 bg-data-stream opacity-20"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center w-full max-w-sm px-6"
      >
        {/* Tier-1 Corporate Heraldic Logo Injection with TIER-8 Bio-Pulse */}
        <div className="relative mb-8 w-24 h-24 flex items-center justify-center rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(17,69,137,0.5)] border border-white/20 bg-[#114589] animate-bio-pulse">
          <img 
            src="/image_0.png" 
            alt="Bastion Heraldic Logo" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to strict Shield icon if asset is missing
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement?.classList.add('bg-transparent', 'border-none', 'shadow-none');
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
              }
            }}
          />
          <Shield size={64} className="text-white hidden absolute" strokeWidth={1} />
        </div>
        
        <h1 className="text-2xl font-black tracking-[0.2em] uppercase mb-2">BASTION-KERN</h1>
        <h2 className="text-[10px] opacity-50 tracking-[0.3em] font-bold uppercase mb-12 border-b border-white/20 pb-2">
          Tier-7 Critical Infrastructure
        </h2>

        {/* Console Log Output */}
        <div className="w-full text-left bg-black/50 border border-white/10 p-3 mb-6 h-32 overflow-hidden flex flex-col justify-end text-[9px] text-green-500 font-bold uppercase">
          {logs.slice(0, logIndex + 1).map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
            >
              {`> ${log}`}
            </motion.div>
          ))}
          <motion.span 
            animate={{ opacity: [0, 1] }} 
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            _
          </motion.span>
        </div>

        {/* Sigmoid Progress Bar */}
        <div className="w-full h-1 bg-white/10 overflow-hidden relative">
          <motion.div 
            className="absolute top-0 left-0 h-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="w-full flex justify-between mt-2 text-[8px] opacity-40 font-bold">
          <span>BOOT SEQUENCE</span>
          <span>{progress.toFixed(2)}%</span>
        </div>
      </motion.div>

      {/* Footer Identity */}
      <div className="absolute bottom-6 w-full text-center text-[9px] opacity-30 font-bold uppercase tracking-widest z-10">
        © 2026 Desarrollado por Alfredo | UK Level 3 Academic Audit
      </div>
    </div>
  );
}
