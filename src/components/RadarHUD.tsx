import React from 'react';
import { Radio, MapPin, Zap } from 'lucide-react';
import { EmergencyUnit, Location } from '../types';
import { calculateDistance } from '../lib/utils';

export default function RadarHUD({ 
  units, 
  userLocation 
}: { 
  units: EmergencyUnit[], 
  userLocation: Location | null 
}) {
  if (!userLocation) return null;

  const nearby = units.map(unit => ({
    ...unit,
    distance: calculateDistance(userLocation, unit.location)
  })).sort((a, b) => a.distance - b.distance);

  const getDistanceColor = (d: number) => {
    if (d < 200) return 'text-red-500 font-bold animate-pulse';
    if (d < 500) return 'text-orange-500';
    if (d < 1000) return 'text-yellow-500';
    return 'text-white/40';
  };

  return (
    <div className="bg-black/80 border border-white/10 p-4 rounded-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2">
        <Radio size={14} className="text-red-500" />
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase">Proximity Motor (L3)</h3>
      </div>
      
      <div className="space-y-3">
        {nearby.slice(0, 3).map(unit => (
          <div key={unit.id} className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] opacity-70 flex items-center gap-1">
                <MapPin size={10} /> {unit.callsign}
              </span>
              <span className={`text-[10px] font-mono ${getDistanceColor(unit.distance)}`}>
                {Math.round(unit.distance)}m
              </span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${unit.distance < 200 ? 'bg-red-500' : 'bg-white/40'}`}
                style={{ width: `${Math.min(100, (1 - unit.distance / 2000) * 100)}%` }}
              />
            </div>
          </div>
        ))}
        {nearby.length === 0 && (
          <p className="text-[9px] opacity-30 italic text-center py-2">Escaneando unidades de emergencia...</p>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-white/10 flex justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] opacity-40 uppercase">Safe-Route</span>
          <span className="text-[9px] text-green-500 flex items-center gap-1"><Zap size={10} /> ACTIVO</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] opacity-40 uppercase">Izcalli-Sec</span>
          <span className="text-[10px] font-mono">2.4.0-KERN</span>
        </div>
      </div>
    </div>
  );
}
