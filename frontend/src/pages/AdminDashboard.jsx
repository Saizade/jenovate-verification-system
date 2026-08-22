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
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

import {
  HiUsers, HiDocumentText, HiCheckCircle, HiExclamationTriangle,
  HiCurrencyRupee, HiChevronRight, HiBell, HiMapPin, HiBanknotes,
  HiExclamationCircle, HiFunnel, HiAcademicCap, HiUserGroup, HiBuildingOffice,
  HiCreditCard, HiArrowTrendingUp, HiMagnifyingGlass
} from 'react-icons/hi2';

const STATE_COLORS = ['#2c6177', '#438ca9', '#3b806b', '#8a6840', '#607c91', '#4f8ca9', '#9a774d', '#6b6a8b'];
const PAYMENT_STATUS_COLORS = ['#3b806b', '#9a774d'];
const DEPT_COLORS = ['#438ca9', '#607c91', '#6b6a8b', '#3b806b', '#8a6840'];
const PAYMENT_MODE_COLORS = ['#438ca9', '#3b806b', '#9a774d', '#607c91', '#ad5962'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Filter options state (loaded dynamically from backend)
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    courses: [],
    counselors: [],
    departments: [],
    colleges: [],
    paymentModes: []
  });

  // Filter criteria state
  const [filters, setFilters] = useState({
    state: '',
    paymentStatus: '', // '', 'pending', 'paid'
    course: '',
    counselor: '',
    department: '',
    college: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Analytics Data States
  const [deepStats, setDeepStats] = useState(null);
  const [stateBreakdown, setStateBreakdown] = useState([]);
  const [courseBreakdown, setCourseBreakdown] = useState([]);
  const [counselorPerformance, setCounselorPerformance] = useState([]);
  const [collegeBreakdown, setCollegeBreakdown] = useState([]);
  const [deptBreakdown, setDeptBreakdown] = useState([]);
  const [paymentModeBreakdown, setPaymentModeBreakdown] = useState([]);
  const [monthlyCollection, setMonthlyCollection] = useState([]);
  const [topDefaulters, setTopDefaulters] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  // Fetch initial filter dropdown options once
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const res = await api.get('/dashboard/filter-options');
        if (res.data?.success) {
          setFilterOptions(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    fetchFilterOptions();
  }, []);

  // Main data fetcher triggered whenever filters change
  const fetchDashboardAnalytics = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, val]) => {
        if (val) queryParams.append(key, val);
      });

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [
        statsRes,
        stateRes,
        courseRes,
        counselorRes,
        collegeRes,
        deptRes,
        modeRes,
        monthlyRes,
        defaultersRes,
        alertsRes
      ] = await Promise.all([
        api.get(`/dashboard/deep-stats${queryString}`),
        api.get(`/dashboard/state-breakdown${queryString}`),
        api.get(`/dashboard/course-breakdown${queryString}`),
        api.get(`/dashboard/counselor-performance${queryString}`),
        api.get(`/dashboard/college-breakdown${queryString}`),
        api.get(`/dashboard/department-breakdown${queryString}`),
        api.get(`/dashboard/payment-mode-breakdown${queryString}`),
        api.get(`/dashboard/monthly-collection${queryString}`),
        api.get(`/dashboard/top-defaulters${queryString}`),
        api.get('/verification?limit=5&fraud_level=HIGH_RISK')
      ]);

      setDeepStats(statsRes.data?.data || null);
      setStateBreakdown(stateRes.data?.data || []);
      setCourseBreakdown(courseRes.data?.data || []);
      setCounselorPerformance(counselorRes.data?.data || []);
      setCollegeBreakdown(collegeRes.data?.data || []);
      setDeptBreakdown(deptRes.data?.data || []);
      setPaymentModeBreakdown(modeRes.data?.data || []);
      setMonthlyCollection(monthlyRes.data?.data || []);
      setTopDefaulters(defaultersRes.data?.data || []);
      setRecentAlerts(alertsRes.data?.data?.results || []);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardAnalytics();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      state: '',
      paymentStatus: '',
      course: '',
      counselor: '',
      department: '',
      college: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const navigateToStudents = (additionalParams = {}) => {
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.course) params.append('course', filters.course);
    if (filters.counselor) params.append('counselor', filters.counselor);
    if (filters.department) params.append('department', filters.department);

    Object.entries(additionalParams).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });

    navigate(`/admin/students?${params.toString()}`);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight flex items-center gap-2">
            Admin Intelligence & Analytics Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Deep filter analytics, state breakdowns, counselor metrics, and financial audit reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
            onClick={() => navigateToStudents({ paymentStatus: 'pending' })}
          >
            <HiExclamationCircle className="w-4 h-4 text-amber-600" /> Audit Defaulters
          </Button>
          <Button
            variant="primary"
            className="flex items-center gap-1 text-xs"
            onClick={() => navigateToStudents()}
          >
            Full Student Directory <HiChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Global Interactive Filter Panel */}
      <Card className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <HiFunnel className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Global Analytics Filters
            </h3>
            {Object.values(filters).some(Boolean) && (
              <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                Active Filters
              </span>
            )}
          </div>
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Name, Ref ID, Email, Phone..."
                className="form-input pl-9 text-xs py-2"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              <HiMagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* State Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">State / Region</label>
            <select
              className="form-input text-xs py-2"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
            >
              <option value="">All States</option>
              {filterOptions.states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Fee Payment Status */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Payment Status</label>
            <select
              className="form-input text-xs py-2"
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">⚠️ Pending Dues (Unpaid)</option>
              <option value="paid">✅ Fully Paid (Zero Dues)</option>
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Course Opted</label>
            <select
              className="form-input text-xs py-2"
              value={filters.course}
              onChange={(e) => handleFilterChange('course', e.target.value)}
            >
              <option value="">All Courses</option>
              {filterOptions.courses.map((crs) => (
                <option key={crs} value={crs}>{crs}</option>
              ))}
            </select>
          </div>

          {/* Counselor */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Counselor</label>
            <select
              className="form-input text-xs py-2"
              value={filters.counselor}
              onChange={(e) => handleFilterChange('counselor', e.target.value)}
            >
              <option value="">All Counselors</option>
              {filterOptions.counselors.map((cn) => (
                <option key={cn} value={cn}>{cn}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Department</label>
            <select
              className="form-input text-xs py-2"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map((dp) => (
                <option key={dp} value={dp}>{dp}</option>
              ))}
            </select>
          </div>

          {/* College */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">College</label>
            <select
              className="form-input text-xs py-2"
              value={filters.college}
              onChange={(e) => handleFilterChange('college', e.target.value)}
            >
              <option value="">All Colleges</option>
              {filterOptions.colleges.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Date Range</label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="date"
                className="form-input text-[11px] p-1.5"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
              <input
                type="date"
                className="form-input text-[11px] p-1.5"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick State Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400">Quick State Filters:</span>
          {['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Gujarat'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => handleFilterChange('state', filters.state === st ? '' : st)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                filters.state.toLowerCase() === st.toLowerCase()
                  ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-xs'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              📍 {st}
            </button>
          ))}
        </div>
      </Card>

      {/* Smart Filtered Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatsCard
          title="Filtered Students"
          value={loading ? '...' : deepStats?.totalStudents || 0}
          icon={HiUsers}
          color="indigo"
          description="Total matching students"
        />
        <StatsCard
          title="Revenue Collected"
          value={loading ? '...' : formatCurrency(deepStats?.totalCollected)}
          icon={HiCurrencyRupee}
          color="teal"
          description="Total fees collected"
        />
        <StatsCard
          title="Pending Dues"
          value={loading ? '...' : formatCurrency(deepStats?.totalPending)}
          icon={HiExclamationCircle}
          color="amber"
          description={`${deepStats?.pendingStudentsCount || 0} students with dues`}
        />
        <StatsCard
          title="Fully Paid Students"
          value={loading ? '...' : deepStats?.paidStudentsCount || 0}
          icon={HiCheckCircle}
          color="emerald"
          description="Zero pending balance"
        />
        <StatsCard
          title="Avg Program Fee"
          value={loading ? '...' : formatCurrency(deepStats?.avgProgramPrice)}
          icon={HiAcademicCap}
          color="purple"
          description="Average course cost"
        />
        <StatsCard
          title="Avg Due / Defaulter"
          value={loading ? '...' : formatCurrency(deepStats?.avgPendingAmount)}
          icon={HiExclamationTriangle}
          color="rose"
          description="Avg pending amount"
        />
      </div>

      {/* Main Charts Row 1: State Breakdown & Course Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* State Breakdown */}
        <Card
          title="State-Wise Distribution"
          subtitle="Click state to drill down"
          className="p-4"
          variant="glass"
        >
          <div className="h-72">
            {loading ? (
              <Skeleton variant="card" className="h-full" />
            ) : stateBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="state" stroke="#94a3b8" fontSize={11} angle={-30} textAnchor="end" tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'count' ? `${value} Students` : formatCurrency(value),
                      name === 'count' ? 'Enrolled' : name === 'totalCollected' ? 'Collected' : 'Pending'
                    ]}
                  />
                  <Bar dataKey="count" name="count" fill="#2c6177" radius={[4, 4, 0, 0]} onClick={(data) => navigateToStudents({ state: data.state })} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">No state data available</div>
            )}
          </div>
        </Card>

        {/* Course Breakdown */}
        <Card
          title="Course Enrollments & Revenue"
          subtitle="Performance across courses"
          className="p-4"
          variant="glass"
        >
          <div className="h-72">
            {loading ? (
              <Skeleton variant="card" className="h-full" />
            ) : courseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseBreakdown} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="course" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={100} />
                  <Tooltip formatter={(value) => [`${value} Students`, 'Total Enrolled']} />
                  <Bar dataKey="count" name="Students" fill="#438ca9" radius={[0, 4, 4, 0]} barSize={16} onClick={(data) => navigateToStudents({ course: data.course })} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">No course data available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Charts Row 2: Counselor Metrics & Monthly Financial Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Counselor Performance Table & Chart */}
        <Card
          title="Counselor Distribution"
          subtitle="Enrollment volume per counselor"
          className="p-4 lg:col-span-1"
          variant="glass"
        >
          <div className="h-72 overflow-y-auto pr-1 space-y-2">
            {loading ? (
              <Skeleton variant="card" className="h-full" />
            ) : counselorPerformance.map((c, i) => (
              <div
                key={c.counselor}
                onClick={() => navigateToStudents({ counselor: c.counselor })}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer group"
              >
                <div>
                  <h4 className="text-xs font-bold text-gray-800 group-hover:text-indigo-900">{c.counselor}</h4>
                  <span className="text-[10px] text-gray-400 font-semibold block">
                    Collected: {formatCurrency(c.totalCollected)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {c.count} std
                  </span>
                  {c.totalPending > 0 && (
                    <span className="text-[10px] text-amber-600 font-bold block mt-0.5">
                      Due: {formatCurrency(c.totalPending)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Monthly Collection Trend (Collected vs Pending) */}
        <Card
          title="Monthly Financial Collection vs Pending Dues"
          subtitle="12-month financial comparison"
          className="p-4 lg:col-span-2"
          variant="glass"
        >
          <div className="h-72">
            {loading ? (
              <Skeleton variant="card" className="h-full" />
            ) : monthlyCollection.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyCollection} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b806b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b806b" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9a774d" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9a774d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area type="monotone" dataKey="collected" name="Collected Fees (₹)" stroke="#3b806b" strokeWidth={2} fillOpacity={1} fill="url(#colorCollected)" />
                  <Area type="monotone" dataKey="pending" name="Pending Dues (₹)" stroke="#9a774d" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">No monthly trend data available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Charts Row 3: Department, Payment Mode & College Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Breakdown */}
        <Card title="Department Distribution" subtitle="Students by department" className="p-4" variant="glass">
          <div className="h-60">
            {loading ? (
              <Skeleton variant="card" className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="department"
                  >
                    {deptBreakdown.map((entry, index) => (
                      <Cell key={`dept-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} Students`, 'Total']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Payment Mode Breakdown */}
        <Card title="Payment Mode Breakdown" subtitle="Payment methods used" className="p-4" variant="glass">
          <div className="h-60">
            {loading ? (
              <Skeleton variant="card" className="h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="mode"
                  >
                    {paymentModeBreakdown.map((entry, index) => (
                      <Cell key={`pmode-${index}`} fill={PAYMENT_MODE_COLORS[index % PAYMENT_MODE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val} Students`, 'Total']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* College Distribution List */}
        <Card title="Top Colleges" subtitle="Institutions represented" className="p-4" variant="glass">
          <div className="h-60 overflow-y-auto pr-1 space-y-2">
            {loading ? (
              <Skeleton variant="card" className="h-full" />
            ) : collegeBreakdown.map((cl, i) => (
              <div key={cl.college} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                <span className="font-semibold text-gray-700 truncate max-w-[170px]" title={cl.college}>
                  {cl.college}
                </span>
                <span className="font-bold text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200">
                  {cl.count} std
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Defaulters Table (Audit Dues) */}
      <Card
        title="Top Defaulters (Highest Pending Dues)"
        subtitle="Students requiring fee collection follow-up"
        className="p-4"
        headerAction={
          <Button
            variant="outline"
            className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
            onClick={() => navigateToStudents({ paymentStatus: 'pending' })}
          >
            View All Pending Dues ({deepStats?.pendingStudentsCount || 0})
          </Button>
        }
      >
        {loading ? (
          <Skeleton variant="card" className="h-48" />
        ) : topDefaulters.length > 0 ? (
          <Table
            headers={['Ref ID', 'Student Name', 'State', 'Counselor', 'Course', 'Program Fee', 'Received', 'Pending Amount', 'Contact']}
            rows={topDefaulters.map((st) => [
              <span className="font-mono text-xs font-bold text-gray-800" key={`d-ref-${st.id}`}>{st.reference_id}</span>,
              <div key={`d-name-${st.id}`}>
                <div className="font-semibold text-gray-900">{st.full_name}</div>
                <div className="text-[11px] text-gray-400">{st.college_name || '—'}</div>
              </div>,
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded" key={`d-st-${st.id}`}>{st.state || '—'}</span>,
              <span className="text-xs font-medium text-gray-700" key={`d-cn-${st.id}`}>{st.counselor_name || '—'}</span>,
              <span className="text-xs font-medium text-gray-600" key={`d-crs-${st.id}`}>{st.course_opted || '—'}</span>,
              <span className="font-bold text-gray-800" key={`d-prg-${st.id}`}>{formatCurrency(st.program_price)}</span>,
              <span className="font-bold text-emerald-600" key={`d-rcv-${st.id}`}>{formatCurrency(st.amount_received)}</span>,
              <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200" key={`d-pnd-${st.id}`}>
                {formatCurrency(st.pending_amount)}
              </span>,
              <div className="text-[11px] font-mono text-gray-600" key={`d-cnt-${st.id}`}>
                <div>{st.phone_no || '—'}</div>
                <div className="text-[10px] text-gray-400">{st.email || ''}</div>
              </div>
            ])}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <HiCheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-gray-700">Zero Pending Dues Found!</p>
            <p className="text-xs text-gray-400">All filtered students have fully settled their payments.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
