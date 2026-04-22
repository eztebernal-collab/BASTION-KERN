import React, { useState } from 'react';
import { AlertTriangle, Radio, Users, ShieldAlert, Send } from 'lucide-react';
import { Telemetry, Alert } from '../types';

export default function AdminPanel({ 
  users, 
  onSendAlert 
}: { 
  users: Telemetry[], 
  onSendAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void 
}) {
  const [alertForm, setAlertForm] = useState({ title: '', message: '', severity: 'high' as any });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendAlert({ ...alertForm, createdBy: 'ADMIN_IK' });
    setAlertForm({ title: '', message: '', severity: 'high' });
  };

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md border-l border-white/10 p-6 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="text-red-500 w-8 h-8" />
        <div>
          <h2 className="text-xl font-bold tracking-tighter">ESTACIÓN C4</h2>
          <p className="text-[10px] opacity-50 uppercase">Izcalli-Kern Control</p>
        </div>
      </div>

      {/* User Telemetry List */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 opacity-70">
          <Users size={16} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Nodos Activos ({users.length})</h3>
        </div>
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="group flex items-center justify-between p-2 border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-crosshair">
              <div>
                <p className="text-xs font-bold">{user.name}</p>
                <p className="text-[9px] opacity-40 uppercase">{user.id.slice(0, 8)} • {user.level}</p>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-[10px] opacity-30 italic">No hay nodos detectados en el radio operacional.</p>
          )}
        </div>
      </section>

      {/* Manual Alert Trigger */}
      <section className="mt-auto">
        <div className="flex items-center gap-2 mb-4 opacity-70">
          <Radio size={16} className="animate-pulse text-red-500" />
          <h3 className="text-xs font-bold uppercase tracking-widest">Disparar Alerta Flash</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            type="text" 
            placeholder="TÍTULO DE ALERTA"
            className="w-full bg-white/5 border border-white/10 p-2 text-xs focus:outline-none focus:border-red-500 transition-colors"
            value={alertForm.title}
            onChange={e => setAlertForm({...alertForm, title: e.target.value})}
            required
          />
          <textarea 
            placeholder="MENSAJE TÁCTICO..."
            className="w-full bg-white/5 border border-white/10 p-2 text-xs h-24 focus:outline-none focus:border-red-500 transition-colors resize-none"
            value={alertForm.message}
            onChange={e => setAlertForm({...alertForm, message: e.target.value})}
            required
          />
          <select 
            className="w-full bg-white/5 border border-white/10 p-2 text-xs focus:outline-none"
            value={alertForm.severity}
            onChange={e => setAlertForm({...alertForm, severity: e.target.value as any})}
          >
            <option value="low">BAJA</option>
            <option value="medium">MEDIA</option>
            <option value="high">ALTA</option>
            <option value="critical">CRÍTICA (911)</option>
          </select>
          <button 
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white p-3 text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Send size={14} />
            Transmitir Mensaje
          </button>
        </form>
      </section>
    </div>
  );
}
