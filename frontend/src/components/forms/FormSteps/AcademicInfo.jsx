import { useEffect } from 'react';
import { HiAcademicCap, HiBuildingLibrary, HiBookOpen, HiMapPin, HiHashtag } from 'react-icons/hi2';
import CourseSearchableSelect from '../CourseSearchableSelect';

export default function AcademicInfo({ register, errors, watch, setValue }) {
  const numCoursesSelected = parseInt(watch('numCoursesSelected') || '1', 10);
  const primaryCourse = watch('primaryCourse') || '';
  const secondaryCourse = watch('secondaryCourse') || '';
  const tertiaryCourse = watch('tertiaryCourse') || '';

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
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Institution & Academic Details</h3>
        <p className="text-sm text-gray-500 mt-1">Specify college, state, department, and selected courses.</p>
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

      {/* Department & Number of Courses Selected */}
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
          <label htmlFor="reg-num-courses" className="form-label">
            Number of Courses Selected <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <HiHashtag className="w-4.5 h-4.5 text-primary-600" />
            </div>
            <select
              id="reg-num-courses"
              className="form-select pl-10 border-primary-300 font-semibold text-primary-950 bg-primary-50/30"
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
      <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <HiBookOpen className="w-5 h-5 text-primary-600" />
            Selected Course Name(s) ({numCoursesSelected} {numCoursesSelected === 1 ? 'course' : 'courses'})
          </label>
          <span className="text-xs font-semibold text-primary-700 bg-primary-100/60 px-2.5 py-0.5 rounded-full">
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
