import { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

import {
  HiMagnifyingGlass, HiFunnel, HiArrowDownTray, HiArrowUpTray,
  HiEye, HiSparkles, HiMapPin, HiBanknotes, HiExclamationCircle,
  HiCheckCircle, HiDocumentCheck, HiArrowPath
} from 'react-icons/hi2';

import { useSearchParams } from 'react-router-dom';

const COURSE_OPTIONS = [
  { value: 'java_fullstack', label: 'Java Full Stack' },
  { value: 'python_fullstack', label: 'Python Full Stack' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'mern_stack', label: 'MERN Stack' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'ui_ux_design', label: 'UI/UX Design' }
];

const POPULAR_STATES = [
  'Maharashtra',
  'Karnataka',
  'Delhi',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Kerala',
  'Madhya Pradesh',
  'Punjab'
];

export default function DataPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [verMap, setVerMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [course, setCourse] = useState(searchParams.get('course') || '');
  const [stateFilter, setStateFilter] = useState(searchParams.get('state') || '');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('paymentStatus') || '');
  const [counselor, setCounselor] = useState(searchParams.get('counselor') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  
  // Summary stats
  const [filteredSummary, setFilteredSummary] = useState({ totalCount: 0, totalPending: 0, totalReceived: 0 });

  // Student Details Modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Import Excel Modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        course,
        state: stateFilter,
        paymentStatus,
        counselor,
        department,
        dateFrom,
        dateTo
      }).toString();

      const res = await api.get(`/students?${queryParams}`);
      if (res.data.success) {
        const fetched = res.data.data.students || [];
        setStudents(fetched);
        setTotalPages(res.data.data.totalPages || 1);
        
        // Calculate stats
        const getStudentReceivedAmount = (st) => {
          if (!st) return 0;
          const rcv = st.amount_received ?? st.amountReceived ?? st.payment_amount;
          return parseFloat(rcv) || 0;
        };

        const pendingSum = fetched.reduce((acc, curr) => acc + (parseFloat(curr.pending_amount) || 0), 0);
        const receivedSum = fetched.reduce((acc, curr) => acc + getStudentReceivedAmount(curr), 0);
        setFilteredSummary({
          totalCount: res.data.data.total || fetched.length,
          totalPending: pendingSum,
          totalReceived: receivedSum
        });
      }

      // Verification mapping if available
      try {
        const verificationsRes = await api.get('/verification');
        const verifications = verificationsRes.data?.data?.results || [];
        const mapping = new Map(verifications.map((v) => [v.reference_id, v]));
        setVerMap(mapping);
      } catch {
        // Safe fallback if verifications route is legacy
      }

    } catch (err) {
      console.error(err);
      toast.error('Failed to load student data records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, course, stateFilter, paymentStatus, counselor, department, dateFrom, dateTo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCourse('');
    setStateFilter('');
    setPaymentStatus('');
    setCounselor('');
    setDepartment('');
    setDateFrom('');
    setDateTo('');
    setSearchParams({});
    setPage(1);
  };

  const handleExport = async (format) => {
    try {
      toast.loading(`Generating ${format.toUpperCase()} export...`);
      const queryParams = new URLSearchParams({
        search,
        course,
        state: stateFilter,
        paymentStatus,
        dateFrom,
        dateTo
      }).toString();

      const response = await api.get(`/export/students/${format}?${queryParams}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `students-data-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      toast.dismiss();
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('Export failed.');
    }
  };

  const handleDownloadSampleTemplate = async () => {
    try {
      toast.loading('Generating Excel template...');
      const response = await api.get('/students/sample-excel', {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'students-import-sample-template.xlsx';
      link.click();
      toast.dismiss();
      toast.success('Sample Excel template downloaded!');
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error('Failed to download template.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an Excel file to import.');
      return;
    }

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await api.post('/students/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Students imported successfully!');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowImportModal(false);
        setPage(1);
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to import Excel data.';
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const getStatusBadge = (refId) => {
    const ver = verMap.get(refId);
    if (!ver) return <Badge variant="neutral">Registered</Badge>;
    if (ver.match_status === 'MATCH') return <Badge variant="success">MATCH</Badge>;
    return <Badge variant="danger">MISMATCH</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Upper Right Corner Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight flex items-center gap-2">
            Data Hub
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Import student registrations directly from Excel sheets, filter records, and view complete student dataset.
          </p>
        </div>

        {/* Upper Right Corner Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Requested Import Excel Button */}
          <Button
            variant="primary"
            className="flex items-center gap-2 text-xs py-2 px-4 shadow-lg shadow-indigo-500/20 font-bold"
            onClick={() => setShowImportModal(true)}
            id="import-excel-btn"
          >
            <HiArrowUpTray className="w-4 h-4" /> Import Excel
          </Button>

          {/* Export Excel Button */}
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs py-2"
            onClick={() => handleExport('excel')}
            id="export-excel-btn"
          >
            <HiArrowDownTray className="w-4 h-4" /> Export Excel
          </Button>

          {/* Export PDF Button */}
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs py-2"
            onClick={() => handleExport('pdf')}
          >
            <HiArrowDownTray className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Advanced Filters Card */}
      <Card className="p-5 bg-white border border-gray-100 rounded-2xl shadow-md">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Global Search */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Search Student
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name, Ref ID, Email, Phone, College..."
                  className="form-input pl-10 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <HiMagnifyingGlass className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Filter by State */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                State / Region
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="data-states-list"
                  placeholder="e.g. Maharashtra"
                  className="form-input text-xs pl-8"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                />
                <HiMapPin className="absolute left-2.5 top-3 w-4 h-4 text-rose-500" />
                <datalist id="data-states-list">
                  {POPULAR_STATES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Filter by Fee Payment Status */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Fee Payment Status
              </label>
              <select
                className="form-input text-xs"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">⚠️ Pending Dues (Fees Not Fully Paid)</option>
                <option value="paid">✅ Fully Paid (No Dues)</option>
              </select>
            </div>

            {/* Course Opted */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Course Opted
              </label>
              <select
                className="form-input text-xs"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {COURSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Date Filter
              </label>
              <div className="grid grid-cols-2 gap-1">
                <input
                  type="date"
                  className="form-input text-[11px] p-1.5"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  title="From Date"
                />
                <input
                  type="date"
                  className="form-input text-[11px] p-1.5"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  title="To Date"
                />
              </div>
            </div>
          </div>

          {/* Quick State Chips & Filter Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Quick State Filters:</span>
              {['Maharashtra', 'Karnataka', 'Delhi', 'Gujarat'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStateFilter(st)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    stateFilter.toLowerCase() === st.toLowerCase()
                      ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  📍 {st}
                </button>
              ))}
              {stateFilter && (
                <button
                  type="button"
                  onClick={() => setStateFilter('')}
                  className="text-xs text-red-500 font-bold hover:underline ml-1"
                >
                  Clear State
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" className="py-1.5 px-4 text-xs">
                Apply Filters
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="py-1.5 px-3 text-xs"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Filter Summary Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase">Filtered Students</span>
            <h3 className="text-2xl font-black text-indigo-950 mt-0.5">{filteredSummary.totalCount}</h3>
          </div>
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            👥
          </div>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase">Page Pending Dues</span>
            <h3 className="text-2xl font-black text-amber-900 mt-0.5">{formatCurrency(filteredSummary.totalPending)}</h3>
          </div>
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
            <HiExclamationCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase">Page Fees Collected</span>
            <h3 className="text-2xl font-black text-emerald-950 mt-0.5">{formatCurrency(filteredSummary.totalReceived)}</h3>
          </div>
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <HiBanknotes className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="table-row" />
            ))}
          </div>
        ) : students.length > 0 ? (
          <div className="space-y-4">
            <Table
              headers={['Ref ID', 'Student Name', 'State', 'Counselor', 'College', 'Department', 'Course Opted', 'Received', 'Pending', 'Payment Status', 'Verify Status', 'Action']}
              rows={students.map((st) => {
                const isPending = (parseFloat(st.pending_amount) || 0) > 0;
                return [
                  <span className="font-mono text-xs font-bold text-gray-800" key={`ref-${st.id}`}>{st.reference_id}</span>,
                  <div key={`name-${st.id}`}>
                    <div className="font-semibold text-gray-800">{st.full_name}</div>
                    <div className="text-xs text-gray-400">{st.email || st.phone_no || '—'}</div>
                  </div>,
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded" key={`state-${st.id}`}>
                    {st.state || '—'}
                  </span>,
                  <span className="text-xs font-medium text-gray-700" key={`coun-${st.id}`}>{st.counselor_name || '—'}</span>,
                  <span className="text-xs font-medium text-gray-600 truncate max-w-[120px] block" title={st.college_name} key={`col-${st.id}`}>{st.college_name || '—'}</span>,
                  <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded" key={`dept-${st.id}`}>{st.department || '—'}</span>,
                  <span className="text-xs font-semibold text-primary-950 bg-primary-50 px-2 py-0.5 rounded" key={`crs-${st.id}`}>{st.course_opted || st.course_name || '—'}</span>,
                  <span className="font-bold text-emerald-600" key={`rcv-${st.id}`}>{formatCurrency(st.amount_received ?? st.payment_amount ?? st.amountReceived ?? 0)}</span>,
                  <span className={`font-bold ${isPending ? 'text-amber-600' : 'text-gray-400'}`} key={`pnd-${st.id}`}>
                    {formatCurrency(st.pending_amount)}
                  </span>,
                  <div key={`pstat-${st.id}`}>
                    {isPending ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                        <HiExclamationCircle className="w-3.5 h-3.5" /> Pending Dues
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <HiCheckCircle className="w-3.5 h-3.5" /> Fully Paid
                      </span>
                    )}
                  </div>,
                  <div key={`ver-${st.id}`}>{getStatusBadge(st.reference_id)}</div>,
                  <Button
                    key={`act-${st.id}`}
                    variant="ghost"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-800 py-1 px-2 text-xs"
                    onClick={() => {
                      setSelectedStudent(st);
                      setShowDetailsModal(true);
                    }}
                  >
                    <HiEye className="w-4 h-4" /> Details
                  </Button>
                ];
              })}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="py-1 px-3 text-xs"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  className="py-1 px-3 text-xs"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-surface-50 border border-dashed border-gray-200 rounded-2xl">
            <HiFunnel className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700">No Data Records Found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Import student data via Excel or adjust filter criteria.
            </p>
            <Button
              variant="primary"
              className="mt-4 text-xs py-2 px-4"
              onClick={() => setShowImportModal(true)}
            >
              <HiArrowUpTray className="w-4 h-4 mr-1" /> Import Excel Sheet
            </Button>
          </div>
        )}
      </Card>

      {/* Modal 1: Import Excel Modal */}
      {showImportModal && (
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            if (!importing) setShowImportModal(false);
          }}
          title="Import Students Data from Excel Sheet"
          size="md"
        >
          <form onSubmit={handleImportSubmit} className="space-y-5">
            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <HiDocumentCheck className="w-4 h-4 text-indigo-600" /> Excel Import Instructions
                </span>
                <button
                  type="button"
                  onClick={handleDownloadSampleTemplate}
                  className="text-xs text-indigo-700 hover:text-indigo-900 font-bold underline flex items-center gap-1"
                >
                  <HiArrowDownTray className="w-3.5 h-3.5" /> Download Template
                </button>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Upload an Excel sheet (<code>.xlsx</code>, <code>.xls</code>) or <code>.csv</code> file containing student registration rows.
                The system will automatically parse fields (Name, Phone, Email, College, Course, Fees, Counselor, State, etc.) and save the imported students into the database.
              </p>
            </div>

            {/* Dropzone File Select */}
            <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50/20 transition-all rounded-2xl p-6 text-center cursor-pointer relative">
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={importing}
                id="excel-file-input"
              />
              <HiArrowUpTray className="w-10 h-10 mx-auto text-indigo-500 mb-2" />
              <p className="text-sm font-semibold text-gray-800">
                {selectedFile ? selectedFile.name : 'Click or drop your Excel file here'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supported formats: .xlsx, .xls, .csv (Max 15MB)
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                <span className="font-medium text-emerald-800 truncate max-w-[280px]">
                  📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-red-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowImportModal(false)}
                disabled={importing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!selectedFile || importing}
                className="px-5 py-2 font-bold"
              >
                {importing ? (
                  <span className="flex items-center gap-2">
                    <HiArrowPath className="w-4 h-4 animate-spin" /> Importing Data...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <HiArrowUpTray className="w-4 h-4" /> Start Excel Import
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Student Details: ${selectedStudent.reference_id}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 text-primary-950 font-black rounded-xl flex items-center justify-center text-lg uppercase">
                  {selectedStudent.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">{selectedStudent.full_name}</h3>
                  <span className="text-xs text-gray-400 font-medium">State: {selectedStudent.state || '—'} | Date: {selectedStudent.date || selectedStudent.joining_date || '—'}</span>
                </div>
              </div>
              <div>{getStatusBadge(selectedStudent.reference_id)}</div>
            </div>

            {/* Profile Grid (All 24 fields) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General & Contact Info */}
              <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200/50 flex items-center gap-1.5">
                  <HiEye className="w-4 h-4 text-primary-500" /> General & Contact Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Counselor Name</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.counselor_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Phone No.</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.phone_no || selectedStudent.mobile || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">WhatsApp Number</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.whatsapp_number || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">E-mail</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.email || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Status Remarks</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.remarks || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Academic Remarks</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.academic_remarks || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Institution & Academic Info */}
              <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200/50 flex items-center gap-1.5">
                  <HiSparkles className="w-4 h-4 text-violet-500" /> Institution & Academic
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="col-span-2">
                    <span className="text-gray-400">College Name</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.college_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">State</span>
                    <p className="font-semibold font-bold text-rose-600">{selectedStudent.state || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Department</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.department || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Course Opted</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.course_opted || selectedStudent.course_name || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Type of Pack</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.type_of_pack || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Primary Course</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.primary_course || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Secondary Course</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.secondary_course || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Course Status & Payment */}
              <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-200/50 md:col-span-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200/50 flex items-center gap-1.5">
                  💳 Course Status, Financials & Revenue Channel
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Month Opted</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.month_opted || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Type of Course</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.type_of_course || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment Mode</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.payment_mode || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Revenue Channel</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.revenue_channel || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Program Price</span>
                    <p className="font-bold text-gray-900">{formatCurrency(selectedStudent.program_price)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Amount Received</span>
                    <p className="font-bold text-emerald-600">{formatCurrency(selectedStudent.amount_received || selectedStudent.payment_amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Pending Amount</span>
                    <p className="font-bold text-amber-600">{formatCurrency(selectedStudent.pending_amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Submitted By</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.submittedBy?.name || 'System / Excel'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="primary" onClick={() => setShowDetailsModal(false)}>
                Close Details
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
