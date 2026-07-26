import { useEffect } from 'react';
import { HiCurrencyRupee, HiCreditCard, HiHashtag } from 'react-icons/hi2';

const courseFees = {
  java_fullstack: 65000,
  python_fullstack: 60000,
  data_science: 75000,
  mern_stack: 60000,
  digital_marketing: 45000,
  ui_ux_design: 50000,
};

const courseLabels = {
  java_fullstack: 'Java Full Stack',
  python_fullstack: 'Python Full Stack',
  data_science: 'Data Science',
  mern_stack: 'MERN Stack',
  digital_marketing: 'Digital Marketing',
  ui_ux_design: 'UI/UX Design',
};

const paymentModes = [
  { value: 'online', label: 'Online / UPI', icon: '💳' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'cheque', label: 'Cheque', icon: '📄' },
];

export default function PaymentInfo({ register, errors, watch, setValue }) {
  const selectedCourse = watch('course');
  const paymentMode = watch('paymentMode');
  const totalFees = courseFees[selectedCourse] || 0;

  useEffect(() => {
    if (selectedCourse && courseFees[selectedCourse]) {
      setValue('totalFees', courseFees[selectedCourse]);
    }
  }, [selectedCourse, setValue]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Payment Information</h3>
        <p className="text-sm text-gray-500 mt-1">Provide details about your fee payment.</p>
      </div>

      {/* Fee Summary Card */}
      <div className="p-5 bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl border border-primary-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Selected Course</p>
            <p className="text-base font-semibold text-gray-800 mt-0.5">
              {courseLabels[selectedCourse] || 'No course selected'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Total Fees</p>
            <p className="text-2xl font-bold text-primary-700 mt-0.5">
              {totalFees > 0 ? formatCurrency(totalFees) : '—'}
            </p>
          </div>
        </div>
        <input type="hidden" {...register('totalFees')} />
      </div>

      {/* Amount Paid */}
      <div>
        <label htmlFor="reg-amount-paid" className="form-label">
          Amount Paid <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiCurrencyRupee className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-amount-paid"
            type="number"
            min="0"
            placeholder="Enter amount paid"
            className={`form-input pl-10 ${errors.amountPaid ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('amountPaid', {
              required: 'Amount paid is required',
              min: { value: 1, message: 'Amount must be greater than 0' },
              max: { value: totalFees || 999999, message: `Amount cannot exceed ${formatCurrency(totalFees)}` },
              validate: (value) => {
                if (isNaN(value)) return 'Please enter a valid amount';
                return true;
              },
            })}
          />
        </div>
        {errors.amountPaid && <p className="form-error">{errors.amountPaid.message}</p>}
      </div>

      {/* Payment Mode */}
      <div>
        <label className="form-label">
          <HiCreditCard className="inline-block w-4 h-4 mr-1 -mt-0.5 text-primary-500" />
          Payment Mode <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {paymentModes.map((mode) => (
            <label
              key={mode.value}
              htmlFor={`reg-payment-${mode.value}`}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                paymentMode === mode.value
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                id={`reg-payment-${mode.value}`}
                type="radio"
                value={mode.value}
                className="sr-only"
                {...register('paymentMode', { required: 'Please select a payment mode' })}
              />
              <span className="text-2xl">{mode.icon}</span>
              <span className={`text-xs font-medium text-center ${
                paymentMode === mode.value ? 'text-primary-700' : 'text-gray-600'
              }`}>
                {mode.label}
              </span>
            </label>
          ))}
        </div>
        {errors.paymentMode && <p className="form-error">{errors.paymentMode.message}</p>}
      </div>

      {/* Transaction ID */}
      <div>
        <label htmlFor="reg-transaction-id" className="form-label">
          Transaction / Receipt ID {paymentMode !== 'cash' && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiHashtag className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-transaction-id"
            type="text"
            placeholder="Enter transaction or receipt ID"
            className={`form-input pl-10 ${errors.transactionId ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('transactionId', {
              required: paymentMode !== 'cash' ? 'Transaction ID is required' : false,
              minLength: { value: 4, message: 'Must be at least 4 characters' },
            })}
          />
        </div>
        {errors.transactionId && <p className="form-error">{errors.transactionId.message}</p>}
        {paymentMode === 'cash' && (
          <p className="text-xs text-amber-600 mt-1.5">
            💡 For cash payments, you can enter the receipt number issued at the counter.
          </p>
        )}
      </div>
    </div>
  );
}
