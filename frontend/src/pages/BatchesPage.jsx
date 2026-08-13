import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import StatsCard from '../components/ui/StatsCard';

import {
  HiAcademicCap,
  HiCalendarDays,
  HiFunnel,
  HiMagnifyingGlass,
  HiUsers,
  HiCurrencyRupee,
  HiExclamationCircle,
  HiCheckCircle,
  HiArrowDownTray,
  HiEye,
  HiSparkles,
  HiXMark,
  HiMapPin,
  HiBuildingOffice,
  HiUserGroup
} from 'react-icons/hi2';

const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COURSE_OPTIONS = [
  'MERN Stack',
  'Java Full Stack',
  'Python Full Stack',
  'Data Science',
  'Cloud Computing',
  'Cyber Security',
  'UI/UX Design',
  'Digital Marketing'
];

export default function BatchesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [monthOpted, setMonthOpted] = useState(searchParams.get('month') || searchParams.get('monthOpted') || '');
  const [courseOpted, setCourseOpted] = useState(searchParams.get('course') || '');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('paymentStatus') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Dynamic filter dropdown options loaded from DB
  const [filterOptions, setFilterOptions] = useState({
    months: [],
    courses: []
  });

  // Data states
  const [batchBreakdown, setBatchBreakdown] = useState([]);
  const [students, setStudents] = useState([]);
  const [verMap, setVerMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Pagination & summary
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalStudents: 0, totalCollected: 0, totalPending: 0, defaultersCount: 0 });

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch distinct filter options from backend
  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await api.get('/dashboard/filter-options');
        if (res.data?.success) {
          setFilterOptions({
            months: res.data.data.months.length > 0 ? res.data.data.months : MONTH_OPTIONS,
            courses: res.data.data.courses.length > 0 ? res.data.data.courses : COURSE_OPTIONS
          });
        }
      } catch (err) {
        console.error('Failed to load filter options:', err);
      }
    }
    fetchOptions();
  }, []);

  // Fetch batch breakdown summary (intakes overview)
  const fetchBatchBreakdown = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (monthOpted) queryParams.append('monthOpted', monthOpted);
      if (courseOpted) queryParams.append('course', courseOpted);
      if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
      if (search) queryParams.append('search', search);

      const res = await api.get(`/dashboard/batch-breakdown?${queryParams.toString()}`);
      if (res.data?.success) {
        setBatchBreakdown(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load batch overview.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch student directory list for selected batch
  const fetchBatchStudents = async () => {
    try {
      setLoadingStudents(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        monthOpted,
        course: courseOpted,
        paymentStatus,
        search
      }).toString();

      const res = await api.get(`/students?${queryParams}`);
      if (res.data?.success) {
        const fetched = res.data.data.students || [];
        setStudents(fetched);
        setTotalPages(res.data.data.totalPages || 1);

        const totalColl = fetched.reduce((acc, curr) => acc + (parseFloat(curr.amount_received || curr.payment_amount) || 0), 0);
        const totalPend = fetched.reduce((acc, curr) => acc + (parseFloat(curr.pending_amount) || 0), 0);
        const defaulters = fetched.filter(curr => parseFloat(curr.pending_amount) > 0).length;

        setSummary({
          totalStudents: res.data.data.total || fetched.length,
          totalCollected: totalColl,
          totalPending: totalPend,
          defaultersCount: defaulters
        });
      }

      // Load verification status map
      const verRes = await api.get('/verification');
      const verifications = verRes.data?.data?.results || [];
      const mapping = new Map(verifications.map((v) => [v.reference_id, v]));
      setVerMap(mapping);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load batch student records.');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchBatchBreakdown();
    fetchBatchStudents();
  }, [monthOpted, courseOpted, paymentStatus, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBatchBreakdown();
    fetchBatchStudents();
  };

  const handleClearFilters = () => {
    setMonthOpted('');
    setCourseOpted('');
    setPaymentStatus('');
    setSearch('');
    setSearchParams({});
    setPage(1);
  };

  const selectBatchCard = (month, course) => {
    setMonthOpted(month === 'Unspecified Month' ? '' : month);
    setCourseOpted(course === 'Unspecified Course' ? '' : course);
    setPage(1);
    toast.success(`Filtered for ${month} - ${course}`);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const handleExport = async (format) => {
    try {
      toast.loading(`Generating ${format.toUpperCase()} export...`, { id: 'export-toast' });
      const queryParams = new URLSearchParams();
      if (monthOpted) queryParams.append('monthOpted', monthOpted);
      if (courseOpted) queryParams.append('course', courseOpted);
      if (paymentStatus) queryParams.append('paymentStatus', paymentStatus);
      if (search) queryParams.append('search', search);

      const res = await api.get(`/export/students/${format}?${queryParams.toString()}`, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `batch-students-${monthOpted || 'all'}-${courseOpted || 'all'}.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`${format.toUpperCase()} report downloaded successfully!`, { id: 'export-toast' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export batch report.', { id: 'export-toast' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight flex items-center gap-2">
            <HiAcademicCap className="w-8 h-8 text-primary-600" />
            Batch Intake & Course Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Filter student enrollments by month opted (e.g. August, September) and course opted (e.g. MERN Stack).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
            onClick={() => handleExport('excel')}
          >
            <HiArrowDownTray className="w-4 h-4 text-emerald-600" /> Export Excel
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs border-rose-300 text-rose-800 hover:bg-rose-50"
            onClick={() => handleExport('pdf')}
          >
            <HiArrowDownTray className="w-4 h-4 text-rose-600" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Interactive Batch Filter Control Panel */}
      <Card className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <HiFunnel className="w-5 h-5 text-primary-600" />
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              Batch Selection & Filters
            </h3>
            {(monthOpted || courseOpted || paymentStatus || search) && (
              <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                Active Batch Filter
              </span>
            )}
          </div>
          {(monthOpted || courseOpted || paymentStatus || search) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:text-red-800 font-bold hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Month Opted Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              📅 Month Opted
            </label>
            <select
              className="form-input text-xs py-2 font-medium"
              value={monthOpted}
              onChange={(e) => { setMonthOpted(e.target.value); setPage(1); }}
            >
              <option value="">All Months</option>
              {filterOptions.months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Course Opted Selector */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              🎓 Course Opted
            </label>
            <select
              className="form-input text-xs py-2 font-medium"
              value={courseOpted}
              onChange={(e) => { setCourseOpted(e.target.value); setPage(1); }}
            >
              <option value="">All Courses</option>
              {filterOptions.courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Fee Payment Status */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              💳 Payment Status
            </label>
            <select
              className="form-input text-xs py-2 font-medium"
              value={paymentStatus}
              onChange={(e) => { setPaymentStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">⚠️ Pending Dues (Unpaid)</option>
              <option value="paid">✅ Fully Paid (Zero Dues)</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              🔍 Search Student
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Name, Ref ID, Email, Phone..."
                className="form-input pl-9 text-xs py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <HiMagnifyingGlass className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </form>

        {/* Quick Batch Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400">Quick Month Batches:</span>
          {['August', 'September', 'July', 'June', 'October'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMonthOpted(monthOpted === m ? '' : m); setPage(1); }}
              className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                monthOpted.toLowerCase() === m.toLowerCase()
                  ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              📅 {m} Batch
            </button>
          ))}

          <span className="text-xs font-bold text-gray-400 ml-2">Quick Course Batches:</span>
          {['MERN Stack', 'Java Full Stack', 'Python Full Stack', 'Data Science'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => { setCourseOpted(courseOpted === c ? '' : c); setPage(1); }}
              className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                courseOpted.toLowerCase() === c.toLowerCase()
                  ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              ⚡ {c}
            </button>
          ))}
        </div>
      </Card>

      {/* Batch Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Batch Students"
          value={loadingStudents ? '...' : summary.totalStudents}
          icon={HiUsers}
          color="indigo"
          description={monthOpted || courseOpted ? `Filtered: ${monthOpted || 'All Months'} - ${courseOpted || 'All Courses'}` : 'Total matching batch students'}
        />
        <StatsCard
          title="Batch Fees Collected"
          value={loadingStudents ? '...' : formatCurrency(summary.totalCollected)}
          icon={HiCurrencyRupee}
          color="emerald"
          description="Total fees received for batch"
        />
        <StatsCard
          title="Batch Pending Dues"
          value={loadingStudents ? '...' : formatCurrency(summary.totalPending)}
          icon={HiExclamationCircle}
          color="amber"
          description={`${summary.defaultersCount} students with dues`}
        />
        <StatsCard
          title="Active Intake Groups"
          value={loading ? '...' : batchBreakdown.length}
          icon={HiAcademicCap}
          color="purple"
          description="Total Month + Course combinations"
        />
      </div>

      {/* Batch Intakes Overview Grid */}
      <Card
        title="Intake Groups Overview (Month + Course Breakdowns)"
        subtitle="Click any batch card to inspect its enrolled student list"
        className="p-5"
        variant="glass"
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
            <Skeleton variant="card" className="h-24" />
          </div>
        ) : batchBreakdown.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batchBreakdown.map((b, idx) => {
              const isSelected = monthOpted === b.monthOpted && courseOpted === b.courseOpted;
              return (
                <div
                  key={`batch-card-${idx}`}
                  onClick={() => selectBatchCard(b.monthOpted, b.courseOpted)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-2 ring-indigo-400'
                      : 'bg-white hover:bg-indigo-50/40 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full inline-block mb-1">
                        📅 {b.monthOpted}
                      </span>
                      <h4 className="text-base font-bold text-gray-900 group-hover:text-indigo-900">
                        {b.courseOpted}
                      </h4>
                    </div>
                    <span className="text-xs font-black text-indigo-700 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg shadow-2xs">
                      {b.totalStudents} std
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-gray-400 block font-medium">Collected</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(b.totalCollected)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-gray-400 block font-medium">Pending Dues</span>
                      <span className={`font-bold ${b.totalPending > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {formatCurrency(b.totalPending)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400 text-xs">
            No batch records found matching your filters.
          </div>
        )}
      </Card>

      {/* Batch Students Directory Table */}
      <Card
        title={`Batch Students Directory ${monthOpted || courseOpted ? `(${monthOpted || 'All'} - ${courseOpted || 'All'})` : ''}`}
        subtitle={`Showing enrolled student records for the selected batch`}
        className="p-5"
      >
        {loadingStudents ? (
          <Skeleton variant="card" className="h-64" />
        ) : students.length > 0 ? (
          <>
            <Table
              headers={['Ref ID', 'Student Name', 'Month Opted', 'Course Opted', 'College / State', 'Counselor', 'Program Price', 'Paid / Pending', 'Actions']}
              rows={students.map((st) => {
                const v = verMap.get(st.reference_id);
                return [
                  <span key={`ref-${st.id}`} className="font-mono text-xs font-bold text-gray-800">{st.reference_id}</span>,
                  <div key={`name-${st.id}`}>
                    <div className="font-bold text-gray-900">{st.full_name}</div>
                    <div className="text-[11px] text-gray-400">{st.email || '—'}</div>
                  </div>,
                  <span key={`month-${st.id}`} className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    📅 {st.month_opted || '—'}
                  </span>,
                  <span key={`course-${st.id}`} className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                    🎓 {st.course_opted || '—'}
                  </span>,
                  <div key={`col-${st.id}`} className="text-xs">
                    <div className="font-medium text-gray-700 truncate max-w-[150px]">{st.college_name || '—'}</div>
                    <div className="text-[11px] text-gray-400">📍 {st.state || '—'}</div>
                  </div>,
                  <span key={`cn-${st.id}`} className="text-xs text-gray-600 font-medium">{st.counselor_name || '—'}</span>,
                  <span key={`prg-${st.id}`} className="font-bold text-gray-800">{formatCurrency(st.program_price)}</span>,
                  <div key={`fee-${st.id}`}>
                    <div className="text-xs font-bold text-emerald-600">Paid: {formatCurrency(st.amount_received)}</div>
                    {parseFloat(st.pending_amount) > 0 ? (
                      <div className="text-[11px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-0.5 inline-block">
                        Due: {formatCurrency(st.pending_amount)}
                      </div>
                    ) : (
                      <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded mt-0.5 inline-block">
                        ✅ Zero Dues
                      </div>
                    )}
                  </div>,
                  <Button
                    key={`act-${st.id}`}
                    variant="outline"
                    className="text-xs py-1 px-2.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    onClick={() => { setSelectedStudent(st); setShowDetailsModal(true); }}
                  >
                    <HiEye className="w-3.5 h-3.5 mr-1" /> View Profile
                  </Button>
                ];
              })}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500 font-medium">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="text-xs py-1 px-3"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="text-xs py-1 px-3"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <HiUsers className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No batch students found</p>
            <p className="text-xs text-gray-400">Try adjusting your Month Opted or Course Opted filters.</p>
          </div>
        )}
      </Card>

      {/* Student Full Profile Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto border border-gray-100 shadow-2xl relative">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <HiXMark className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                {selectedStudent.full_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h3>
                <p className="text-xs font-mono text-indigo-600 font-bold">Ref ID: {selectedStudent.reference_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Batch & Academic Info</h4>
                <div><span className="text-gray-400">Month Opted:</span> <strong className="text-indigo-700">{selectedStudent.month_opted || '—'}</strong></div>
                <div><span className="text-gray-400">Course Opted:</span> <strong className="text-rose-700">{selectedStudent.course_opted || '—'}</strong></div>
                <div><span className="text-gray-400">College:</span> {selectedStudent.college_name || '—'}</div>
                <div><span className="text-gray-400">Department:</span> {selectedStudent.department || '—'}</div>
                <div><span className="text-gray-400">State:</span> {selectedStudent.state || '—'}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Financial Breakdown</h4>
                <div><span className="text-gray-400">Program Fee:</span> <strong>{formatCurrency(selectedStudent.program_price)}</strong></div>
                <div><span className="text-gray-400">Amount Received:</span> <strong className="text-emerald-600">{formatCurrency(selectedStudent.amount_received)}</strong></div>
                <div><span className="text-gray-400">Pending Amount:</span> <strong className={parseFloat(selectedStudent.pending_amount) > 0 ? 'text-amber-600 font-black' : 'text-emerald-600'}>{formatCurrency(selectedStudent.pending_amount)}</strong></div>
                <div><span className="text-gray-400">Payment Mode:</span> {selectedStudent.payment_mode || '—'}</div>
                <div><span className="text-gray-400">Counselor:</span> {selectedStudent.counselor_name || '—'}</div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5 md:col-span-2">
                <h4 className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">Contact Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-gray-400">Phone:</span> {selectedStudent.phone_no || '—'}</div>
                  <div><span className="text-gray-400">WhatsApp:</span> {selectedStudent.whatsapp_number || '—'}</div>
                  <div><span className="text-gray-400">Email:</span> {selectedStudent.email || '—'}</div>
                  <div><span className="text-gray-400">Revenue Channel:</span> {selectedStudent.revenue_channel || '—'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
