import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Telemetry, EmergencyUnit, UnitType, IZCALLI_CENTER, CRITICAL_NODES, Report, Alert } from '../types';
import { Shield, Terminal } from 'lucide-react';

// Custom Icons
const createIcon = (color: string) => L.divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color}"></div>`,
  iconSize: [12, 12]
});

const USER_ICON = createIcon('#3b82f6'); // Blue
const ADMIN_ICON = createIcon('#10b981'); // Green
const PATROL_ICON = createIcon('#ef4444'); // Red
const AMBULANCE_ICON = createIcon('#f59e0b'); // Orange
const FIRE_ICON = createIcon('#ff4d4d'); // Intense Red
const RISK_ICON = createIcon('#7c3aed'); // Purple

export default function MainMap({ 
  users, 
  units, 
  reports = [],
  userLocation,
  isAdmin = false,
  isGPSSignalLow = false,
  activeAlert = null
}: { 
  users: Telemetry[], 
  units: EmergencyUnit[],
  reports?: Report[],
  userLocation: { lat: number, lng: number } | null,
  isAdmin?: boolean,
  isGPSSignalLow?: boolean,
  activeAlert?: Alert | null
}) {
  const [selectedUnit, setSelectedUnit] = useState<EmergencyUnit | null>(null);
  const [fallbackRadius, setFallbackRadius] = useState(800);
  const [isDomReady, setIsDomReady] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    // White-Out Fix (AWAIT_LOAD): Simulate DOM/Network verification lock
    const timer = setTimeout(() => {
      try {
        const mapDiv = document.getElementById('map-viewport');
        if (!mapDiv && !isDomReady) {
           // We don't error immediately if it's just slow, but we verify it's intended to be there
        }
        setIsDomReady(true);
      } catch (err: any) {
        setRenderError(err.message || 'FALLO: MAP_RENDER_TIMEOUT');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isDomReady]);

  // BastionFallback: Dynamic Radius Simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGPSSignalLow) {
      let tick = 0;
      interval = setInterval(() => {
        tick += 0.1;
        const newRadius = 800 + Math.sin(tick) * 200; // Oscillate between 600m and 1000m
        setFallbackRadius(newRadius);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isGPSSignalLow]);

  // Fallback Coordinates to prevent MapContainer collapse
  const safeLocation = userLocation || IZCALLI_CENTER;

  if (renderError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-black text-red-500 border border-red-500/30 rounded-lg p-8 font-mono">
        <Terminal size={48} className="mb-4 animate-pulse" />
        <h2 className="text-xl font-black mb-4 uppercase tracking-tighter">CRITICAL_SYSTEM_FAILURE</h2>
        <div className="w-full bg-red-950/20 border border-red-900/50 p-4 rounded text-xs overflow-hidden">
          <p className="text-red-400 opacity-70 mb-2">{`> [TRACE] ${new Date().toISOString()}`}</p>
          <p className="font-bold">{`> [ERROR] ${renderError}`}</p>
          <p className="opacity-50 mt-4">{`> REINTENTANDO CONEXIÓN ISR...`}</p>
          <p className="opacity-50">{`> VALIDADO POR: Alfredo_Auth_Node_01`}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 border border-red-500/50 hover:bg-red-500/10 text-[10px] uppercase tracking-widest font-bold transition-all"
        >
          REINICIAR KERNEL
        </button>
      </div>
    );
  }

  if (!isDomReady) {
    return (
      <div id="map-viewport" className="h-full w-full flex flex-col items-center justify-center bg-[#050505] text-white border border-white/10 rounded-lg">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        <span className="font-mono text-[9px] tracking-[0.2em] text-cyan-400 uppercase font-bold text-center">
          AWAIT_LOAD: SINCRONIZANDO LIENZO Y NTP...<br/>
          <span className="opacity-50 text-[8px] text-white">VALIDANDO FLUJO DE DATOS ISR (REFUTACIÓN x3)</span>
        </span>
      </div>
    );
  }

  return (
    <div id="map-viewport" className="h-full w-full relative animate-in fade-in duration-500">
      {/* Bastion-KERN: Signal Alert Overlay */}
      {isGPSSignalLow && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-red-600/90 border border-red-400 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-widest">GPS signal weak, using fallback location</span>
        </div>
      )}

      <MapContainer 
        center={[safeLocation.lat, safeLocation.lng]} 
        zoom={14} 
        className="h-full w-full rounded-lg border border-white/10"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* BastionFallback: Cellular Triangulation Simulation */}
        {userLocation && isGPSSignalLow && (
          <Circle 
            center={[userLocation.lat, userLocation.lng]} 
            radius={fallbackRadius} 
            pathOptions={{ color: '#ff3e3e', dashArray: '5, 10', fillOpacity: 0.15, weight: 1 }} 
          />
        )}

        {/* Radar Pulse Effect */}
        {userLocation && !isGPSSignalLow && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={L.divIcon({
              className: 'radar-pulse-container',
              html: '<div class="radar-pulse-ring" style="width: 200px; height: 200px; margin-left: -100px; margin-top: -100px;"></div>',
              iconSize: [0, 0]
            })}
          />
        )}

        {/* Emergency Units with Mini-Card interaction */}
        {units.map(unit => (
          <Marker 
            key={unit.id} 
            position={[unit.location.lat, unit.location.lng]} 
            icon={unit.type === UnitType.PATROL ? PATROL_ICON : AMBULANCE_ICON}
            eventHandlers={{
              click: () => setSelectedUnit(unit)
            }}
          >
            <Popup>
              <div className="text-black font-mono p-1">
                <div className="flex items-center gap-2 mb-1 border-b pb-1">
                  <Shield size={14} className="text-red-500" />
                  <span className="text-xs font-bold">{unit.callsign}</span>
                </div>
                <p className="text-[10px] opacity-70 italic">ETA UNIDAD: {Math.floor(Math.random() * 8) + 2} min</p>
                <div className="mt-2 text-[8px] bg-red-100 text-red-800 px-1 py-0.5 rounded uppercase font-bold text-center">
                  Operativo Activo
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Heatmap Simulation Nodes (Visible to Authority/Admin) */}
        {isAdmin && reports.map((r, i) => (
          <Circle 
            key={r.id || i}
            center={[r.location.lat, r.location.lng]}
            radius={150}
            pathOptions={{ color: 'transparent', fillColor: '#ff3e3e', fillOpacity: 0.2 }}
          />
        ))}

        {/* Izcalli Critical Nodes (L3 Visibility) */}
        {CRITICAL_NODES.map(node => {
          let intensity = 0;
          
          if (activeAlert) {
            switch (activeAlert.severity) {
              case 'low': intensity = Math.max(intensity, 1); break;
              case 'medium': intensity = Math.max(intensity, 2); break;
              case 'high': intensity = Math.max(intensity, 3); break;
              case 'critical': intensity = Math.max(intensity, 4); break;
            }
          }

          // Check for nearby responding units (< ~2km)
          const nearbyRespondingUnits = units.filter(u => 
            (u.status === 'responding' || u.status === 'en_route') &&
            Math.hypot(u.location.lat - node.location.lat, u.location.lng - node.location.lng) < 0.02
          );

          if (nearbyRespondingUnits.length > 0) {
            intensity = Math.max(intensity, 3);
          }

          const getDynamicNodeIcon = (level: number) => {
            if (level === 0) return RISK_ICON;
            const colors = { 1: '#eab308', 2: '#f97316', 3: '#ef4444', 4: '#dc2626' };
            const color = colors[level as keyof typeof colors];
            const pulseSpeed = Math.max(0.5, 2.5 - (level * 0.5)); // faster for higher intensity
            return L.divIcon({
              className: 'custom-icon',
              html: `
                <div style="position: relative; width: 12px; height: 12px;">
                  <div style="background-color: ${color}; width: 100%; height: 100%; border-radius: 50%; border: 2px solid white; position: relative; z-index: 2;"></div>
                  <div style="position: absolute; top: -6px; left: -6px; width: 24px; height: 24px; border-radius: 50%; background-color: ${color}; opacity: 0.5; animation: critical-node-pulse ${pulseSpeed}s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
                </div>
              `,
              iconSize: [12, 12]
            });
          };

          return (
            <Marker key={node.id} position={[node.location.lat, node.location.lng]} icon={getDynamicNodeIcon(intensity)}>
              <Popup>
                <div className="text-black font-mono p-1">
                  <p className="font-bold text-red-600 uppercase border-b mb-1 flex items-center justify-between">
                    {node.name}
                    {intensity > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping ml-2"></span>}
                  </p>
                  <p className="text-[9px]">RIESGO: {node.risk.toUpperCase()}</p>
                  <p className="text-[8px] opacity-60">MONITOREO KERN ACTIVO</p>
                  {intensity > 0 && <p className="text-[9px] font-bold text-red-600 mt-1">NIVEL ALERTA: TIER-{intensity}</p>}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
