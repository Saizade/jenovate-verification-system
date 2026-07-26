import { HiUser, HiCalendarDays, HiDevicePhoneMobile, HiEnvelope } from 'react-icons/hi2';

const genderOptions = [
  { value: 'male', label: 'Male', emoji: '👨' },
  { value: 'female', label: 'Female', emoji: '👩' },
  { value: 'other', label: 'Other', emoji: '🧑' },
];

export default function PersonalInfo({ register, errors, watch }) {
  const selectedGender = watch('gender');

  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
        <p className="text-sm text-gray-500 mt-1">Please provide your basic personal details.</p>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="reg-full-name" className="form-label">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiUser className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-full-name"
            type="text"
            placeholder="Enter your full name"
            className={`form-input pl-10 ${errors.fullName ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 3, message: 'Name must be at least 3 characters' },
              pattern: { value: /^[a-zA-Z\s.]+$/, message: 'Only letters, spaces, and dots allowed' },
            })}
          />
        </div>
        {errors.fullName && <p className="form-error">{errors.fullName.message}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="reg-dob" className="form-label">
          Date of Birth <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiCalendarDays className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-dob"
            type="date"
            className={`form-input pl-10 ${errors.dateOfBirth ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('dateOfBirth', {
              required: 'Date of birth is required',
              validate: (value) => {
                const dob = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                if (age < 15) return 'You must be at least 15 years old';
                if (age > 60) return 'Please enter a valid date of birth';
                return true;
              },
            })}
          />
        </div>
        {errors.dateOfBirth && <p className="form-error">{errors.dateOfBirth.message}</p>}
      </div>

      {/* Gender - Radio Cards */}
      <div>
        <label className="form-label">
          Gender <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3 mt-1">
          {genderOptions.map((option) => (
            <label
              key={option.value}
              htmlFor={`reg-gender-${option.value}`}
              className={`relative flex flex-col items-center gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedGender === option.value
                  ? 'border-primary-500 bg-primary-50 shadow-sm shadow-primary-100'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                id={`reg-gender-${option.value}`}
                type="radio"
                value={option.value}
                className="sr-only"
                {...register('gender', { required: 'Please select your gender' })}
              />
              <span className="text-2xl">{option.emoji}</span>
              <span
                className={`text-sm font-medium ${
                  selectedGender === option.value ? 'text-primary-700' : 'text-gray-600'
                }`}
              >
                {option.label}
              </span>
              {selectedGender === option.value && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
        {errors.gender && <p className="form-error">{errors.gender.message}</p>}
      </div>

      {/* Mobile and Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mobile Number */}
        <div>
          <label htmlFor="reg-mobile" className="form-label">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiDevicePhoneMobile className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-mobile"
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`form-input pl-10 ${errors.mobile ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('mobile', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: 'Enter a valid 10-digit Indian mobile number',
                },
              })}
            />
          </div>
          {errors.mobile && <p className="form-error">{errors.mobile.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiEnvelope className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-email"
              type="email"
              placeholder="your.email@example.com"
              className={`form-input pl-10 ${errors.email ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
            />
          </div>
          {errors.email && <p className="form-error">{errors.email.message}</p>}
        </div>
      </div>
    </div>
  );
}
