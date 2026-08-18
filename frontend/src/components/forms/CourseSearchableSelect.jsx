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

  const datalistId = `${id}-datalist`;

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
  const filteredCourses = COURSE_LIST.filter((course) =>
    course.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const handleSelect = (courseName) => {
    setSearchQuery(courseName);
    onChange(courseName);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSearchQuery('');
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
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
          list={datalistId}
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
          className={`form-input pr-14 bg-white text-sm transition-all shadow-sm ${
            error ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : 'border-gray-300 focus:border-primary-500'
          }`}
        />

        {/* HTML5 Datalist Fallback */}
        <datalist id={datalistId}>
          {COURSE_LIST.map((course) => (
            <option key={course} value={course} />
          ))}
        </datalist>

        {/* Action icons (Clear & Dropdown arrow) */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
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

      {/* Interactive Dropdown Menu overlay */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl shadow-xl border border-gray-200 max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-2 duration-150 scrollbar-thin">
          <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/90 border-b border-gray-100 flex justify-between items-center sticky top-0 backdrop-blur-sm z-10">
            <span>Course Options ({filteredCourses.length})</span>
            <span className="text-[10px] text-primary-600 font-normal">Click or search</span>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-500 text-center italic">
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
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-primary-50/80 hover:text-primary-950 transition-colors ${
                    isSelected ? 'bg-primary-50 font-bold text-primary-950' : 'text-gray-700 font-medium'
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
