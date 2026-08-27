import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

import { 
  HiFunnel, HiMagnifyingGlass, HiMapPin, HiCreditCard, HiAcademicCap, 
  HiUserGroup, HiBuildingOffice, HiCalendar, HiXMark, HiPresentationChartLine, 
  HiBars3, HiBanknotes, HiArrowPath 
} from 'react-icons/hi2';

const CHART_COLORS = ['#0e6ba8', '#1a8fd4', '#3fa7e8', '#10b981', '#059669', '#f59e0b', '#8b5cf6', '#ec4899'];
const DEPT_COLORS = ['#0e6ba8', '#1a8fd4', '#059669', '#8b5cf6', '#f59e0b'];
const PAYMENT_COLORS = ['#0e6ba8', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function AnalyticsPage() {
  const [loadingStates, setLoadingStates] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Available filter options (loaded dynamically from database)
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    courses: [],
    counselors: [],
    departments: [],
    colleges: [],
    paymentModes: []
  });
  
  // Individual Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [counselorFilter, setCounselorFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Metrics & Aggregation Control
  const [activeMetric, setActiveMetric] = useState('amount_received'); // amount_received, pending_amount, program_price
  const [activeFunc, setActiveFunc] = useState('sum'); // sum, average, count

  // Raw API Datasets
  const [rawCourses, setRawCourses] = useState([]);
  const [rawCounselors, setRawCounselors] = useState([]);
  const [rawDepartments, setRawDepartments] = useState([]);
  const [rawMonthly, setRawMonthly] = useState([]);
  const [rawPaymentModes, setRawPaymentModes] = useState([]);
  const [rawColleges, setRawColleges] = useState([]);

  // Drag and drop setup for Analytics widgets
  const DEFAULT_ANALYTICS_WIDGETS = [
    { id: 'course', size: 'lg:col-span-3' },
    { id: 'counselor', size: 'lg:col-span-3' },
    { id: 'dept', size: 'lg:col-span-2' },
    { id: 'monthly', size: 'lg:col-span-4' },
    { id: 'paymentMode', size: 'lg:col-span-2' },
    { id: 'college', size: 'lg:col-span-4' }
  ];

  const [widgets, setWidgets] = useState(() => {
    const saved = localStorage.getItem('jenovate_analytics_widgets_order');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const valid = parsed.every(w => DEFAULT_ANALYTICS_WIDGETS.some(dw => dw.id === w.id));
        if (valid && parsed.length === DEFAULT_ANALYTICS_WIDGETS.length) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ANALYTICS_WIDGETS;
  });

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggableId, setDraggableId] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch available filter options (states, courses, counselors, departments, colleges)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoadingStates(true);
        const res = await api.get('/dashboard/filter-options');
        if (res.data?.data) {
          setFilterOptions({
            states: res.data.data.states || [],
            courses: res.data.data.courses || [],
            counselors: res.data.data.counselors || [],
            departments: res.data.data.departments || [],
            colleges: res.data.data.colleges || [],
            paymentModes: res.data.data.paymentModes || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setLoadingStates(false);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch breakdown datasets using all active query parameters
  useEffect(() => {
    const fetchBreakdowns = async () => {
      try {
        setDataLoading(true);
        
        const params = new URLSearchParams();
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (stateFilter) params.append('state', stateFilter);
        if (paymentStatusFilter) params.append('paymentStatus', paymentStatusFilter);
        if (courseFilter) params.append('course', courseFilter);
        if (counselorFilter) params.append('counselor', counselorFilter);
        if (departmentFilter) params.append('department', departmentFilter);
        if (collegeFilter) params.append('college', collegeFilter);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const [
          courseRes,
          counselorRes,
          deptRes,
          monthlyRes,
          paymentModeRes,
          collegeRes
        ] = await Promise.allSettled([
          api.get(`/dashboard/course-breakdown${queryString}`),
          api.get(`/dashboard/counselor-performance${queryString}`),
          api.get(`/dashboard/department-breakdown${queryString}`),
          api.get(`/dashboard/monthly-collection${queryString}`),
          api.get(`/dashboard/payment-mode-breakdown${queryString}`),
          api.get(`/dashboard/college-breakdown${queryString}`)
        ]);

        setRawCourses(courseRes.status === 'fulfilled' ? courseRes.value.data?.data || [] : []);
        setRawCounselors(counselorRes.status === 'fulfilled' ? counselorRes.value.data?.data || [] : []);
        setRawDepartments(deptRes.status === 'fulfilled' ? deptRes.value.data?.data || [] : []);
        setRawMonthly(monthlyRes.status === 'fulfilled' ? monthlyRes.value.data?.data || [] : []);
        setRawPaymentModes(paymentModeRes.status === 'fulfilled' ? paymentModeRes.value.data?.data || [] : []);
        setRawColleges(collegeRes.status === 'fulfilled' ? collegeRes.value.data?.data || [] : []);

      } catch (error) {
        console.error('Failed to load filtered analytics breakdowns:', error);
        toast.error('Failed to load analytics for selected filters.');
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchBreakdowns();
  }, [
    debouncedSearch, stateFilter, paymentStatusFilter, courseFilter,
    counselorFilter, departmentFilter, collegeFilter, dateFrom, dateTo
  ]);

  const activeFilterCount = [
    debouncedSearch, stateFilter, paymentStatusFilter, courseFilter,
    counselorFilter, departmentFilter, collegeFilter, dateFrom, dateTo
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setStateFilter('');
    setPaymentStatusFilter('');
    setCourseFilter('');
    setCounselorFilter('');
    setDepartmentFilter('');
    setCollegeFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Process data locally based on selected Metric & Aggregation Type
  const getProcessedData = (rawArray, keyField) => {
    if (!rawArray || rawArray.length === 0) return [];
    
    return rawArray.map(item => {
      const name = item[keyField] || 'Not Specified';
      const count = parseInt(item.count || item.studentCount || 0, 10);
      
      let sumValue = 0;
      if (activeMetric === 'amount_received') {
        sumValue = parseFloat(item.totalCollected ?? item.collected ?? 0);
      } else if (activeMetric === 'pending_amount') {
        sumValue = parseFloat(item.totalPending ?? item.pending ?? 0);
      } else if (activeMetric === 'program_price') {
        const coll = parseFloat(item.totalCollected ?? item.collected ?? 0);
        const pend = parseFloat(item.totalPending ?? item.pending ?? 0);
        sumValue = coll + pend;
      }

      let val = 0;
      if (activeFunc === 'count') {
        val = count;
      } else if (activeFunc === 'average') {
        val = count > 0 ? (sumValue / count) : 0;
      } else { // 'sum'
        val = sumValue;
      }

      return {
        name,
        value: Math.round(val * 100) / 100
      };
    });
  };

  const getMetricLabel = () => {
    if (activeFunc === 'count') return 'Student Count';
    const prefix = activeFunc === 'average' ? 'Avg ' : 'Total ';
    if (activeMetric === 'amount_received') return prefix + 'Fees Collected (₹)';
    if (activeMetric === 'pending_amount') return prefix + 'Pending Dues (₹)';
    return prefix + 'Program Fees (₹)';
  };

  const valueFormatter = (value) => {
    if (activeFunc === 'count') {
      return `${value} Students`;
    }
    return formatCurrency(value);
  };

  // Drag-and-drop mechanics
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...widgets];
    const [removed] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, removed);
    setWidgets(updated);
    localStorage.setItem('jenovate_analytics_widgets_order', JSON.stringify(updated));
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header and Subtext */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight flex items-center gap-3">
          <HiPresentationChartLine className="w-8 h-8 text-ocean-600" />
          Interactive Analytics Workbench
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Perform multi-dimensional analysis with real-time dynamic filters, customizable aggregate functions, and draggable chart views.
        </p>
      </div>

      {/* Comprehensive Analytics Filters Section (Matching Reference Design) */}
      <div className="bg-white rounded-2xl border border-surface-200/90 shadow-card p-6 space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div className="flex items-center gap-2">
            <HiFunnel className="w-4.5 h-4.5 text-ocean-600" />
            <h2 className="text-xs font-bold text-ocean-950 uppercase tracking-widest">Analytics Filters</h2>
            {activeFilterCount > 0 && (
              <span className="bg-ocean-100 text-ocean-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeFilterCount} Active
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={resetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
            >
              <HiArrowPath className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>

        {/* Row 1: Search, State, Payment Status, Course Opted */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. SEARCH */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">SEARCH</label>
            <div className="relative">
              <HiMagnifyingGlass className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, Ref ID, Email, Phone..."
                className="w-full text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 pl-9 pr-3 py-2 text-surface-900 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all placeholder:text-gray-400"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <HiXMark className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. STATE / REGION */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">STATE / REGION</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              disabled={loadingStates}
              className="w-full text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all disabled:opacity-50"
            >
              <option value="">All States</option>
              {filterOptions.states.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* 3. PAYMENT STATUS */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">PAYMENT STATUS</label>
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all"
            >
              <option value="">All Payment Statuses</option>
              <option value="paid">Fully Paid</option>
              <option value="pending">Pending Dues</option>
            </select>
          </div>

          {/* 4. COURSE OPTED */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">COURSE OPTED</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              disabled={loadingStates}
              className="w-full text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all disabled:opacity-50"
            >
              <option value="">All Courses</option>
              {filterOptions.courses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Counselor, Department, College, Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 5. COUNSELOR */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">COUNSELOR</label>
            <select
              value={counselorFilter}
              onChange={(e) => setCounselorFilter(e.target.value)}
              disabled={loadingStates}
              className="w-full text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all disabled:opacity-50"
            >
              <option value="">All Counselors</option>
              {filterOptions.counselors.map(cs => (
                <option key={cs} value={cs}>{cs}</option>
              ))}
            </select>
          </div>

          {/* 6. DEPARTMENT */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">DEPARTMENT</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              disabled={loadingStates}
              className="w-full text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all disabled:opacity-50"
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(dp => (
                <option key={dp} value={dp}>{dp}</option>
              ))}
            </select>
          </div>

          {/* 7. COLLEGE */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">COLLEGE</label>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              disabled={loadingStates}
              className="w-full text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-3 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 transition-all disabled:opacity-50"
            >
              <option value="">All Colleges</option>
              {filterOptions.colleges.map(cl => (
                <option key={cl} value={cl}>{cl}</option>
              ))}
            </select>
          </div>

          {/* 8. DATE RANGE */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">DATE RANGE</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-1/2 text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-2 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500"
                title="Start Date"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-1/2 text-xs font-medium rounded-xl border border-surface-200 bg-surface-50/50 px-2 py-2 text-surface-800 focus:bg-white focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500"
                title="End Date"
              />
            </div>
          </div>
        </div>

        {/* Control Bar: Metric Target & Aggregation Operator */}
        <div className="pt-3 border-t border-surface-100 flex flex-wrap items-center justify-between gap-4">
          {/* Target Metric */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-ocean-950 uppercase tracking-wider">TARGET METRIC:</span>
            <div className="flex rounded-xl bg-surface-100/70 p-1 border border-surface-200">
              <button
                type="button"
                onClick={() => setActiveMetric('amount_received')}
                className={`px-3 py-1 text-xs font-bold transition-all rounded-lg ${
                  activeMetric === 'amount_received'
                    ? 'bg-ocean-600 text-white shadow-sm'
                    : 'text-surface-600 hover:text-ocean-700'
                }`}
              >
                Fees Collected
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('pending_amount')}
                className={`px-3 py-1 text-xs font-bold transition-all rounded-lg ${
                  activeMetric === 'pending_amount'
                    ? 'bg-ocean-600 text-white shadow-sm'
                    : 'text-surface-600 hover:text-ocean-700'
                }`}
              >
                Pending Dues
              </button>
              <button
                type="button"
                onClick={() => setActiveMetric('program_price')}
                className={`px-3 py-1 text-xs font-bold transition-all rounded-lg ${
                  activeMetric === 'program_price'
                    ? 'bg-ocean-600 text-white shadow-sm'
                    : 'text-surface-600 hover:text-ocean-700'
                }`}
              >
                Program Value
              </button>
            </div>
          </div>

          {/* Aggregation Function */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-ocean-950 uppercase tracking-wider">CALCULATION:</span>
            <div className="flex rounded-xl bg-surface-100/70 p-1 border border-surface-200">
              {['sum', 'average', 'count'].map((func) => (
                <button
                  key={func}
                  type="button"
                  onClick={() => setActiveFunc(func)}
                  className={`px-3 py-1 text-xs font-bold capitalize transition-all rounded-lg ${
                    activeFunc === func
                      ? 'bg-ocean-600 text-white shadow-sm'
                      : 'text-surface-600 hover:text-ocean-700'
                  }`}
                >
                  {func}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Draggable Dashboard Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {widgets.map((widget, idx) => {
          const isDraggingThis = draggedIndex === idx;
          const dragStyle = isDraggingThis ? 'opacity-40 border-2 border-dashed border-ocean-300 rounded-2xl bg-ocean-50/20' : '';
          
          let widgetContent = null;
          
          // 1. Course distribution Pie/Donut Chart
          if (widget.id === 'course') {
            const courseData = getProcessedData(rawCourses, 'course');
            widgetContent = (
              <Card
                title="Course Breakdown"
                subtitle={`${getMetricLabel()} divided by academic courses`}
                className="p-4 h-full"
                headerAction={
                  <button
                    className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-ocean-600 transition-colors"
                    onMouseDown={() => setDraggableId('course')}
                    onMouseUp={() => setDraggableId(null)}
                    title="Drag to reposition widget"
                  >
                    <HiBars3 className="w-4.5 h-4.5" />
                  </button>
                }
              >
                <div className="h-72">
                  {dataLoading ? (
                    <Skeleton variant="card" className="h-full" />
                  ) : courseData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {courseData.map((entry, index) => (
                            <Cell key={`course-cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={valueFormatter} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">No course analytics recorded</div>
                  )}
                </div>
              </Card>
            );
          }

          // 2. Counselor Performance Bar Chart
          else if (widget.id === 'counselor') {
            const counselorData = getProcessedData(rawCounselors, 'counselor');
            widgetContent = (
              <Card
                title="Counselor Allocations"
                subtitle={`${getMetricLabel()} handled per admissions counselor`}
                className="p-4 h-full"
                headerAction={
                  <button
                    className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-ocean-600 transition-colors"
                    onMouseDown={() => setDraggableId('counselor')}
                    onMouseUp={() => setDraggableId(null)}
                    title="Drag to reposition widget"
                  >
                    <HiBars3 className="w-4.5 h-4.5" />
                  </button>
                }
              >
                <div className="h-72">
                  {dataLoading ? (
                    <Skeleton variant="card" className="h-full" />
                  ) : counselorData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={counselorData} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                        <Tooltip formatter={valueFormatter} />
                        <Bar dataKey="value" fill="#1a8fd4" radius={[0, 4, 4, 0]} barSize={16} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">No counselor analytics recorded</div>
                  )}
                </div>
              </Card>
            );
          }

          // 3. Department Distribution Pie Chart
          else if (widget.id === 'dept') {
            const deptData = getProcessedData(rawDepartments, 'department');
            widgetContent = (
              <Card
                title="Department Distribution"
                subtitle={`${getMetricLabel()} partitioned in college departments`}
                className="p-4 h-full"
                headerAction={
                  <button
                    className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-ocean-600 transition-colors"
                    onMouseDown={() => setDraggableId('dept')}
                    onMouseUp={() => setDraggableId(null)}
                    title="Drag to reposition widget"
                  >
                    <HiBars3 className="w-4.5 h-4.5" />
                  </button>
                }
              >
                <div className="h-72">
                  {dataLoading ? (
                    <Skeleton variant="card" className="h-full" />
                  ) : deptData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deptData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {deptData.map((entry, index) => (
                            <Cell key={`dept-cell-${index}`} fill={DEPT_COLORS[index % DEPT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={valueFormatter} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">No department data found</div>
                  )}
                </div>
              </Card>
            );
          }

          // 4. Monthly Trend Area Chart
          else if (widget.id === 'monthly') {
            const monthlyData = getProcessedData(rawMonthly, 'month');
            widgetContent = (
              <Card
                title="Monthly Registration Trend"
                subtitle={`${getMetricLabel()} trends plotted dynamically over months`}
                className="p-4 h-full"
                headerAction={
                  <button
                    className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-ocean-600 transition-colors"
                    onMouseDown={() => setDraggableId('monthly')}
                    onMouseUp={() => setDraggableId(null)}
                    title="Drag to reposition widget"
                  >
                    <HiBars3 className="w-4.5 h-4.5" />
                  </button>
                }
              >
                <div className="h-72">
                  {dataLoading ? (
                    <Skeleton variant="card" className="h-full" />
                  ) : monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValueMain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0e6ba8" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#0e6ba8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip formatter={valueFormatter} />
                        <Area type="monotone" dataKey="value" name={getMetricLabel()} stroke="#0e6ba8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValueMain)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">No monthly metric dataset loaded</div>
                  )}
                </div>
              </Card>
            );
          }

          // 5. Payment Mode Breakdown Pie Chart
          else if (widget.id === 'paymentMode') {
            const pModeData = getProcessedData(rawPaymentModes, 'mode');
            widgetContent = (
              <Card
                title="Payment Mode Distribution"
                subtitle={`${getMetricLabel()} mapped to transaction modes`}
                className="p-4 h-full"
                headerAction={
                  <button
                    className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-ocean-600 transition-colors"
                    onMouseDown={() => setDraggableId('paymentMode')}
                    onMouseUp={() => setDraggableId(null)}
                    title="Drag to reposition widget"
                  >
                    <HiBars3 className="w-4.5 h-4.5" />
                  </button>
                }
              >
                <div className="h-72">
                  {dataLoading ? (
                    <Skeleton variant="card" className="h-full" />
                  ) : pModeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pModeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pModeData.map((entry, index) => (
                            <Cell key={`pmode-cell-${index}`} fill={PAYMENT_COLORS[index % PAYMENT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={valueFormatter} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">No transaction data recorded</div>
                  )}
                </div>
              </Card>
            );
          }

          // 6. College breakdown Bar Chart
          else if (widget.id === 'college') {
            const collegeData = getProcessedData(rawColleges, 'college').slice(0, 10);
            widgetContent = (
              <Card
                title="Top Institution Analysis"
                subtitle={`${getMetricLabel()} for top 10 representing colleges`}
                className="p-4 h-full"
                headerAction={
                  <button
                    className="p-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-ocean-600 transition-colors"
                    onMouseDown={() => setDraggableId('college')}
                    onMouseUp={() => setDraggableId(null)}
                    title="Drag to reposition widget"
                  >
                    <HiBars3 className="w-4.5 h-4.5" />
                  </button>
                }
              >
                <div className="h-72">
                  {dataLoading ? (
                    <Skeleton variant="card" className="h-full" />
                  ) : collegeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={collegeData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} angle={-25} textAnchor="end" tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip formatter={valueFormatter} />
                        <Bar dataKey="value" fill="#0e6ba8" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">No registration institutes found</div>
                  )}
                </div>
              </Card>
            );
          }

          return (
            <div
              key={widget.id}
              className={`transition-all duration-200 ${widget.size} ${dragStyle}`}
              draggable={draggableId === widget.id}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
            >
              {widgetContent}
            </div>
          );
        })}
      </div>
    </div>
  );
}
