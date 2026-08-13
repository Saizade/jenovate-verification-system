import { HiAcademicCap, HiBuildingLibrary, HiBookOpen, HiMapPin, HiRectangleStack } from 'react-icons/hi2';

export default function AcademicInfo({ register, errors }) {
  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Institution & Academic Details</h3>
        <p className="text-sm text-gray-500 mt-1">Specify college, state, department, courses, and pack details.</p>
      </div>

      {/* College Name and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-college-name" className="form-label">
            College Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiBuildingLibrary className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-college-name"
              type="text"
              placeholder="e.g. Vinayaka mission sankarachariyar dental college"
              className="form-input pl-10"
              {...register('collegeName')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-state" className="form-label">
            State
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiMapPin className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-state"
              type="text"
              placeholder="e.g. Tamil Nadu, Karnataka, Maharashtra"
              className="form-input pl-10"
              {...register('state')}
            />
          </div>
        </div>
      </div>

      {/* Department & Course Opted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-department" className="form-label">
            Department
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiAcademicCap className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-department"
              type="text"
              placeholder="e.g. BDS, MBBS, BSc. Clinical psychology, BBA"
              className="form-input pl-10"
              {...register('department')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-course-opted" className="form-label">
            Course Opted <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiBookOpen className="w-4.5 h-4.5 text-gray-400" />
            </div>
            <input
              id="reg-course-opted"
              type="text"
              placeholder="e.g. Psychology & Mental Health, FINANCE & STOCK MARKET"
              className={`form-input pl-10 ${errors.courseOpted ? 'border-red-300 focus:ring-red-200 focus:border-red-400' : ''}`}
              {...register('courseOpted', { required: 'Course opted is required' })}
            />
          </div>
          {errors.courseOpted && <p className="form-error">{errors.courseOpted.message}</p>}
        </div>
      </div>

      {/* Primary, Secondary, Tertiary Courses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label htmlFor="reg-primary-course" className="form-label">
            Primary Course
          </label>
          <input
            id="reg-primary-course"
            type="text"
            placeholder="e.g. psychology, finance & accounting"
            className="form-input"
            {...register('primaryCourse')}
          />
        </div>

        <div>
          <label htmlFor="reg-secondary-course" className="form-label">
            Secondary Course
          </label>
          <input
            id="reg-secondary-course"
            type="text"
            placeholder="e.g. nil, clinical research"
            className="form-input"
            {...register('secondaryCourse')}
          />
        </div>

        <div>
          <label htmlFor="reg-tertiary-course" className="form-label">
            Tertiary Course
          </label>
          <input
            id="reg-tertiary-course"
            type="text"
            placeholder="e.g. nil"
            className="form-input"
            {...register('tertiaryCourse')}
          />
        </div>
      </div>

      {/* Type of Pack */}
      <div>
        <label htmlFor="reg-type-of-pack" className="form-label">
          Type of Pack
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <HiRectangleStack className="w-4.5 h-4.5 text-gray-400" />
          </div>
          <select
            id="reg-type-of-pack"
            className="form-select pl-10"
            {...register('typeOfPack')}
          >
            <option value="">Select Pack Type</option>
            <option value="Single Course">Single Course</option>
            <option value="Dual Course">Dual Course</option>
            <option value="Triple courses">Triple courses</option>
          </select>
        </div>
      </div>
    </div>
  );
}
