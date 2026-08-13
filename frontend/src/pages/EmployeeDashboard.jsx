import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import StatsCard from '../components/ui/StatsCard';

import {
  HiDocumentPlus, HiClipboardDocumentList, HiCheckCircle
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
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      date: '',
      studentName: '',
      referenceId: '',
      whatsappNo: '',
      email: '',
      courseOpted: '',
      feesPaid: '',
      programPrice: '',
      pendingAmount: '',
      remarks: ''
    }
  });

  // Auto-calculate pending amount
  const watchProgramPrice = watch('programPrice');
  const watchFeesPaid = watch('feesPaid');

  useEffect(() => {
    const price = parseFloat(watchProgramPrice) || 0;
    const paid = parseFloat(watchFeesPaid) || 0;
    if (price > 0) {
      const pending = Math.max(0, price - paid);
      setValue('pendingAmount', pending.toString());
    }
  }, [watchProgramPrice, watchFeesPaid, setValue]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions');
      const data = res.data.data.submissions || [];
      setSubmissions(data);
      setTotalSubmissions(data.length);
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
        date: data.date,
        reference_id: data.referenceId,
        student_name: data.studentName,
        whatsapp_no: data.whatsappNo,
        email: data.email,
        course_opted: data.courseOpted,
        fees_paid: parseFloat(data.feesPaid),
        program_price: data.programPrice ? parseFloat(data.programPrice) : null,
        pending_amount: data.pendingAmount ? parseFloat(data.pendingAmount) : null,
        remarks: data.remarks
      };

      const res = await api.post('/submissions', payload);

      if (res.data.success) {
        toast.success('Submission saved and locked successfully!');
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
        <Skeleton variant="card" className="h-28" />
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
          Submit and manage student verification details seamlessly.
        </p>
      </div>

      {/* Stats row */}
      <div className="max-w-xs">
        <StatsCard
          title="My Submissions"
          value={totalSubmissions}
          icon={HiClipboardDocumentList}
          color="indigo"
          description="Total submissions entered"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Verification Form */}
        <Card title="New Verification Form" subtitle="Enter student transaction details" className="p-5 lg:col-span-1 border border-gray-100 bg-white shadow-md rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <div>
              <label htmlFor="emp-date" className="form-label text-xs font-bold uppercase text-gray-500">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="emp-date"
                type="date"
                className={`form-input mt-1 ${errors.date ? 'border-red-300' : ''}`}
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && <p className="form-error text-xs mt-1 text-red-500">{errors.date.message}</p>}
            </div>

            {/* Student Name */}
            <div>
              <label htmlFor="emp-student-name" className="form-label text-xs font-bold uppercase text-gray-500">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="emp-student-name"
                type="text"
                placeholder="Full student name"
                className={`form-input mt-1 ${errors.studentName ? 'border-red-300' : ''}`}
                {...register('studentName', { required: 'Name is required' })}
              />
              {errors.studentName && <p className="form-error text-xs mt-1 text-red-500">{errors.studentName.message}</p>}
            </div>

            {/* Reference ID */}
            <div>
              <label htmlFor="emp-ref-id" className="form-label text-xs font-bold uppercase text-gray-500">
                Ref ID <span className="text-red-500">*</span>
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

            {/* WhatsApp No */}
            <div>
              <label htmlFor="emp-whatsapp" className="form-label text-xs font-bold uppercase text-gray-500">
                WhatsApp No
              </label>
              <input
                id="emp-whatsapp"
                type="tel"
                placeholder="e.g. 9876543210"
                className={`form-input mt-1 ${errors.whatsappNo ? 'border-red-300' : ''}`}
                {...register('whatsappNo')}
              />
              {errors.whatsappNo && <p className="form-error text-xs mt-1 text-red-500">{errors.whatsappNo.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="emp-email" className="form-label text-xs font-bold uppercase text-gray-500">
                Email
              </label>
              <input
                id="emp-email"
                type="email"
                placeholder="student@example.com"
                className={`form-input mt-1 ${errors.email ? 'border-red-300' : ''}`}
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email format'
                  }
                })}
              />
              {errors.email && <p className="form-error text-xs mt-1 text-red-500">{errors.email.message}</p>}
            </div>

            {/* Course Opted */}
            <div>
              <label htmlFor="emp-course" className="form-label text-xs font-bold uppercase text-gray-500">
                Course Opt <span className="text-red-500">*</span>
              </label>
              <select
                id="emp-course"
                className={`form-input mt-1 ${errors.courseOpted ? 'border-red-300' : ''}`}
                {...register('courseOpted', { required: 'Course is required' })}
              >
                <option value="">Select Course</option>
                {COURSE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.label}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.courseOpted && <p className="form-error text-xs mt-1 text-red-500">{errors.courseOpted.message}</p>}
            </div>

            {/* Fees Paid */}
            <div>
              <label htmlFor="emp-fees" className="form-label text-xs font-bold uppercase text-gray-500">
                Fees Paid (₹) <span className="text-red-500">*</span>
              </label>
              <input
                id="emp-fees"
                type="number"
                placeholder="Enter fees paid"
                className={`form-input mt-1 ${errors.feesPaid ? 'border-red-300' : ''}`}
                {...register('feesPaid', {
                  required: 'Fees paid is required',
                  min: { value: 0, message: 'Must be a positive value' }
                })}
              />
              {errors.feesPaid && <p className="form-error text-xs mt-1 text-red-500">{errors.feesPaid.message}</p>}
            </div>

            {/* Program Price */}
            <div>
              <label htmlFor="emp-program-price" className="form-label text-xs font-bold uppercase text-gray-500">
                Program Price (₹)
              </label>
              <input
                id="emp-program-price"
                type="number"
                placeholder="Total program price"
                className={`form-input mt-1 ${errors.programPrice ? 'border-red-300' : ''}`}
                {...register('programPrice', {
                  min: { value: 0, message: 'Must be a positive value' }
                })}
              />
              {errors.programPrice && <p className="form-error text-xs mt-1 text-red-500">{errors.programPrice.message}</p>}
            </div>

            {/* Pending Amount */}
            <div>
              <label htmlFor="emp-pending" className="form-label text-xs font-bold uppercase text-gray-500">
                Pending Amount (₹)
              </label>
              <input
                id="emp-pending"
                type="number"
                placeholder="Auto-calculated"
                className="form-input mt-1 bg-gray-50"
                {...register('pendingAmount', {
                  min: { value: 0, message: 'Must be a positive value' }
                })}
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Auto-calculated from Program Price − Fees Paid</p>
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
              Submit Details
            </Button>
          </form>
        </Card>

        {/* Previous Submissions */}
        <Card title="My Verification Records" subtitle="Previous entries submitted by you" className="p-5 lg:col-span-2 border border-gray-100 bg-white shadow-md rounded-2xl">
          <Table
            headers={['Date', 'Ref ID', 'Name', 'Course Opt', 'Fees Paid', 'Pending', 'Submitted At']}
            rows={submissions.map((sub) => [
              <span className="text-xs text-gray-600" key={`date-${sub.id}`}>{sub.date || '—'}</span>,
              <span className="font-mono text-xs font-bold text-gray-800" key={`ref-${sub.id}`}>{sub.reference_id}</span>,
              <span className="font-semibold text-gray-800" key={`name-${sub.id}`}>{sub.student_name}</span>,
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded" key={`course-${sub.id}`}>{sub.course_opted}</span>,
              <span className="font-bold text-gray-800" key={`fees-${sub.id}`}>{formatCurrency(sub.fees_paid)}</span>,
              <span className="text-xs font-semibold text-amber-600" key={`pending-${sub.id}`}>{sub.pending_amount ? formatCurrency(sub.pending_amount) : '—'}</span>,
              <span className="text-xs text-gray-400" key={`at-${sub.id}`}>{new Date(sub.created_at).toLocaleDateString()}</span>
            ])}
          />
        </Card>
      </div>
    </div>
  );
}
