import { useEffect } from 'react';
import { HiAcademicCap, HiBuildingLibrary, HiBookOpen, HiHashtag } from 'react-icons/hi2';
import CourseSearchableSelect from '../CourseSearchableSelect';
import StateSearchableSelect from '../StateSearchableSelect';

export default function AcademicInfo({ register, errors, watch, setValue }) {
  const numCoursesSelected = parseInt(watch('numCoursesSelected') || '1', 10);
  const primaryCourse = watch('primaryCourse') || '';
  const secondaryCourse = watch('secondaryCourse') || '';
  const tertiaryCourse = watch('tertiaryCourse') || '';
  const stateVal = watch('state') || '';

  // Auto-sync typeOfPack and combined courseOpted
  useEffect(() => {
    const packNames = { 1: 'Single Course', 2: 'Dual Course', 3: 'Triple courses' };
    setValue('typeOfPack', packNames[numCoursesSelected] || 'Single Course');

    // Clean up unselected fields when course count drops
    if (numCoursesSelected < 2) {
      setValue('secondaryCourse', '');
    }
    if (numCoursesSelected < 3) {
      setValue('tertiaryCourse', '');
    }
  }, [numCoursesSelected, setValue]);

  // Keep courseOpted updated for backward compatibility
  useEffect(() => {
    const courses = [primaryCourse, secondaryCourse, tertiaryCourse].slice(0, numCoursesSelected).filter(Boolean);
    setValue('courseOpted', courses.join(', '));
  }, [primaryCourse, secondaryCourse, tertiaryCourse, numCoursesSelected, setValue]);

  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2 pb-3 border-b border-surface-200">
        <h3 className="text-xl font-heading font-extrabold text-ocean-950 tracking-tight">
          Institution & Academic Details
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Specify college, state, department, and course details. All fields are compulsory.
        </p>
      </div>

      {/* College Name and State */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-college-name" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            College Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiBuildingLibrary className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-college-name"
              type="text"
              placeholder="e.g. Vinayaka Mission University"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.collegeName ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('collegeName', {
                required: 'College name is required'
              })}
            />
          </div>
          {errors.collegeName && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.collegeName.message}
            </p>
          )}
        </div>

        <div>
          <StateSearchableSelect
            id="reg-state"
            label="State"
            required={true}
            value={stateVal}
            onChange={(val) => setValue('state', val, { shouldValidate: true })}
            error={errors.state?.message}
            placeholder="Select or type Indian state..."
            registerProps={register('state', {
              required: 'State selection is required'
            })}
          />
        </div>
      </div>

      {/* Department & Number of Courses Selected */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="reg-department" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Department <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiAcademicCap className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <input
              id="reg-department"
              type="text"
              placeholder="e.g. BDS, MBBS, Clinical Psychology, BBA"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm font-medium text-ocean-950 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 ${
                errors.department ? 'border-red-400 focus:ring-red-500/20 focus:border-red-500 bg-red-50/10' : 'border-surface-200 hover:border-ocean-300'
              }`}
              {...register('department', {
                required: 'Department is required'
              })}
            />
          </div>
          {errors.department && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
              {errors.department.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-num-courses" className="block text-xs font-semibold uppercase text-gray-600 mb-1.5 tracking-wider">
            Number of Courses Selected <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiHashtag className="w-4.5 h-4.5 text-ocean-600" />
            </div>
            <select
              id="reg-num-courses"
              className="w-full pl-10 pr-10 py-3 bg-ocean-50/40 border border-ocean-300 rounded-xl text-sm font-bold text-ocean-950 appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500"
              {...register('numCoursesSelected', { required: 'Please select number of courses' })}
            >
              <option value="1">1 Course</option>
              <option value="2">2 Courses</option>
              <option value="3">3 Courses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Course Input Boxes (Pop up according to selected number) */}
      <div className="p-5 bg-surface-50 rounded-2xl border border-surface-200 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-ocean-950 flex items-center gap-2">
            <HiBookOpen className="w-5 h-5 text-ocean-600" />
            Selected Course Name(s) ({numCoursesSelected} {numCoursesSelected === 1 ? 'course' : 'courses'})
          </label>
          <span className="text-xs font-semibold text-ocean-700 bg-ocean-100/60 px-2.5 py-0.5 rounded-full">
            {numCoursesSelected === 1 ? 'Single Pack' : numCoursesSelected === 2 ? 'Dual Pack' : 'Triple Pack'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Course 1 Box */}
          <div className="transition-all duration-300 animate-fade-in">
            <CourseSearchableSelect
              id="reg-primary-course"
              label="Course 1 Name"
              required
              value={primaryCourse}
              onChange={(val) => setValue('primaryCourse', val, { shouldValidate: true })}
              error={errors.primaryCourse?.message}
              placeholder="Search or select Course 1..."
              registerProps={register('primaryCourse', {
                required: 'Course 1 name is required'
              })}
            />
          </div>

          {/* Course 2 Box (Pops up if numCoursesSelected >= 2) */}
          {numCoursesSelected >= 2 && (
            <div className="transition-all duration-300 animate-fade-in">
              <CourseSearchableSelect
                id="reg-secondary-course"
                label="Course 2 Name"
                required
                value={secondaryCourse}
                onChange={(val) => setValue('secondaryCourse', val, { shouldValidate: true })}
                error={errors.secondaryCourse?.message}
                placeholder="Search or select Course 2..."
                registerProps={register('secondaryCourse', {
                  required: numCoursesSelected >= 2 ? 'Course 2 name is required' : false
                })}
              />
            </div>
          )}

          {/* Course 3 Box (Pops up if numCoursesSelected >= 3) */}
          {numCoursesSelected >= 3 && (
            <div className="transition-all duration-300 animate-fade-in">
              <CourseSearchableSelect
                id="reg-tertiary-course"
                label="Course 3 Name"
                required
                value={tertiaryCourse}
                onChange={(val) => setValue('tertiaryCourse', val, { shouldValidate: true })}
                error={errors.tertiaryCourse?.message}
                placeholder="Search or select Course 3..."
                registerProps={register('tertiaryCourse', {
                  required: numCoursesSelected >= 3 ? 'Course 3 name is required' : false
                })}
              />
            </div>
          )}
        </div>
      </div>

      {/* Hidden typeOfPack & courseOpted inputs registered to form */}
      <input type="hidden" {...register('typeOfPack')} />
      <input type="hidden" {...register('courseOpted')} />
    </div>
  );
}
