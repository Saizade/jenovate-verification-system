import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import StatsCard from '../components/ui/StatsCard';

import {
  HiDocumentPlus, HiClipboardDocumentList, HiCheckBadge,
  HiExclamationTriangle, HiCheckCircle, HiXCircle, HiMiniReceiptPercent
} from 'react-icons/hi2';

const COURSE_OPTIONS = [
  { value: 'java_fullstack', label: 'Java Full Stack' },
  { value: 'python_fullstack', label: 'Python Full Stack' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'mern_stack', label: 'MERN Stack' },
  { value: 'digital_marketing', label: 'Digital Marketing' },
  { value: 'ui_ux_design', label: 'UI/UX Design' }
];

export default function EmployeeDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, matches: 0, mismatches: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      referenceId: '',
      studentName: '',
      courseName: '',
      paymentAmount: '',
      joiningDate: '',
      remarks: ''
    }
  });

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions');
      const data = res.data.data.submissions || [];
      setSubmissions(data);

      // Calculate stats locally from submissions (or endpoint if available)
      let matches = 0;
      let mismatches = 0;
      
      // We also query verification results to show status
      const verificationsRes = await api.get('/verification');
      const verifications = verificationsRes.data.data.results || [];
      const verMap = new Map(verifications.map((v) => [v.reference_id, v.match_status]));

      data.forEach((sub) => {
        const status = verMap.get(sub.reference_id);
        if (status === 'MATCH') matches++;
        if (status === 'MISMATCH') mismatches++;
      });

      setStats({
        total: data.length,
        matches,
        mismatches
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to load employee submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        reference_id: data.referenceId,
        student_name: data.studentName,
        course_name: data.courseName,
        payment_amount: parseFloat(data.paymentAmount),
        joining_date: data.joiningDate,
        remarks: data.remarks
      };

      const res = await api.post('/submissions', payload);

      if (res.data.success) {
        toast.success('Submission saved and verified successfully!');
        setVerificationResult(res.data.data.verificationResult);
        setShowResultModal(true);
        reset();
        fetchEmployeeData();
      } else {
        toast.error(res.data.message || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error occurred while submitting verification details.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
          <Skeleton variant="card" className="h-32" />
        </div>
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight">
          Employee Verification Portal
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Perform immediate cross-verification of student registrations to eliminate enrollments fraud.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatsCard
          title="My Submissions"
          value={stats.total}
          icon={HiClipboardDocumentList}
          color="indigo"
          description="Total submissions entered"
        />
        <StatsCard
          title="Matching Entries"
          value={stats.matches}
          icon={HiCheckBadge}
          color="emerald"
          description="Perfect matches with student details"
        />
        <StatsCard
          title="Mismatched Entries"
          value={stats.mismatches}
          icon={HiExclamationTriangle}
          color="rose"
          description="Submissions with details mismatched"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Verification Form */}
        <Card title="New Verification Form" subtitle="Enter student transaction details" className="p-5 lg:col-span-1 border border-gray-100 bg-white shadow-md rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Reference ID */}
            <div>
              <label htmlFor="emp-ref-id" className="form-label text-xs font-bold uppercase text-gray-500">
                Reference ID <span className="text-red-500">*</span>
              </label>
              <input
                id="emp-ref-id"
                type="text"
                placeholder="e.g. JNV-2026-0001"
                className={`form-input mt-1 ${errors.referenceId ? 'border-red-300' : ''}`}
                {...register('referenceId', {
                  required: 'Reference ID is required',
                  pattern: {
                    value: /^JNV-\d{4}-\d{4}$/,
                    message: 'Format must be JNV-YYYY-NNNN'
                  }
                })}
              />
              {errors.referenceId && <p className="form-error text-xs mt-1 text-red-500">{errors.referenceId.message}</p>}
            </div>

            {/* Student Name */}
            <div>
              <label htmlFor="emp-student-name" className="form-label text-xs font-bold uppercase text-gray-500">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                id="emp-student-name"
                type="text"
                placeholder="Full student name"
                className={`form-input mt-1 ${errors.studentName ? 'border-red-300' : ''}`}
                {...register('studentName', { required: 'Student name is required' })}
              />
              {errors.studentName && <p className="form-error text-xs mt-1 text-red-500">{errors.studentName.message}</p>}
            </div>

            {/* Course Name */}
            <div>
              <label htmlFor="emp-course" className="form-label text-xs font-bold uppercase text-gray-500">
                Course Name <span className="text-red-500">*</span>
              </label>
              <select
                id="emp-course"
                className={`form-input mt-1 ${errors.courseName ? 'border-red-300' : ''}`}
                {...register('courseName', { required: 'Course name is required' })}
              >
                <option value="">Select Course</option>
                {COURSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.courseName && <p className="form-error text-xs mt-1 text-red-500">{errors.courseName.message}</p>}
            </div>

            {/* Payment Amount */}
            <div>
              <label htmlFor="emp-payment" className="form-label text-xs font-bold uppercase text-gray-500">
                Payment Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="emp-payment"
                type="number"
                placeholder="Enter paid fees"
                className={`form-input mt-1 ${errors.paymentAmount ? 'border-red-300' : ''}`}
                {...register('paymentAmount', {
                  required: 'Payment amount is required',
                  min: { value: 0, message: 'Must be positive value' }
                })}
              />
              {errors.paymentAmount && <p className="form-error text-xs mt-1 text-red-500">{errors.paymentAmount.message}</p>}
            </div>

            {/* Joining Date */}
            <div>
              <label htmlFor="emp-joining" className="form-label text-xs font-bold uppercase text-gray-500">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                id="emp-joining"
                type="date"
                className={`form-input mt-1 ${errors.joiningDate ? 'border-red-300' : ''}`}
                {...register('joiningDate', { required: 'Joining date is required' })}
              />
              {errors.joiningDate && <p className="form-error text-xs mt-1 text-red-500">{errors.joiningDate.message}</p>}
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="emp-remarks" className="form-label text-xs font-bold uppercase text-gray-500">
                Remarks
              </label>
              <textarea
                id="emp-remarks"
                placeholder="Any special remarks..."
                className="form-input mt-1 h-20 resize-none"
                {...register('remarks')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-primary-950 to-primary-800 hover:from-primary-900"
            >
              <HiDocumentPlus className="w-5 h-5" />
              Verify & Lock Submission
            </Button>
          </form>
        </Card>

        {/* Previous Submissions */}
        <Card title="My Verification Records" subtitle="Previous entries submitted by you" className="p-5 lg:col-span-2 border border-gray-100 bg-white shadow-md rounded-2xl">
          <Table
            headers={['Ref ID', 'Name', 'Course', 'Paid Amount', 'Submitted At']}
            rows={submissions.map((sub) => [
              <span className="font-mono text-xs font-bold text-gray-800" key={sub.id}>{sub.reference_id}</span>,
              <span className="font-semibold text-gray-800" key={sub.id}>{sub.student_name}</span>,
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded" key={sub.id}>{sub.course_name}</span>,
              <span className="font-bold text-gray-800" key={sub.id}>{formatCurrency(sub.payment_amount)}</span>,
              <span className="text-xs text-gray-400" key={sub.id}>{new Date(sub.created_at).toLocaleDateString()}</span>
            ])}
          />
        </Card>
      </div>

      {/* Result Verification Modal */}
      {showResultModal && verificationResult && (
        <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title="Instant Verification Result"
          size="md"
        >
          <div className="space-y-6">
            <div className="text-center">
              {verificationResult.match_status === 'MATCH' ? (
                <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                  <HiCheckCircle className="w-10 h-10" />
                </div>
              ) : (
                <div className="mx-auto w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
                  <HiXCircle className="w-10 h-10" />
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">
                Verification: {verificationResult.match_status}
              </h3>
              <p className="text-xs text-gray-400 font-mono mt-1">
                Ref ID: {verificationResult.reference_id}
              </p>
            </div>

            {/* Field level comparisons */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Field Breakdown
              </h4>

              {Object.entries(verificationResult.field_details).map(([field, details]) => (
                <div key={field} className="flex items-center justify-between py-1.5 border-b border-gray-200/50 last:border-0">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 capitalize">
                      {field.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mt-0.5">
                      <span className="text-gray-400 font-normal">Student:</span> {String(details.student_value)}
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400 font-normal">Employee:</span> {String(details.employee_value)}
                    </div>
                  </div>
                  {details.match ? (
                    <span className="text-emerald-500 text-sm">✅</span>
                  ) : (
                    <span className="text-rose-500 text-sm">❌</span>
                  )}
                </div>
              ))}
            </div>

            {/* Warning block for mismatch */}
            {verificationResult.match_status === 'MISMATCH' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <HiExclamationTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Flagged for Audit</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    This mismatch will automatically generate a fraud alert. Difference Amount:{' '}
                    <strong>{formatCurrency(verificationResult.difference_amount)}</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button variant="primary" onClick={() => setShowResultModal(false)}>
                Acknowledge & Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
