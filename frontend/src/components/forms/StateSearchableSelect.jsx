import React, { useState } from 'react';
import { HiMapPin, HiPencilSquare, HiListBullet } from 'react-icons/hi2';
import { INDIAN_STATES } from '../../constants/indianStates';

const STATES_LIST = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const UT_LIST = [
  'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi (NCT)',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function StateSearchableSelect({
  id = 'reg-state',
  label = 'State',
  required = true,
  value = '',
  onChange,
  error,
  registerProps = {},
  placeholder = 'Select Indian State / UT...'
}) {
  const [isCustomMode, setIsCustomMode] = useState(false);

  // If initial value is not in our standard lists and is non-empty, default to custom mode
  React.useEffect(() => {
    if (value && !INDIAN_STATES.includes(value)) {
      setIsCustomMode(true);
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__CUSTOM__') {
      setIsCustomMode(true);
      if (onChange) onChange('');
    } else {
      if (onChange) onChange(val);
      if (registerProps && typeof registerProps.onChange === 'function') {
        registerProps.onChange(e);
      }
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    if (onChange) onChange(val);
    if (registerProps && typeof registerProps.onChange === 'function') {
      registerProps.onChange(e);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="block text-xs font-semibold uppercase text-gray-600 tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => {
            setIsCustomMode((prev) => !prev);
            if (onChange) onChange('');
          }}
          className="text-[11px] font-semibold text-ocean-600 hover:text-ocean-800 flex items-center gap-1 transition-colors"
          tabIndex={-1}
        >
          {isCustomMode ? (
            <>
              <HiListBullet className="w-3.5 h-3.5" /> Select from List
            </>
          ) : (
            <>
              <HiPencilSquare className="w-3.5 h-3.5" /> Type Custom State
            </>
          )}
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
          <HiMapPin className="w-4.5 h-4.5 text-ocean-600" />
        </div>

        {isCustomMode ? (
          <input
            {...registerProps}
            id={id}
            type="text"
            value={value || ''}
            onChange={handleTextChange}
            placeholder="Type custom state name..."
            className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
              error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
            }`}
          />
        ) : (
          <select
            {...registerProps}
            id={id}
            value={value || ''}
            onChange={handleSelectChange}
            className={`w-full pl-10 pr-10 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
              error ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%230e6ba8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.75rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.25em 1.25em'
            }}
          >
            <option value="">{placeholder}</option>
            <optgroup label="States (28)">
              {STATES_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </optgroup>
            <optgroup label="Union Territories (8)">
              {UT_LIST.map((ut) => (
                <option key={ut} value={ut}>
                  {ut}
                </option>
              ))}
            </optgroup>
            <option value="__CUSTOM__">✏️ Other / Type Custom State...</option>
          </select>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}
