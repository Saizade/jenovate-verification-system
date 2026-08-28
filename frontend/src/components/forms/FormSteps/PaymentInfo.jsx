import { useEffect } from 'react';
import { HiCurrencyRupee, HiCalendarDays, HiTag } from 'react-icons/hi2';

export default function PaymentInfo({ register, errors, watch, setValue }) {
  const programPrice = watch('programPrice') || 0;
  const amountReceived = watch('amountReceived') || 0;

  useEffect(() => {
    const price = parseFloat(programPrice) || 0;
    const received = parseFloat(amountReceived) || 0;
    const pending = Math.max(0, price - received);
    setValue('pendingAmount', pending, { shouldValidate: true });
  }, [programPrice, amountReceived, setValue]);

  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2 pb-3 border-b border-surface-200">
        <h3 className="text-xl font-heading font-extrabold text-ocean-950 tracking-tight">
          Course Status & Payment Details
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Provide month opted, course type, and financial payment amounts. All fields are compulsory.
        </p>
      </div>

      {/* Month Opted & Type of Course */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-month-opted" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Month Opted <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCalendarDays className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-month-opted"
              type="text"
              placeholder="e.g. July, August, September, October"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.monthOpted ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('monthOpted', {
                required: 'Month opted is required'
              })}
            />
          </div>
          {errors.monthOpted && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.monthOpted.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-type-of-course" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Type of Course <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiTag className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-type-of-course"
              type="text"
              placeholder="e.g. Course yet to start, Course ongoing"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.typeOfCourse ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('typeOfCourse', {
                required: 'Type of course is required'
              })}
            />
          </div>
          {errors.typeOfCourse && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.typeOfCourse.message}
            </p>
          )}
        </div>
      </div>

      {/* Program Price, Amount Received, Pending Amount */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label htmlFor="reg-program-price" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Program Price (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCurrencyRupee className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <input
              id="reg-program-price"
              type="number"
              min="0"
              placeholder="e.g. 5000"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.programPrice ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('programPrice', {
                required: 'Program price is required',
                min: { value: 0, message: 'Price cannot be negative' }
              })}
            />
          </div>
          {errors.programPrice && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.programPrice.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-amount-received" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Amount Received (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCurrencyRupee className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <input
              id="reg-amount-received"
              type="number"
              min="0"
              placeholder="e.g. 5000"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.amountReceived ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('amountReceived', {
                required: 'Amount received is required',
                min: { value: 0, message: 'Amount cannot be negative' }
              })}
            />
          </div>
          {errors.amountReceived && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.amountReceived.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-pending-amount" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Pending Amount (₹) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiCurrencyRupee className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <input
              id="reg-pending-amount"
              type="number"
              min="0"
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm font-bold text-amber-700 cursor-not-allowed"
              {...register('pendingAmount', {
                required: 'Pending amount calculation is required'
              })}
              readOnly
            />
          </div>
          {errors.pendingAmount && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.pendingAmount.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
