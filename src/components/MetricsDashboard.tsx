import React, { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Activity, Shield, Users, Clock, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface MetricsData {
  current: {
    activeNodes: number;
    totalAlerts: number;
    unitsOperational: number;
    lastPurge: string;
  };
  history: {
    timestamp: string;
    nodes: number;
    alerts: number;
    load: number;
  }[];
}

export default function MetricsDashboard() {
  const [data, setData] = useState<MetricsData | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Failed to fetch metrics', err);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-8 text-white/50 animate-pulse">Initializing Grafana KERN Link...</div>;

  return (
    <div className="p-6 bg-[#050505] min-h-screen text-white font-mono overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <Activity className="text-green-500" /> BASTION-KERN OBSERVABILITY
          </h1>
          <p className="text-[10px] opacity-40 uppercase tracking-[0.3em]">L3 Corporate Metrics • Izcalli Node</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[8px] opacity-30 uppercase">Last Kernel Purge</p>
            <p className="text-xs text-red-500">{data.current.lastPurge}</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-500">SYSTEM STABLE</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<Users className="text-blue-500" />} 
          label="Active Nodes" 
          value={data.current.activeNodes} 
          sub="Authorized Telemetry"
        />
        <StatCard 
          icon={<Shield className="text-red-500" />} 
          label="Active Units" 
          value={data.current.unitsOperational} 
          sub="Patrols/Ambulances"
        />
        <StatCard 
          icon={<Clock className="text-yellow-500" />} 
          label="Flash Alerts" 
          value={data.current.totalAlerts} 
          sub="Last 24 Hours"
        />
        <StatCard 
          icon={<Zap className="text-purple-500" />} 
          label="System Load" 
          value={`${data.history[data.history.length-1]?.load || 0}%`} 
          sub="Hardware Performance"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Traffic Chart */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
          <h3 className="text-sm font-bold mb-6 opacity-60 uppercase">Telemetry Traffic (Nodes vs Time)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history}>
                <defs>
                  <linearGradient id="colorNodes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="timestamp" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                />
                <Area type="monotone" dataKey="nodes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNodes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert History Chart */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
          <h3 className="text-sm font-bold mb-6 opacity-60 uppercase">Crisis Event History</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="timestamp" stroke="#444" fontSize={10} />
                <YAxis stroke="#444" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                />
                <Line type="step" dataKey="alerts" stroke="#ef4444" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="load" stroke="#9333ea" dot={false} strokeWidth={1} opacity={0.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metrics Legend */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-40 text-[9px] uppercase tracking-widest border-t border-white/10 pt-4">
        <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-blue-500" /> Active Users</div>
        <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-red-500" /> Flash Alerts</div>
        <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-purple-500" /> CPU Allocation</div>
        <div className="text-right">Kern Node: Izcalli-01</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string | number, subText?: string, sub: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 border border-white/5 p-4 rounded-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-[9px] opacity-30 uppercase">{sub}</div>
    </motion.div>
  );
}
