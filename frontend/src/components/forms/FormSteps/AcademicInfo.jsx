import { HiAcademicCap, HiBuildingLibrary, HiBookOpen, HiCalendar } from 'react-icons/hi2';

const qualifications = [
  '10th / SSLC',
  '12th / PUC / HSC',
  'Diploma',
  'Bachelor\'s Degree (B.Sc / B.Com / BA)',
  'Bachelor\'s of Engineering (BE / B.Tech)',
  'BCA',
  'Master\'s Degree (M.Sc / M.Com / MA)',
  'Master\'s of Engineering (ME / M.Tech)',
  'MCA',
  'PhD',
  'Other',
];

const courses = [
  { value: 'java_fullstack', label: 'Java Full Stack', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'python_fullstack', label: 'Python Full Stack', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'data_science', label: 'Data Science', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'mern_stack', label: 'MERN Stack', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { value: 'digital_marketing', label: 'Digital Marketing', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'ui_ux_design', label: 'UI/UX Design', color: 'bg-pink-50 text-pink-700 border-pink-200' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function AcademicInfo({ register, errors, watch }) {
  const selectedCourse = watch('course');

  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Academic Information</h3>
        <p className="text-sm text-gray-500 mt-1">Tell us about your educational background.</p>
      </div>

      {/* Qualification */}
      <div>
        <label htmlFor="reg-qualification" className="form-label">
          Highest Qualification <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiAcademicCap className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <select
            id="reg-qualification"
            className={`form-select pl-10 ${errors.qualification ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('qualification', { required: 'Qualification is required' })}
          >
            <option value="">Select your qualification</option>
            {qualifications.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
        {errors.qualification && <p className="form-error">{errors.qualification.message}</p>}
      </div>

      {/* Previous Institution */}
      <div>
        <label htmlFor="reg-institution" className="form-label">
          Previous Institution <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiBuildingLibrary className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <input
            id="reg-institution"
            type="text"
            placeholder="Name of your last institution"
            className={`form-input pl-10 ${errors.previousInstitution ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('previousInstitution', {
              required: 'Institution name is required',
              minLength: { value: 3, message: 'Must be at least 3 characters' },
            })}
          />
        </div>
        {errors.previousInstitution && <p className="form-error">{errors.previousInstitution.message}</p>}
      </div>

      {/* Course Selection */}
      <div>
        <label className="form-label">
          <HiBookOpen className="inline-block w-4 h-4 mr-1 -mt-0.5 text-primary-500" />
          Select Course <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {courses.map((course) => (
            <label
              key={course.value}
              htmlFor={`reg-course-${course.value}`}
              className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                selectedCourse === course.value
                  ? 'border-primary-500 bg-primary-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                id={`reg-course-${course.value}`}
                type="radio"
                value={course.value}
                className="sr-only"
                {...register('course', { required: 'Please select a course' })}
              />
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${course.color}`}>
                {course.label}
              </span>
              {selectedCourse === course.value && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
        {errors.course && <p className="form-error">{errors.course.message}</p>}
      </div>

      {/* Year of Passing */}
      <div className="max-w-xs">
        <label htmlFor="reg-year-passing" className="form-label">
          Year of Passing <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiCalendar className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <select
            id="reg-year-passing"
            className={`form-select pl-10 ${errors.yearOfPassing ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
            {...register('yearOfPassing', { required: 'Year of passing is required' })}
          >
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {errors.yearOfPassing && <p className="form-error">{errors.yearOfPassing.message}</p>}
      </div>
    </div>
  );
}
