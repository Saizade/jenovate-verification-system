import { HiUser, HiCalendarDays, HiDevicePhoneMobile, HiEnvelope, HiChatBubbleLeftRight } from 'react-icons/hi2';

export default function PersonalInfo({ register, errors }) {
  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2 pb-3 border-b border-surface-200">
        <h3 className="text-xl font-heading font-extrabold text-ocean-950 tracking-tight">
          General & Contact Details
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Please fill in all general registration and student contact details below. All fields are compulsory.
        </p>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="reg-date" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
          Date <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiCalendarDays className="w-4.5 h-4.5 text-ocean-600" />
          </div>
          <input
            id="reg-date"
            type="text"
            placeholder="e.g. 09.05.2025"
            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
              errors.date ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
            }`}
            {...register('date', {
              required: 'Registration date is required'
            })}
          />
        </div>
        {errors.date && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            {errors.date.message}
          </p>
        )}
      </div>

      {/* Counselor Name and Student Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-counselor-name" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Counselor Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiUser className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-counselor-name"
              type="text"
              placeholder="e.g. Jessica, Shan"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.counselorName ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('counselorName', {
                required: 'Counselor name is required'
              })}
            />
          </div>
          {errors.counselorName && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.counselorName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-full-name" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Student Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiUser className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-full-name"
              type="text"
              placeholder="Enter student full name"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.fullName ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('fullName', {
                required: 'Student name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.fullName.message}
            </p>
          )}
        </div>
      </div>

      {/* Phone No. and WhatsApp Number (Strictly 10 Digits) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-phone-no" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Phone No. (10 Digits) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiDevicePhoneMobile className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-phone-no"
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
              }}
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.phoneNo ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('phoneNo', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Phone number must be exactly 10 digits'
                }
              })}
            />
          </div>
          {errors.phoneNo && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.phoneNo.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-whatsapp-number" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            WhatsApp Number (10 Digits) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiDevicePhoneMobile className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <input
              id="reg-whatsapp-number"
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit WhatsApp number"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
              }}
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.whatsappNumber ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('whatsappNumber', {
                required: 'WhatsApp number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'WhatsApp number must be exactly 10 digits'
                }
              })}
            />
          </div>
          {errors.whatsappNumber && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.whatsappNumber.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
          E-mail Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiEnvelope className="w-4.5 h-4.5 text-ocean-600" />
          </div>
          <input
            id="reg-email"
            type="email"
            placeholder="student.email@example.com"
            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
              errors.email ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
            }`}
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Please enter a valid email address'
              }
            })}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Remarks 1 & Academic Remarks 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-remarks" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Remarks (Status) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiChatBubbleLeftRight className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-remarks"
              type="text"
              placeholder="e.g. Partial, Full, default, Refund"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.remarks ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('remarks', {
                required: 'Status remark is required'
              })}
            />
          </div>
          {errors.remarks && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.remarks.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-academic-remarks" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Remarks (Academic / Year) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiChatBubbleLeftRight className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-academic-remarks"
              type="text"
              placeholder="e.g. 1st year, 2nd year, Graduate"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.academicRemarks ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('academicRemarks', {
                required: 'Academic remark is required'
              })}
            />
          </div>
          {errors.academicRemarks && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.academicRemarks.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
