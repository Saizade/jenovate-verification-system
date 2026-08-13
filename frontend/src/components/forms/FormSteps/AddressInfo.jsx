import { HiMapPin, HiBuildingOffice2 } from 'react-icons/hi2';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function AddressInfo({ register, errors }) {
  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
        <p className="text-sm text-gray-500 mt-1">Enter your current residential address.</p>
      </div>

      {/* State & City */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* State Dropdown */}
        <div>
          <label htmlFor="reg-state" className="form-label">
            State <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiMapPin className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <select
              id="reg-state"
              className={`form-select pl-10 ${errors.state ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('state', { required: 'State is required' })}
            >
              <option value="">Select your state</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
          {errors.state && <p className="form-error">{errors.state.message}</p>}
        </div>

        {/* City */}
        <div>
          <label htmlFor="reg-city" className="form-label">
            City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiBuildingOffice2 className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-city"
              type="text"
              placeholder="Enter your city"
              className={`form-input pl-10 ${errors.city ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('city', {
                required: 'City is required',
                minLength: { value: 2, message: 'City must be at least 2 characters' },
              })}
            />
          </div>
          {errors.city && <p className="form-error">{errors.city.message}</p>}
        </div>
      </div>

      {/* Full Address */}
      <div>
        <label htmlFor="reg-address" className="form-label">
          Full Address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="reg-address"
          rows={3}
          placeholder="House no., Street name, Area, Landmark..."
          className={`form-input resize-none ${errors.address ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
          {...register('address', {
            required: 'Address is required',
            minLength: { value: 10, message: 'Please provide a complete address (min 10 characters)' },
            maxLength: { value: 500, message: 'Address too long (max 500 characters)' },
          })}
        />
        {errors.address && <p className="form-error">{errors.address.message}</p>}
      </div>

      {/* PIN Code */}
      <div className="max-w-xs">
        <label htmlFor="reg-pincode" className="form-label">
          PIN Code <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiMapPin className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-pincode"
            type="text"
            placeholder="6-digit PIN code"
            maxLength={6}
            className={`form-input pl-10 ${errors.pinCode ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('pinCode', {
              required: 'PIN code is required',
              pattern: {
                value: /^[1-9][0-9]{5}$/,
                message: 'Enter a valid 6-digit PIN code',
              },
            })}
          />
        </div>
        {errors.pinCode && <p className="form-error">{errors.pinCode.message}</p>}
      </div>
    </div>
  );
}
