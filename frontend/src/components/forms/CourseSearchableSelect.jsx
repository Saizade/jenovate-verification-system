import { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiXMark, HiCheck } from 'react-icons/hi2';
import { COURSE_LIST } from '../../constants/courses';

export default function CourseSearchableSelect({
  id,
  label,
  value = '',
  onChange,
  error,
  required = false,
  placeholder = 'Select or search course...',
  className = '',
  registerProps = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || '');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Synchronize internal state with external value
  useEffect(() => {
    setSearchQuery(value || '');
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter courses based on user input
  const isExactSelected = value && searchQuery === value;
  const filteredCourses = (searchQuery && !isExactSelected)
    ? COURSE_LIST.filter((course) => course.toLowerCase().includes(searchQuery.toLowerCase()))
    : COURSE_LIST;

  const handleSelect = (courseName) => {
    setSearchQuery(courseName);
    if (onChange) onChange(courseName);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onChange) onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchQuery('');
    if (onChange) onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${isOpen ? 'z-40' : 'z-10'} ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          {...registerProps}
          id={id}
          ref={(e) => {
            if (registerProps && typeof registerProps.ref === 'function') {
              registerProps.ref(e);
            }
            inputRef.current = e;
          }}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            handleInputChange(e);
            if (registerProps && typeof registerProps.onChange === 'function') {
              registerProps.onChange(e);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 pr-14 shadow-sm ${
            error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:border-primary-500'
          }`}
        />

        {/* Action icons (Clear & Dropdown arrow) */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1 z-10">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 transition-colors"
              title="Clear course selection"
            >
              <HiXMark className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            tabIndex={-1}
            title="Toggle course list"
          >
            <HiChevronDown className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary-600' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="form-error text-xs mt-1 text-red-500">{error}</p>}

      {/* Solid Opaque Interactive Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full bg-white rounded-xl shadow-2xl border border-gray-200 max-h-60 overflow-y-auto py-1 scrollbar-thin divide-y divide-gray-100">
          <div className="px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-surface-100 border-b border-gray-200 flex justify-between items-center sticky top-0 z-20">
            <span>Course Options ({filteredCourses.length})</span>
            <span className="text-[10px] text-primary-600 font-normal">Click or search</span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500 text-center italic bg-white">
              No matching courses found. You can still type custom course name.
            </div>
          ) : (
            filteredCourses.map((course) => {
              const isSelected = value === course;
              return (
                <button
                  key={course}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur before select
                    handleSelect(course);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors bg-white ${
                    isSelected ? 'bg-primary-50 font-bold text-primary-950' : 'text-gray-700 font-medium hover:bg-primary-50/80 hover:text-primary-950'
                  }`}
                >
                  <span className="truncate">{course}</span>
                  {isSelected && <HiCheck className="w-4 h-4 text-primary-600 flex-shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
