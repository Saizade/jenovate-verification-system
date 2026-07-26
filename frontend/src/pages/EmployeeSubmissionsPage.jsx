import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';

import { HiMagnifyingGlass, HiFunnel, HiClipboardDocumentCheck } from 'react-icons/hi2';

export default function EmployeeSubmissionsPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        search,
        employeeId
      }).toString();

      const submissionsRes = await api.get(`/submissions?${queryParams}`);
      if (submissionsRes.data.success) {
        setSubmissions(submissionsRes.data.data.submissions);
        setTotalPages(submissionsRes.data.data.totalPages || 1);
      }

      // Also list employees for filter dropdown (Admin only)
      if (user?.role === 'admin') {
        const employeesRes = await api.get('/employees');
        if (employeesRes.data.success) {
          setEmployees(employeesRes.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employee submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, employeeId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleClearFilters = () => {
    setSearch('');
    setEmployeeId('');
    setPage(1);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
          Employee Submissions
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Review transaction verification details entered by student coordinators and advisors.
        </p>
      </div>

      {/* Filters Card */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Global Search */}
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Search Records
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, reference ID..."
                className="form-input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <HiMagnifyingGlass className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            </div>
          </div>

          {/* Filter by Employee (Admin Only) */}
          {user?.role === 'admin' && (
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Coordinator
              </label>
              <select
                className="form-input"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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

      {/* Submissions Table */}
      <Card className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="table-row" />
            ))}
          </div>
        ) : submissions.length > 0 ? (
          <div className="space-y-4">
            <Table
              headers={['Ref ID', 'Student Name', 'Course Name', 'Entered Amount', 'Joining Date', 'Coordinator', 'Remarks']}
              rows={submissions.map((sub) => [
                <span className="font-mono text-xs font-bold text-gray-800" key={sub.id}>{sub.reference_id}</span>,
                <span className="font-semibold text-gray-850" key={sub.id}>{sub.student_name}</span>,
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded" key={sub.id}>{sub.course_name}</span>,
                <span className="font-bold text-gray-800" key={sub.id}>{formatCurrency(sub.payment_amount)}</span>,
                <span className="text-xs text-gray-400" key={sub.id}>{sub.joining_date}</span>,
                <span className="text-xs font-semibold text-primary-950 bg-primary-50 px-2 py-1 rounded" key={sub.id}>
                  {sub.employee?.name || `ID: ${sub.employee_id}`}
                </span>,
                <span className="text-xs text-gray-500 italic block max-w-xs truncate" title={sub.remarks} key={sub.id}>
                  {sub.remarks || '—'}
                </span>
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
            <HiClipboardDocumentCheck className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700">No Employee Entries Found</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Coordinators haven't uploaded verification logs matching the criteria.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
