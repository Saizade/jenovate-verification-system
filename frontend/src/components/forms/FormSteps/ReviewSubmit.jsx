import { HiUser, HiAcademicCap, HiCurrencyRupee } from 'react-icons/hi2';

function ReviewSection({ icon: Icon, title, items, iconColor = 'text-primary-500' }) {
  return (
    <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        {items.map(({ label, value }, idx) => (
          <div key={idx}>
            <dt className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</dt>
            <dd className="text-sm text-gray-800 font-medium mt-0.5">
              {value || <span className="text-gray-300 italic">Not provided</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ReviewSubmit({ watch }) {
  const data = watch();

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '—';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const generalItems = [
    { label: 'Date', value: data.date },
    { label: 'Remarks (Status)', value: data.remarks },
    { label: 'Academic Remarks', value: data.academicRemarks },
    { label: 'Counselor Name', value: data.counselorName },
    { label: 'Student Name', value: data.fullName },
    { label: 'Phone No.', value: data.phoneNo },
    { label: 'WhatsApp Number', value: data.whatsappNumber },
    { label: 'E-mail', value: data.email },
  ];

  const academicItems = [
    { label: 'College Name', value: data.collegeName },
    { label: 'State', value: data.state },
    { label: 'Department', value: data.department },
    { label: 'No. of Courses Selected', value: `${data.numCoursesSelected || 1} (${data.typeOfPack || 'Single Course'})` },
    { label: 'Course 1 (Primary)', value: data.primaryCourse || data.courseOpted },
    ...(parseInt(data.numCoursesSelected) >= 2 ? [{ label: 'Course 2 (Secondary)', value: data.secondaryCourse }] : []),
    ...(parseInt(data.numCoursesSelected) >= 3 ? [{ label: 'Course 3 (Tertiary)', value: data.tertiaryCourse }] : []),
  ];

  const paymentItems = [
    { label: 'Month Opted', value: data.monthOpted },
    { label: 'Type of Course', value: data.typeOfCourse },
    { label: 'Program Price', value: formatCurrency(data.programPrice) },
    { label: 'Amount Received', value: formatCurrency(data.amountReceived) },
    { label: 'Pending Amount', value: formatCurrency(data.pendingAmount) },
  ];

  return (
    <div className="space-y-5 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Review & Submit</h3>
        <p className="text-sm text-gray-500 mt-1">
          Please review all details before completing student registration.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-medium text-amber-800">Please verify all student details</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Once submitted, your student registration will be locked and logged for verification.
          </p>
        </div>
      </div>

      {/* Review Sections */}
      <ReviewSection icon={HiUser} title="General & Contact Info" items={generalItems} iconColor="text-blue-500" />
      <ReviewSection icon={HiAcademicCap} title="Institution & Academic Info" items={academicItems} iconColor="text-orange-500" />
      <ReviewSection icon={HiCurrencyRupee} title="Payment & Revenue Details" items={paymentItems} iconColor="text-emerald-500" />
    </div>
  );
}
