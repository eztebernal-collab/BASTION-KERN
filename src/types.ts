export interface Location {
  lat: number;
  lng: number;
}

export enum UserLevel {
  CIVIL = 'civil',
  GOLD = 'gold',
  ADMIN = 'admin',
  AUTHORITY = 'authority'
}

export enum UnitType {
  PATROL = 'patrol',
  AMBULANCE = 'ambulance',
  FIRE = 'fire',
  C4_STATION = 'c4_station'
}

export interface Report {
  id: string;
  userId: string;
  type: 'accident' | 'blockade' | 'flood' | 'safe';
  location: Location;
  timestamp: number;
  validations: number;
  status: 'pending' | 'verified' | 'critical';
}

export interface Telemetry {
  id: string;
  name: string;
  location: Location;
  level: UserLevel;
  lastSeen: number;
}

export interface EmergencyUnit {
  id: string;
  type: UnitType;
  location: Location;
  callsign: string;
  status: 'available' | 'responding' | 'en_route';
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  createdBy: string;
}

export const IZCALLI_CENTER: Location = { lat: 19.6461, lng: -99.2154 };
export const IZCALLI_BOUNDS = {
  north: 19.7150, // Exit to Tepotzotlán
  south: 19.5980, // La Quebrada
  west: -99.2800,
  east: -99.1400
};

export const EMERGENCY_DISPATCH = "55 5871 1111"; // C4 Izcalli

export const CRITICAL_NODES = [
  { id: 'node-ford', name: 'Planta Ford / Autopista', location: { lat: 19.6420, lng: -99.2081 }, risk: 'inundacion' },
  { id: 'node-perinorte', name: 'Perinorte / La Quebrada', location: { lat: 19.6015, lng: -99.2135 }, risk: 'bloqueo' },
  { id: 'node-embalse', name: 'Presa El Ángulo', location: { lat: 19.6402, lng: -99.2321 }, risk: 'inundacion' },
  { id: 'node-urbana', name: 'Centro Urbano', location: { lat: 19.6542, lng: -99.2181 }, risk: 'congestion' }
];
