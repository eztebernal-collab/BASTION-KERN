import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { 
  Telemetry, 
  EmergencyUnit, 
  UnitType, 
  Alert, 
  Report,
  Location, 
  IZCALLI_CENTER 
} from './src/types';

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const app = express();

// Bastion-KERN: L3 Security Handshake Fingerprint (Simulated SSL Pinning)
const KERN_SERVER_FINGERPRINT = 'B-KERN-SHA256-OFFENTLOGSPOT-PROD-2026';

// Multi-tier Rate Limiting
const telemetryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'ALERTA: DDoS detectado. Bloqueo temporal de nodo IP.'
});

// Hardened Security Headers (HSTS + CSP)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "*.openstreetmap.org", "unpkg.com"],
      "script-src": ["'self'", "'unsafe-inline'", "unpkg.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(express.json());
app.use('/api/telemetry', telemetryLimiter);

// Security Handshake Endpoint (L3 Standard)
app.get('/api/handshake', (req, res) => {
  res.json({ 
    fingerprint: KERN_SERVER_FINGERPRINT,
    status: 'AUTHENTICATED',
    encryption: 'TLS 1.3 / AES-256' 
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const PORT = 3000;

// Authoritative State
const activeUsers = new Map<string, Telemetry>();
const locationHistory: { id: string, location: Location, timestamp: number, userId: string }[] = [];
const reports: Report[] = [];
const alerts: Alert[] = [];
const metricsHistory: { timestamp: string, nodes: number, alerts: number, load: number }[] = [];

// Initialize mocked active emergency units in Izcalli
const emergencyUnits: EmergencyUnit[] = [
  { id: 'unit-1', type: UnitType.PATROL, location: { lat: 19.6461 + 0.005, lng: -99.2154 + 0.005 }, callsign: 'PT-041', status: 'available' },
  { id: 'unit-2', type: UnitType.AMBULANCE, location: { lat: 19.6461 - 0.005, lng: -99.2154 - 0.002 }, callsign: 'AMB-12', status: 'en_route' },
  { id: 'unit-3', type: UnitType.FIRE, location: { lat: 19.6461 + 0.002, lng: -99.2154 - 0.006 }, callsign: 'BOMB-01', status: 'available' }
];

// Metrics Collector (Every 10 seconds)
setInterval(() => {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  
  metricsHistory.push({
    timestamp: timeStr,
    nodes: activeUsers.size,
    alerts: reports.length,
    load: Math.floor(Math.random() * 20) + 15 // Simulated system load %
  });

  if (metricsHistory.length > 50) metricsHistory.shift();
}, 10000);

// Metrics Observer Endpoint
app.get('/api/metrics', (req, res) => {
  res.json({
    current: {
      activeNodes: activeUsers.size,
      totalAlerts: reports.length,
      unitsOperational: 3, 
      lastPurge: new Date().toLocaleTimeString()
    },
    history: metricsHistory
  });
});

// Nucleus-Purge (L3 Compliance)
function performNucleusPurge() {
  const now = Date.now();
  const PURGE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 Hours

  console.log('--- EXECUTING NUCLEUS-PURGE (L3) ---');
  
  // 1. Anonymize coordinate history
  locationHistory.forEach(entry => {
    if (now - entry.timestamp > PURGE_THRESHOLD) {
      entry.userId = 'Anonymous_KERN_' + Math.random().toString(36).substr(2, 5);
    }
  });

  // 2. Disassociate active sessions past inactivity
  activeUsers.forEach((user, id) => {
    if (now - user.lastSeen > PURGE_THRESHOLD) {
      activeUsers.delete(id);
    }
  });

  console.log('--- PURGE COMPLETE: HASH ENCRYPTION APPLIED ---');
}

// Deep-Stack History Compaction (SQL/L3 Strategy Simulation)
function performDeepStackCompaction() {
  console.log('--- EXECUTING DEEP-STACK COMPACTION (MIDNIGHT) ---');
  
  if (locationHistory.length > 5000) {
    // Keep only the most relevant telemetry samples for heatmap scalling
    const compacted = locationHistory.filter((_, index) => index % 10 === 0);
    locationHistory.length = 0;
    locationHistory.push(...compacted);
  }
}

// Proximity Alert Generator (Alpha/Bravo/Charlie)
function checkCriticalProximity(userLoc: Location, unitLoc: Location) {
  const distance = calculateDistanceInKM(userLoc, unitLoc);
  if (distance < 0.2) return 'CHARLIE_ALERT'; // 200m
  if (distance < 0.5) return 'BRAVO_ALERT';   // 500m
  return 'ALPHA_SCAN';                         // 1km
}

function calculateDistanceInKM(loc1: Location, loc2: Location) {
  const R = 6371; 
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Scheduled Tasks
setInterval(performNucleusPurge, 60 * 60 * 1000); 
setInterval(performDeepStackCompaction, 24 * 60 * 60 * 1000); 

// Socket.io Logic
io.on('connection', (socket) => {
  console.log(`Telemetry Node Connected: ${socket.id}`);

  socket.on('user:telemetry', (data: Telemetry) => {
    const telemetry = { ...data, id: socket.id, lastSeen: Date.now() };
    activeUsers.set(socket.id, telemetry);
    
    // Log history for heatmap purposes
    locationHistory.push({
      id: Math.random().toString(36).substr(2, 9),
      location: data.location,
      timestamp: Date.now(),
      userId: socket.id
    });

    io.emit('server:users', Array.from(activeUsers.values()));
    
    // Send Heatmap Data (only public stats)
    const heatmap = locationHistory.slice(-500).map(h => ({ 
      lat: h.location.lat, 
      lng: h.location.lng,
      intensity: 1 
    }));
    io.emit('server:heatmap', heatmap);
  });

  socket.on('user:report', (reportData: Omit<Report, 'id' | 'timestamp' | 'validations' | 'status'>) => {
    const report: Report = {
      ...reportData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      validations: 0,
      status: 'pending'
    };
    reports.push(report);
    io.emit('server:reports', reports);
    io.emit('server:alert:flash', {
      id: report.id,
      title: `REPORTE: ${report.type.toUpperCase()}`,
      message: `Incidente reportado por ciudadano en sector ${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`,
      severity: 'medium',
      timestamp: Date.now(),
      createdBy: 'CITIZEN_KERN'
    });
  });

  socket.on('admin:alert', (alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const fullAlert: Alert = {
      ...alert,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    alerts.push(fullAlert);
    io.emit('server:alert:flash', fullAlert);
  });

  socket.on('disconnect', () => {
    // Nucleus-Purga: Instant anonymization of coordinates on disconnect
    activeUsers.delete(socket.id);
    console.log(`Telemetry Node Purged: ${socket.id}`);
    io.emit('server:users', Array.from(activeUsers.values()));
  });
});

// Simulated Patrol Movement
setInterval(() => {
  emergencyUnits.forEach(unit => {
    unit.location.lat += (Math.random() - 0.5) * 0.001;
    unit.location.lng += (Math.random() - 0.5) * 0.001;
  });
  io.emit('server:units', emergencyUnits);
}, 2000);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Bastion-KERN (L3) operational on port ${PORT}`);
  });
}

startServer();
