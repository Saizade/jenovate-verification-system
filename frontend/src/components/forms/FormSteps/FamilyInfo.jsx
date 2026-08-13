import { HiUser, HiUsers, HiPhone } from 'react-icons/hi2';

export default function FamilyInfo({ register, errors }) {
  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Family Information</h3>
        <p className="text-sm text-gray-500 mt-1">Provide details about your family members.</p>
      </div>

      {/* Father & Mother Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-father-name" className="form-label">
            Father's Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiUser className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-father-name"
              type="text"
              placeholder="Father's full name"
              className={`form-input pl-10 ${errors.fatherName ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('fatherName', {
                required: "Father's name is required",
                minLength: { value: 3, message: 'Must be at least 3 characters' },
                pattern: { value: /^[a-zA-Z\s.]+$/, message: 'Only letters, spaces, and dots allowed' },
              })}
            />
          </div>
          {errors.fatherName && <p className="form-error">{errors.fatherName.message}</p>}
        </div>

        <div>
          <label htmlFor="reg-mother-name" className="form-label">
            Mother's Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiUser className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-mother-name"
              type="text"
              placeholder="Mother's full name"
              className={`form-input pl-10 ${errors.motherName ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('motherName', {
                required: "Mother's name is required",
                minLength: { value: 3, message: 'Must be at least 3 characters' },
                pattern: { value: /^[a-zA-Z\s.]+$/, message: 'Only letters, spaces, and dots allowed' },
              })}
            />
          </div>
          {errors.motherName && <p className="form-error">{errors.motherName.message}</p>}
        </div>
      </div>

      {/* Siblings Count */}
      <div>
        <label htmlFor="reg-siblings" className="form-label">
          Number of Siblings
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiUsers className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-siblings"
            type="number"
            min="0"
            max="15"
            placeholder="0"
            className={`form-input pl-10 ${errors.siblings ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('siblings', {
              min: { value: 0, message: 'Cannot be negative' },
              max: { value: 15, message: 'Please enter a valid number' },
            })}
          />
        </div>
        {errors.siblings && <p className="form-error">{errors.siblings.message}</p>}
      </div>

      {/* Guardian Info */}
      <div className="p-5 bg-gray-50 rounded-xl border border-gray-100 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <HiUsers className="w-4 h-4 text-primary-500" />
          Guardian Details
          <span className="text-xs font-normal text-gray-400">(if different from parents)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="reg-guardian-name" className="form-label">
              Guardian Name
            </label>
            <input
              id="reg-guardian-name"
              type="text"
              placeholder="Guardian's full name"
              className={`form-input ${errors.guardianName ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('guardianName', {
                minLength: { value: 3, message: 'Must be at least 3 characters' },
                pattern: { value: /^[a-zA-Z\s.]*$/, message: 'Only letters, spaces, and dots allowed' },
              })}
            />
            {errors.guardianName && <p className="form-error">{errors.guardianName.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-guardian-phone" className="form-label">
              Guardian Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <HiPhone className="w-4.5 h-4.5 text-gray-400" />
              </div>
              <input
                id="reg-guardian-phone"
                type="tel"
                placeholder="10-digit phone number"
                maxLength={10}
                className={`form-input pl-10 ${errors.guardianPhone ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
                {...register('guardianPhone', {
                  pattern: {
                    value: /^([6-9]\d{9})?$/,
                    message: 'Enter a valid 10-digit phone number',
                  },
                })}
              />
            </div>
            {errors.guardianPhone && <p className="form-error">{errors.guardianPhone.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
