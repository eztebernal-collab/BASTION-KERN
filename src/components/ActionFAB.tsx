import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  AlertTriangle, 
  Shield, 
  Navigation, 
  Droplet, 
  X, 
  Phone,
  MessageSquare
} from 'lucide-react';

export default function ActionFAB({ 
  onSOS, 
  onRoute, 
  onReport 
}: { 
  onSOS: () => void, 
  onRoute: () => void, 
  onReport: (type: 'accident' | 'blockade' | 'flood') => void 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { icon: <Phone size={20} />, label: '911 SOS', color: 'bg-red-600', onClick: onSOS },
    { icon: <Navigation size={20} />, label: 'Safe-Route', color: 'bg-blue-600', onClick: onRoute },
    { icon: <AlertTriangle size={20} />, label: 'Accidente', color: 'bg-orange-600', onClick: () => onReport('accident') },
    { icon: <Droplet size={20} />, label: 'Inundación', color: 'bg-cyan-600', onClick: () => onReport('flood') },
  ];

  return (
    <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 mb-2">
            {actions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { action.onClick(); setIsOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg ${action.color} transition-transform active:scale-90`}
              >
                <span className="text-xs font-bold uppercase tracking-widest">{action.label}</span>
                {action.icon}
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(255,62,62,0.3)] transition-all active:scale-95 ${
          isOpen ? 'bg-zinc-800 rotate-45' : 'bg-red-600'
        }`}
      >
        {isOpen ? <Plus size={28} /> : <Shield size={28} />}
      </button>
    </div>
  );
}
