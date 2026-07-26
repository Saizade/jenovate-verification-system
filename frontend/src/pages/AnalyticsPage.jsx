import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

import { HiArrowTrendingUp, HiAcademicCap, HiCalendar } from 'react-icons/hi2';

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
const MATCH_COLORS = ['#10b981', '#dc2626', '#f59e0b'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [accuracy, setAccuracy] = useState([]);
  const [matches, setMatches] = useState([]);
  const [fraudDistribution, setFraudDistribution] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const enrollRes = await api.get('/dashboard/enrollment-trend');
        setEnrollments(enrollRes.data.data);

        const revRes = await api.get('/dashboard/revenue');
        setRevenue(revRes.data.data);

        const accRes = await api.get('/dashboard/accuracy');
        setAccuracy(accRes.data.data);

        const matchRes = await api.get('/dashboard/match-distribution');
        const mDist = matchRes.data.data;
        setMatches([
          { name: 'Matches', value: mDist.matches || 0 },
          { name: 'Mismatches', value: mDist.mismatches || 0 },
          { name: 'Pending', value: mDist.pending || 0 }
        ]);

        const fraudRes = await api.get('/dashboard/fraud-analytics');
        const fDist = fraudRes.data.data.distribution;
        setFraudDistribution([
          { name: 'Safe', value: fDist?.SAFE || 0 },
          { name: 'Review Required', value: fDist?.REVIEW_REQUIRED || 0 },
          { name: 'High Risk', value: fDist?.HIGH_RISK || 0 }
        ]);

      } catch (error) {
        console.error(error);
        toast.error('Failed to load analytics dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="text" className="w-48 h-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
          System Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Detailed overview of organizational registrations growth, coordinator inputs validity, and audit results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card title="Monthly Registration Trend" className="p-4 bg-white" variant="glass">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollments} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnrollMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Registrations" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEnrollMain)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Growth */}
        <Card title="Revenue Growth Rate" className="p-4 bg-white" variant="glass">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" name="Revenue Earned (₹)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Employee Accuracy Rate */}
        <Card title="Employee Accuracy Rates" className="p-4 bg-white" variant="glass">
          <div className="h-72">
            {accuracy.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accuracy} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip formatter={(value) => `${parseFloat(value).toFixed(1)}%`} />
                  <Bar dataKey="accuracy" name="Accuracy Rate" fill="#a855f7" radius={[0, 4, 4, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-gray-400 italic">No coordinator accuracy data loaded.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Match vs Mismatch */}
        <Card title="Verification Outcomes" className="p-4 bg-white" variant="glass">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-full">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matches}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {matches.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MATCH_COLORS[index % MATCH_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {matches.map((entry, i) => {
                const total = matches.reduce((acc, curr) => acc + curr.value, 0);
                const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: MATCH_COLORS[i % MATCH_COLORS.length] }}></div>
                      <span className="text-xs font-bold text-gray-700">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-gray-800 block">{entry.value}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
