import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import StatsCard from '../components/ui/StatsCard';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

import {
  HiUsers, HiDocumentText, HiCheckCircle, HiExclamationTriangle,
  HiCurrencyRupee, HiChevronRight, HiBell, HiArrowTrendingUp
} from 'react-icons/hi2';

const CHART_COLORS = ['#4f46e5', '#f59e0b', '#dc2626', '#10b981', '#a855f7'];
const PIE_COLORS = ['#10b981', '#dc2626', '#f59e0b'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [matchData, setMatchData] = useState([]);
  const [fraudData, setFraudData] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data.data);

        // Fetch enrollment trend
        const enrollmentRes = await api.get('/dashboard/enrollment-trend');
        setEnrollmentData(enrollmentRes.data.data);

        // Fetch revenue
        const revenueRes = await api.get('/dashboard/revenue');
        setRevenueData(revenueRes.data.data);

        // Fetch match distribution
        const matchRes = await api.get('/dashboard/match-distribution');
        const mDist = matchRes.data.data;
        setMatchData([
          { name: 'Matches', value: mDist.matches || 0 },
          { name: 'Mismatches', value: mDist.mismatches || 0 },
          { name: 'Pending', value: mDist.pending || 0 }
        ]);

        // Fetch fraud analytics
        const fraudRes = await api.get('/dashboard/fraud-analytics');
        const fDist = fraudRes.data.data.distribution;
        setFraudData([
          { name: 'Safe', value: fDist?.SAFE || 0 },
          { name: 'Review Required', value: fDist?.REVIEW_REQUIRED || 0 },
          { name: 'High Risk', value: fDist?.HIGH_RISK || 0 }
        ]);

        // Fetch recent students
        const studentsRes = await api.get('/students?limit=5');
        setRecentStudents(studentsRes.data.data.students || []);

        // Fetch recent alerts
        const alertsRes = await api.get('/verification?limit=5&fraudLevel=HIGH_RISK');
        setRecentAlerts(alertsRes.data.data.results || []);

      } catch (err) {
        console.error(err);
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
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
        <div className="flex items-center justify-between">
          <Skeleton variant="text" className="w-48 h-8" />
          <Skeleton variant="text" className="w-32 h-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="card" className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton variant="card" className="h-80" />
          <Skeleton variant="card" className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time insights on registrations, employee submissions, and fraud risks.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/verification">
            <Button variant="outline" className="flex items-center gap-1">
              Verify Submissions <HiChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={HiUsers}
          color="indigo"
          description="Total student registrations"
        />
        <StatsCard
          title="Employee Entries"
          value={stats?.totalSubmissions || 0}
          icon={HiDocumentText}
          color="violet"
          description="Submissions by employees"
        />
        <StatsCard
          title="Total Matches"
          value={stats?.totalMatches || 0}
          icon={HiCheckCircle}
          color="emerald"
          description="Verified match cases"
        />
        <StatsCard
          title="Total Mismatches"
          value={stats?.totalMismatches || 0}
          icon={HiExclamationTriangle}
          color="rose"
          description="Mismatched information"
        />
        <StatsCard
          title="Fraud Alerts"
          value={stats?.fraudAlerts || 0}
          icon={HiBell}
          color="amber"
          description="High risk profiles flagged"
        />
        <StatsCard
          title="Revenue Collected"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={HiCurrencyRupee}
          color="teal"
          description="Sum of student payments"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Enrollment Trend */}
        <Card title="Monthly Enrollment Trend" className="p-4" variant="glass">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Enrollments" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorEnroll)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Analytics */}
        <Card title="Revenue Analytics" className="p-4" variant="glass">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" name="Revenue (₹)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Match vs Mismatch */}
        <Card title="Match vs Mismatch Distribution" className="p-4" variant="glass">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={matchData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {matchData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {matchData.map((entry, i) => {
                const total = matchData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                      <span className="text-sm font-semibold text-gray-700">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-gray-800 block">{entry.value}</span>
                      <span className="text-xs text-gray-400 font-medium">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Fraud Severity */}
        <Card title="Fraud Risk Breakdown" className="p-4" variant="glass">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fraudData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {fraudData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[(index + 2) % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {fraudData.map((entry, i) => {
                const total = fraudData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[(i + 2) % CHART_COLORS.length] }}></div>
                      <span className="text-sm font-semibold text-gray-700">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-gray-800 block">{entry.value}</span>
                      <span className="text-xs text-gray-400 font-medium">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <Card
          title="Recent Registrations"
          subtitle="Latest students enrolled"
          className="p-4"
          headerAction={
            <Link to="/admin/students" className="text-xs text-primary-500 font-semibold hover:underline flex items-center gap-0.5">
              View All <HiChevronRight className="w-3 h-3" />
            </Link>
          }
        >
          <Table
            headers={['Ref ID', 'Name', 'Course', 'Amount']}
            rows={recentStudents.map((st) => [
              <span className="font-mono text-xs font-bold text-gray-800" key={st.id}>{st.reference_id}</span>,
              <span className="font-medium text-gray-800" key={st.id}>{st.full_name}</span>,
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full" key={st.id}>{st.course_name}</span>,
              <span className="font-bold text-gray-800" key={st.id}>{formatCurrency(st.payment_amount)}</span>
            ])}
          />
        </Card>

        {/* High Risk Fraud Alerts */}
        <Card
          title="Critical Fraud Flags"
          subtitle="Alerts requiring immediate attention"
          className="p-4"
          headerAction={
            <Link to="/admin/fraud-reports" className="text-xs text-primary-500 font-semibold hover:underline flex items-center gap-0.5">
              View All <HiChevronRight className="w-3 h-3" />
            </Link>
          }
        >
          {recentAlerts.length > 0 ? (
            <Table
              headers={['Ref ID', 'Score', 'Status', 'Difference']}
              rows={recentAlerts.map((al) => [
                <span className="font-mono text-xs font-bold text-gray-800" key={al.id}>{al.reference_id}</span>,
                <Badge variant="danger" key={al.id}>{al.fraud_score} / 100</Badge>,
                <span className="text-xs text-red-600 font-bold" key={al.id}>{al.match_status}</span>,
                <span className="font-bold text-red-600" key={al.id}>{formatCurrency(al.difference_amount)}</span>
              ])}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-surface-50 border border-dashed border-gray-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                <HiCheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No High Risk Alerts</p>
              <p className="text-xs text-gray-400">All submissions are currently safe.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
