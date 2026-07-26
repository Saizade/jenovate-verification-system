import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';

import {
  HiMagnifyingGlass, HiFunnel, HiArrowDownTray,
  HiEye, HiSparkles, HiCalendarDays
} from 'react-icons/hi2';

const COURSE_OPTIONS = [
  { value: 'java_fullstack', label: 'Java Full Stack' },
  { value: 'python_fullstack', label: 'Python Full Stack' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'mern_stack', label: 'MERN Stack' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'ui_ux_design', label: 'UI/UX Design' }
];

export default function StudentsListPage() {
  const [students, setStudents] = useState([]);
  const [verMap, setVerMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modal state for student details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
        dateFrom,
        dateTo
      }).toString();

      const res = await api.get(`/students?${queryParams}`);
      if (res.data.success) {
        setStudents(res.data.data.students);
        setTotalPages(res.data.data.totalPages || 1);
      }

      // Also get verification results to overlay status
      const verificationsRes = await api.get('/verification');
      const verifications = verificationsRes.data.data.results || [];
      const mapping = new Map(verifications.map((v) => [v.reference_id, v]));
      setVerMap(mapping);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, course, dateFrom, dateTo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCourse('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handleExport = async (format) => {
    try {
      toast.loading(`Generating ${format.toUpperCase()} export...`);
      const queryParams = new URLSearchParams({
        search,
        course,
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
      link.download = `students-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.click();
      toast.dismiss();
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error('Export failed.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (refId) => {
    const ver = verMap.get(refId);
    if (!ver) return <Badge variant="neutral">Pending Verification</Badge>;
    if (ver.match_status === 'MATCH') return <Badge variant="success">MATCH</Badge>;
    return <Badge variant="danger">MISMATCH</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
            Registered Students
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse, search, and audit student registration submissions.
          </p>
        </div>

        {/* Exports */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs py-2"
            onClick={() => handleExport('excel')}
          >
            <HiArrowDownTray className="w-4 h-4" /> Export Excel
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-1.5 text-xs py-2"
            onClick={() => handleExport('pdf')}
          >
            <HiArrowDownTray className="w-4 h-4" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          {/* Global Search */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Search Student
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name, Reference ID, Email..."
                className="form-input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <HiMagnifyingGlass className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            </div>
          </div>

          {/* Course */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Course
            </label>
            <select
              className="form-input"
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

          {/* Date from/to */}
          <div className="grid grid-cols-2 gap-2 md:col-span-1">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                From Date
              </label>
              <input
                type="date"
                className="form-input text-xs px-2"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                To Date
              </label>
              <input
                type="date"
                className="form-input text-xs px-2"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1 py-2 text-xs">
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="px-2 text-xs"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>
        </form>
      </Card>

      {/* Students Table */}
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
              headers={['Ref ID', 'Name', 'Course', 'Fees Paid', 'Joining Date', 'Verify Status', 'Action']}
              rows={students.map((st) => [
                <span className="font-mono text-xs font-bold text-gray-800" key={st.id}>{st.reference_id}</span>,
                <div key={st.id}>
                  <div className="font-semibold text-gray-800">{st.full_name}</div>
                  <div className="text-xs text-gray-400">{st.email}</div>
                </div>,
                <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded" key={st.id}>{st.course_name}</span>,
                <span className="font-bold text-gray-800" key={st.id}>{formatCurrency(st.payment_amount)}</span>,
                <span className="text-xs text-gray-400" key={st.id}>{st.joining_date}</span>,
                <div key={st.id}>{getStatusBadge(st.reference_id)}</div>,
                <Button
                  key={st.id}
                  variant="ghost"
                  className="flex items-center gap-1 text-primary-600 hover:text-primary-800 py-1 px-2 text-xs"
                  onClick={() => {
                    setSelectedStudent(st);
                    setShowDetailsModal(true);
                  }}
                >
                  <HiEye className="w-4 h-4" /> View Details
                </Button>
              ])}
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
            <p className="text-sm font-semibold text-gray-700">No Student Records Found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              No registration submissions found matching the criteria.
            </p>
          </div>
        )}
      </Card>

      {/* Details Modal */}
      {showDetailsModal && selectedStudent && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`Student Profile: ${selectedStudent.reference_id}`}
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
                  <span className="text-xs text-gray-400 font-medium">Joined {selectedStudent.joining_date}</span>
                </div>
              </div>
              <div>{getStatusBadge(selectedStudent.reference_id)}</div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200/50 flex items-center gap-1.5">
                  <HiEye className="w-4 h-4 text-primary-500" /> Personal Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Date of Birth</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.dob}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Gender</span>
                    <p className="font-semibold text-gray-800 capitalize">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Mobile Number</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.mobile}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Email Address</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.email}</p>
                  </div>
                </div>
              </div>

              {/* Family Details */}
              <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200/50 flex items-center gap-1.5">
                  <HiSparkles className="w-4 h-4 text-violet-500" /> Family Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Father's Name</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.father_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Mother's Name</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.mother_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Siblings</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.number_of_siblings}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Guardian Info</span>
                    <p className="font-semibold text-gray-800">
                      {selectedStudent.guardian_details || '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200/50 flex items-center gap-1.5">
                  <HiCalendarDays className="w-4 h-4 text-amber-500" /> Academic & Location
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Course Name</span>
                    <p className="font-semibold text-gray-800">{selectedStudent.course_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Course Fees</span>
                    <p className="font-semibold text-gray-800">{formatCurrency(selectedStudent.course_fee)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">City / State</span>
                    <p className="font-semibold text-gray-800">
                      {selectedStudent.city}, {selectedStudent.state}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400 font-semibold block">Full Address</span>
                    <p className="text-gray-600 font-medium whitespace-pre-wrap">{selectedStudent.full_address}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3 bg-gray-50/50 rounded-xl p-4 border border-gray-200/50">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-2 border-b border-gray-200/50 flex items-center gap-1.5">
                  🔑 Payment Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400">Paid Amount</span>
                    <p className="font-semibold text-gray-800">{formatCurrency(selectedStudent.payment_amount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Payment Mode</span>
                    <p className="font-semibold text-gray-800 capitalize">{selectedStudent.payment_mode}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-400">Transaction ID</span>
                    <p className="font-mono font-bold text-primary-950 bg-white px-2 py-1 rounded border border-gray-200 mt-0.5 select-all">
                      {selectedStudent.transaction_id || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents preview list */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Attached Documents
              </h4>
              <div className="flex flex-wrap gap-3">
                {selectedStudent.documents ? (
                  Object.entries(
                    typeof selectedStudent.documents === 'string'
                      ? JSON.parse(selectedStudent.documents)
                      : selectedStudent.documents
                  ).map(([key, value]) => (
                    <a
                      href={`http://localhost:5000/${value}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 p-2 border border-gray-200 hover:border-primary-400 bg-gray-50 hover:bg-primary-50 rounded-lg text-xs font-semibold text-gray-700 transition"
                      key={key}
                    >
                      <span>📎</span>
                      <span className="capitalize">{key.replace('Doc', '').replace('Doc', '')} Document</span>
                    </a>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 italic">No attachments found.</span>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button variant="primary" onClick={() => setShowDetailsModal(false)}>
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
