import { HiUser, HiCalendarDays, HiDevicePhoneMobile, HiEnvelope, HiChatBubbleLeftRight } from 'react-icons/hi2';

export default function PersonalInfo({ register, errors }) {
  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">General & Contact Details</h3>
        <p className="text-sm text-gray-500 mt-1">Basic registration, counselor, and student contact details.</p>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="reg-date" className="form-label">
          Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiCalendarDays className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-date"
            type="text"
            placeholder="e.g. 09.05.2025"
            className="form-input pl-10"
            {...register('date')}
          />
        </div>
      </div>

      {/* Counselor Name and Student Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-counselor-name" className="form-label">
            Counselor Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiUser className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-counselor-name"
              type="text"
              placeholder="e.g. Jessica, Shan"
              className="form-input pl-10"
              {...register('counselorName')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-full-name" className="form-label">
            Student Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiUser className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-full-name"
              type="text"
              placeholder="Enter student full name"
              className={`form-input pl-10 ${errors.fullName ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('fullName', {
                required: 'Student name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
            />
          </div>
          {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
        </div>
      </div>

      {/* Phone No. and WhatsApp Number */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-phone-no" className="form-label">
            Phone No.
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiDevicePhoneMobile className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-phone-no"
              type="tel"
              placeholder="Phone number"
              className="form-input pl-10"
              {...register('phoneNo')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-whatsapp-number" className="form-label">
            WhatsApp Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiDevicePhoneMobile className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-whatsapp-number"
              type="tel"
              placeholder="WhatsApp number"
              className="form-input pl-10"
              {...register('whatsappNumber')}
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="reg-email" className="form-label">
          E-mail
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiEnvelope className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-email"
            type="email"
            placeholder="student.email@example.com"
            className="form-input pl-10"
            {...register('email')}
          />
        </div>
      </div>

      {/* Remarks 1 & Academic Remarks 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-remarks" className="form-label">
            Remarks (Status)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiChatBubbleLeftRight className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-remarks"
              type="text"
              placeholder="e.g. Partial, Full, default, Refund"
              className="form-input pl-10"
              {...register('remarks')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-academic-remarks" className="form-label">
            Remarks (Academic / Year)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiChatBubbleLeftRight className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-academic-remarks"
              type="text"
              placeholder="e.g. 1st year, 2nd year, Graduate, psy & clinical research"
              className="form-input pl-10"
              {...register('academicRemarks')}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
