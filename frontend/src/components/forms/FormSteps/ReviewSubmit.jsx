import { HiUser, HiUsers, HiMapPin, HiAcademicCap, HiCurrencyRupee, HiDocumentText, HiCheckCircle, HiXCircle } from 'react-icons/hi2';

const courseLabels = {
  java_fullstack: 'Java Full Stack',
  python_fullstack: 'Python Full Stack',
  data_science: 'Data Science',
  mern_stack: 'MERN Stack',
  digital_marketing: 'Digital Marketing',
  ui_ux_design: 'UI/UX Design',
};

const paymentModeLabels = {
  online: 'Online / UPI',
  bank_transfer: 'Bank Transfer',
  cash: 'Cash',
  cheque: 'Cheque',
};

function ReviewSection({ icon: Icon, title, items, iconColor = 'text-primary-500' }) {
  return (
    <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <h4 className="font-semibold text-gray-800">{title}</h4>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
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
    if (!num) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const personalItems = [
    { label: 'Full Name', value: data.fullName },
    { label: 'Date of Birth', value: data.dateOfBirth },
    { label: 'Gender', value: data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : '' },
    { label: 'Mobile', value: data.mobile },
    { label: 'Email', value: data.email },
  ];

  const familyItems = [
    { label: "Father's Name", value: data.fatherName },
    { label: "Mother's Name", value: data.motherName },
    { label: 'Siblings', value: data.siblings?.toString() },
    { label: 'Guardian Name', value: data.guardianName },
    { label: 'Guardian Phone', value: data.guardianPhone },
  ];

  const addressItems = [
    { label: 'State', value: data.state },
    { label: 'City', value: data.city },
    { label: 'Address', value: data.address },
    { label: 'PIN Code', value: data.pinCode },
  ];

  const academicItems = [
    { label: 'Qualification', value: data.qualification },
    { label: 'Institution', value: data.previousInstitution },
    { label: 'Course', value: courseLabels[data.course] || data.course },
    { label: 'Year of Passing', value: data.yearOfPassing?.toString() },
  ];

  const paymentItems = [
    { label: 'Total Fees', value: formatCurrency(data.totalFees) },
    { label: 'Amount Paid', value: formatCurrency(data.amountPaid) },
    { label: 'Payment Mode', value: paymentModeLabels[data.paymentMode] || data.paymentMode },
    { label: 'Transaction ID', value: data.transactionId },
  ];

  const documents = [
    { label: 'Aadhaar Card', value: data.aadhaarDoc },
    { label: 'Passport Photo', value: data.photoDoc },
    { label: 'Payment Receipt', value: data.receiptDoc },
  ];

  return (
    <div className="space-y-5 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Review & Submit</h3>
        <p className="text-sm text-gray-500 mt-1">
          Please review all the information carefully before submitting your registration.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <span className="text-amber-500 text-lg mt-0.5">⚠️</span>
        <div>
          <p className="text-sm font-medium text-amber-800">Please verify all details</p>
          <p className="text-xs text-amber-600 mt-0.5">
            Once submitted, your registration will be sent for verification. Incorrect information may delay the process.
          </p>
        </div>
      </div>

      {/* Review Sections */}
      <ReviewSection icon={HiUser} title="Personal Information" items={personalItems} iconColor="text-blue-500" />
      <ReviewSection icon={HiUsers} title="Family Information" items={familyItems} iconColor="text-violet-500" />
      <ReviewSection icon={HiMapPin} title="Address Information" items={addressItems} iconColor="text-green-500" />
      <ReviewSection icon={HiAcademicCap} title="Academic Information" items={academicItems} iconColor="text-orange-500" />
      <ReviewSection icon={HiCurrencyRupee} title="Payment Information" items={paymentItems} iconColor="text-emerald-500" />

      {/* Documents */}
      <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-pink-500">
            <HiDocumentText className="w-4.5 h-4.5" />
          </div>
          <h4 className="font-semibold text-gray-800">Uploaded Documents</h4>
        </div>
        <div className="space-y-2">
          {documents.map(({ label, value }, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-700 font-medium">{label}</span>
              {value ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                  <HiCheckCircle className="w-4 h-4" />
                  {typeof value === 'object' && value.name ? value.name : 'Uploaded'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                  <HiXCircle className="w-4 h-4" />
                  Not uploaded
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
