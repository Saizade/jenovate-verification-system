import { useEffect } from 'react';
import { HiCurrencyRupee, HiCreditCard, HiCalendarDays, HiTag } from 'react-icons/hi2';

export default function PaymentInfo({ register, errors, watch, setValue }) {
  const programPrice = watch('programPrice') || 0;
  const amountReceived = watch('amountReceived') || 0;

  useEffect(() => {
    const price = parseFloat(programPrice) || 0;
    const received = parseFloat(amountReceived) || 0;
    const pending = Math.max(0, price - received);
    setValue('pendingAmount', pending);
  }, [programPrice, amountReceived, setValue]);

  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Course Status & Payment Details</h3>
        <p className="text-sm text-gray-500 mt-1">Provide month opted, course type, financial amounts, and revenue channel.</p>
      </div>

      {/* Month Opted & Type of Course */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-month-opted" className="form-label">
            Month Opted
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCalendarDays className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-month-opted"
              type="text"
              placeholder="e.g. july, august, september, october"
              className="form-input pl-10"
              {...register('monthOpted')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-type-of-course" className="form-label">
            Type of Course
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiTag className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-type-of-course"
              type="text"
              placeholder="e.g. course yet to start, course ongoing"
              className="form-input pl-10"
              {...register('typeOfCourse')}
            />
          </div>
        </div>
      </div>

      {/* Program Price, Amount Received, Pending Amount */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label htmlFor="reg-program-price" className="form-label">
            Program Price (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCurrencyRupee className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-program-price"
              type="number"
              min="0"
              placeholder="e.g. 5000"
              className="form-input pl-10"
              {...register('programPrice')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-amount-received" className="form-label">
            Amount Received (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCurrencyRupee className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-amount-received"
              type="number"
              min="0"
              placeholder="e.g. 5000"
              className="form-input pl-10"
              {...register('amountReceived')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-pending-amount" className="form-label">
            Pending Amount (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCurrencyRupee className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-pending-amount"
              type="number"
              min="0"
              placeholder="0"
              className="form-input pl-10 bg-gray-50 font-semibold"
              {...register('pendingAmount')}
            />
          </div>
        </div>
      </div>

      {/* Payment Mode & Revenue Channel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-payment-mode" className="form-label">
            Payment Mode
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCreditCard className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-payment-mode"
              type="text"
              placeholder="e.g. razorpay, QR, Phonepe, Razorpay + QR"
              className="form-input pl-10"
              {...register('paymentMode')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-revenue-channel" className="form-label">
            Revenue Channel
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiTag className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-revenue-channel"
              type="text"
              placeholder="e.g. Call & Convert, Personal Sale, Refferal"
              className="form-input pl-10"
              {...register('revenueChannel')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
