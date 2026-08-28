import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import api from '../services/api';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import StatsCard from '../components/ui/StatsCard';
import CourseSearchableSelect from '../components/forms/CourseSearchableSelect';

import {
  HiDocumentPlus, HiClipboardDocumentList, HiBookOpen, HiHashtag, HiCreditCard, HiTag
} from 'react-icons/hi2';

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
      date: new Date().toISOString().split('T')[0],
      studentName: '',
      referenceId: '',
      whatsappNo: '',
      email: '',
      numCoursesSelected: '1',
      primaryCourse: '',
      secondaryCourse: '',
      tertiaryCourse: '',
      paymentMode: '',
      revenueChannel: '',
      feesPaid: '',
      programPrice: '',
      pendingAmount: '',
      remarks: ''
    }
  });

  const numCoursesSelected = parseInt(watch('numCoursesSelected') || '1', 10);
  const primaryCourse = watch('primaryCourse') || '';
  const secondaryCourse = watch('secondaryCourse') || '';
  const tertiaryCourse = watch('tertiaryCourse') || '';
  const watchProgramPrice = watch('programPrice');
  const watchFeesPaid = watch('feesPaid');

  // Auto-calculate pending amount
  useEffect(() => {
    const price = parseFloat(watchProgramPrice) || 0;
    const paid = parseFloat(watchFeesPaid) || 0;
    if (price > 0) {
      const pending = Math.max(0, price - paid);
      setValue('pendingAmount', pending.toString());
    }
  }, [watchProgramPrice, watchFeesPaid, setValue]);

  // Clean unselected course fields when numCoursesSelected decreases
  useEffect(() => {
    if (numCoursesSelected < 2) {
      setValue('secondaryCourse', '');
    }
    if (numCoursesSelected < 3) {
      setValue('tertiaryCourse', '');
    }
  }, [numCoursesSelected, setValue]);

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
      const num = parseInt(data.numCoursesSelected || '1', 10);
      const courses = [data.primaryCourse, data.secondaryCourse, data.tertiaryCourse].slice(0, num).filter(Boolean);
      const courseOptedCombined = courses.join(', ');

      const payload = {
        date: data.date,
        reference_id: data.referenceId,
        student_name: data.studentName,
        whatsapp_no: data.whatsappNo,
        email: data.email,
        num_courses_selected: num,
        primary_course: data.primaryCourse || null,
        secondary_course: num >= 2 ? data.secondaryCourse : null,
        tertiary_course: num >= 3 ? data.tertiaryCourse : null,
        course_opted: courseOptedCombined,
        payment_mode: data.paymentMode || null,
        revenue_channel: data.revenueChannel || null,
        fees_paid: parseFloat(data.feesPaid),
        program_price: data.programPrice ? parseFloat(data.programPrice) : null,
        pending_amount: data.pendingAmount ? parseFloat(data.pendingAmount) : null,
        remarks: data.remarks
      };

      const res = await api.post('/submissions', payload);

      if (res.data.success) {
        toast.success('Submission saved and locked successfully!');
        reset({
          date: new Date().toISOString().split('T')[0],
          studentName: '',
          referenceId: '',
          whatsappNo: '',
          email: '',
          numCoursesSelected: '1',
          primaryCourse: '',
          secondaryCourse: '',
          tertiaryCourse: '',
          paymentMode: '',
          revenueChannel: '',
          feesPaid: '',
          programPrice: '',
          pendingAmount: '',
          remarks: ''
        });
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
    if (!val && val !== 0) return '—';
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
        <h1 className="text-2xl font-heading font-extrabold text-ocean-950 tracking-tight">
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
          color="primary"
          description="Total submissions entered"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Verification Form */}
        <Card title="New Verification Form" subtitle="Enter student transaction details" className="p-5 lg:col-span-1 border border-surface-200 bg-white shadow-card rounded-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Date */}
            <div>
              <label htmlFor="emp-date" className="form-label text-xs font-semibold uppercase text-gray-500">
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
              <label htmlFor="emp-student-name" className="form-label text-xs font-semibold uppercase text-gray-500">
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
              <label htmlFor="emp-ref-id" className="form-label text-xs font-semibold uppercase text-gray-500">
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

            {/* WhatsApp No & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="emp-whatsapp" className="form-label text-xs font-semibold uppercase text-gray-500">
                  WhatsApp No. (10 Digits)
                </label>
                <input
                  id="emp-whatsapp"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit number"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  }}
                  className={`form-input mt-1 ${errors.whatsappNo ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : ''}`}
                  {...register('whatsappNo', {
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Must be exactly 10 digits'
                    }
                  })}
                />
                {errors.whatsappNo && <p className="form-error text-xs mt-1 text-red-500">{errors.whatsappNo.message}</p>}
              </div>
              <div>
                <label htmlFor="emp-email" className="form-label text-xs font-semibold uppercase text-gray-500">
                  Email
                </label>
                <input
                  id="emp-email"
                  type="email"
                  placeholder="student@email.com"
                  className="form-input mt-1"
                  {...register('email')}
                />
              </div>
            </div>

            {/* Number of Courses Selected (1 to 3) */}
            <div>
              <label htmlFor="emp-num-courses" className="form-label text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
                <HiHashtag className="w-4 h-4 text-ocean-600" />
                No. of Courses Selected <span className="text-red-500">*</span>
              </label>
              <select
                id="emp-num-courses"
                className="form-select mt-1 border-ocean-300 font-semibold text-ocean-950 bg-ocean-50/40"
                {...register('numCoursesSelected', { required: 'Please select number of courses' })}
              >
                <option value="1">1 Course</option>
                <option value="2">2 Courses</option>
                <option value="3">3 Courses</option>
              </select>
            </div>

            {/* Dynamic Course Name Input Boxes */}
            <div className="p-3.5 bg-surface-50 border border-surface-200 rounded-xl space-y-3">
              <label className="text-xs font-bold text-ocean-950 flex items-center gap-1.5 uppercase tracking-wider">
                <HiBookOpen className="w-4 h-4 text-ocean-600" />
                Course Names ({numCoursesSelected} selected)
              </label>

              {/* Course 1 */}
              <div>
                <CourseSearchableSelect
                  id="emp-primary-course"
                  label="Course 1 Name"
                  required
                  value={primaryCourse}
                  onChange={(val) => setValue('primaryCourse', val, { shouldValidate: true })}
                  error={errors.primaryCourse?.message}
                  placeholder="Search or select Course 1..."
                  registerProps={register('primaryCourse', { required: 'Course 1 is required' })}
                />
              </div>

              {/* Course 2 (Pops up if numCoursesSelected >= 2) */}
              {numCoursesSelected >= 2 && (
                <div className="animate-fade-in">
                  <CourseSearchableSelect
                    id="emp-secondary-course"
                    label="Course 2 Name"
                    required
                    value={secondaryCourse}
                    onChange={(val) => setValue('secondaryCourse', val, { shouldValidate: true })}
                    error={errors.secondaryCourse?.message}
                    placeholder="Search or select Course 2..."
                    registerProps={register('secondaryCourse', { required: numCoursesSelected >= 2 ? 'Course 2 is required' : false })}
                  />
                </div>
              )}

              {/* Course 3 (Pops up if numCoursesSelected >= 3) */}
              {numCoursesSelected >= 3 && (
                <div className="animate-fade-in">
                  <CourseSearchableSelect
                    id="emp-tertiary-course"
                    label="Course 3 Name"
                    required
                    value={tertiaryCourse}
                    onChange={(val) => setValue('tertiaryCourse', val, { shouldValidate: true })}
                    error={errors.tertiaryCourse?.message}
                    placeholder="Search or select Course 3..."
                    registerProps={register('tertiaryCourse', { required: numCoursesSelected >= 3 ? 'Course 3 is required' : false })}
                  />
                </div>
              )}
            </div>

            {/* Payment Mode & Revenue Channel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="emp-payment-mode" className="form-label text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
                  <HiCreditCard className="w-4 h-4 text-emerald-600" />
                  Payment Mode
                </label>
                <input
                  id="emp-payment-mode"
                  type="text"
                  placeholder="Razorpay, QR, Bank"
                  className="form-input mt-1"
                  {...register('paymentMode')}
                />
              </div>
              <div>
                <label htmlFor="emp-revenue-channel" className="form-label text-xs font-semibold uppercase text-gray-500 flex items-center gap-1">
                  <HiTag className="w-4 h-4 text-emerald-600" />
                  Revenue Channel
                </label>
                <input
                  id="emp-revenue-channel"
                  type="text"
                  placeholder="Call & Convert, Personal"
                  className="form-input mt-1"
                  {...register('revenueChannel')}
                />
              </div>
            </div>

            {/* Fees Paid & Program Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="emp-fees" className="form-label text-xs font-semibold uppercase text-gray-500">
                  Fees Paid (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  id="emp-fees"
                  type="number"
                  placeholder="Fees paid"
                  className={`form-input mt-1 ${errors.feesPaid ? 'border-red-300' : ''}`}
                  {...register('feesPaid', {
                    required: 'Fees paid is required',
                    min: { value: 0, message: 'Must be positive' }
                  })}
                />
                {errors.feesPaid && <p className="form-error text-xs mt-1 text-red-500">{errors.feesPaid.message}</p>}
              </div>

              <div>
                <label htmlFor="emp-program-price" className="form-label text-xs font-semibold uppercase text-gray-500">
                  Program Price (₹)
                </label>
                <input
                  id="emp-program-price"
                  type="number"
                  placeholder="Total price"
                  className="form-input mt-1"
                  {...register('programPrice')}
                />
              </div>
            </div>

            {/* Pending Amount */}
            <div>
              <label htmlFor="emp-pending" className="form-label text-xs font-semibold uppercase text-gray-500">
                Pending Amount (₹)
              </label>
              <input
                id="emp-pending"
                type="number"
                placeholder="Auto-calculated"
                className="form-input mt-1 bg-surface-50 font-semibold"
                {...register('pendingAmount')}
              />
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="emp-remarks" className="form-label text-xs font-semibold uppercase text-gray-500">
                Remarks
              </label>
              <textarea
                id="emp-remarks"
                placeholder="Any special remarks..."
                className="form-input mt-1 h-16 resize-none"
                {...register('remarks')}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              <HiDocumentPlus className="w-5 h-5" />
              Submit Details
            </Button>
          </form>
        </Card>

        {/* Previous Submissions Table */}
        <Card title="My Verification Records" subtitle="Previous entries submitted by you" className="p-5 lg:col-span-2 border border-surface-200 bg-white shadow-card rounded-2xl">
          <Table
            headers={['Date', 'Ref ID', 'Name', 'Course Opted', 'Payment Mode', 'Revenue Channel', 'Fees Paid', 'Pending', 'Submitted At']}
            rows={submissions.map((sub) => [
              <span className="text-xs text-gray-600" key={`date-${sub.id}`}>{sub.date || '—'}</span>,
              <span className="font-mono text-xs font-semibold text-ocean-950" key={`ref-${sub.id}`}>{sub.reference_id}</span>,
              <span className="font-semibold text-ocean-950" key={`name-${sub.id}`}>{sub.student_name}</span>,
              <span className="text-xs font-medium text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded" key={`course-${sub.id}`}>{sub.course_opted}</span>,
              <span className="text-xs font-semibold text-ocean-700 bg-ocean-50 px-2 py-0.5 rounded" key={`mode-${sub.id}`}>{sub.payment_mode || '—'}</span>,
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded" key={`channel-${sub.id}`}>{sub.revenue_channel || '—'}</span>,
              <span className="font-semibold text-ocean-950" key={`fees-${sub.id}`}>{formatCurrency(sub.fees_paid)}</span>,
              <span className="text-xs font-semibold text-amber-700" key={`pending-${sub.id}`}>{sub.pending_amount ? formatCurrency(sub.pending_amount) : '—'}</span>,
              <span className="text-xs text-gray-400" key={`at-${sub.id}`}>{new Date(sub.created_at).toLocaleDateString()}</span>
            ])}
          />
        </Card>
      </div>
    </div>
  );
}
