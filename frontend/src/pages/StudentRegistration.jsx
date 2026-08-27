import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import PersonalInfo from '../components/forms/FormSteps/PersonalInfo';
import AcademicInfo from '../components/forms/FormSteps/AcademicInfo';
import PaymentInfo from '../components/forms/FormSteps/PaymentInfo';
import ReviewSubmit from '../components/forms/FormSteps/ReviewSubmit';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { HiCheckCircle, HiArrowRight, HiArrowLeft } from 'react-icons/hi2';

const STEPS = [
  'General & Contact Info',
  'Institution & Academic',
  'Payment & Revenue Details',
  'Review & Submit'
];

export default function StudentRegistration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      remarks: '',
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      academicRemarks: '',
      counselorName: '',
      fullName: '',
      phoneNo: '',
      whatsappNumber: '',
      email: '',
      collegeName: '',
      state: '',
      department: '',
      numCoursesSelected: '1',
      courseOpted: '',
      primaryCourse: '',
      secondaryCourse: '',
      tertiaryCourse: '',
      typeOfPack: 'Single Course',
      monthOpted: '',
      typeOfCourse: '',
      programPrice: '',
      amountReceived: '',
      pendingAmount: ''
    }
  });

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 0) {
      fieldsToValidate = ['fullName'];
    } else if (currentStep === 1) {
      const num = parseInt(watch('numCoursesSelected') || '1', 10);
      fieldsToValidate = ['numCoursesSelected', 'primaryCourse'];
      if (num >= 2) fieldsToValidate.push('secondaryCourse');
      if (num >= 3) fieldsToValidate.push('tertiaryCourse');
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error('Please fix required validation errors before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/students', data);

      if (response.data.success) {
        setSuccessData(response.data.data);
        toast.success('Registration submitted successfully!');
      } else {
        toast.error(response.data.message || 'Submission failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong. Please check inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfo register={register} errors={errors} watch={watch} />;
      case 1:
        return <AcademicInfo register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 2:
        return <PaymentInfo register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 3:
        return <ReviewSubmit watch={watch} />;
      default:
        return null;
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
        <Card className="text-center p-8 md:p-12 border border-emerald-200 bg-white shadow-xl rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-500"></div>
          
          <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6">
            <HiCheckCircle className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-heading font-extrabold text-ocean-950 leading-tight">
            Registration Submitted!
          </h2>
          <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
            Your detailed registration has been locked successfully and sent for official verification.
          </p>

          <div className="my-8 p-6 bg-surface-50 border border-surface-200 rounded-2xl max-w-sm mx-auto shadow-sm">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
              Your Reference ID
            </span>
            <span className="text-2xl font-bold text-ocean-950 font-mono tracking-wide select-all bg-white px-4 py-2 rounded-xl border border-surface-200 shadow-inner">
              {successData.reference_id}
            </span>
            <p className="text-xs text-amber-700 font-medium mt-3 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-200">
              🔑 Note down this ID for verification.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-left p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-xs text-gray-400 block font-medium">Student Name</span>
                <span className="text-sm font-semibold text-ocean-950">{successData.full_name}</span>
              </div>
              <div className="text-left p-4 rounded-xl bg-surface-50 border border-surface-200">
                <span className="text-xs text-gray-400 block font-medium">Course Selected</span>
                <span className="text-sm font-semibold text-ocean-950">{successData.course_name}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-surface-100 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => {
                  setSuccessData(null);
                  setCurrentStep(0);
                  navigate('/login');
                }}
              >
                Go to Login Page
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      {/* Title block */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading font-extrabold text-ocean-950 tracking-tight">
          Jenovate Verification System
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Submit student registration details to complete enrollment.
        </p>
      </div>

      {/* Progress Wizard */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[600px] px-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1 last:flex-initial">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs border transition-all duration-300 ${
                    currentStep > idx
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : currentStep === idx
                      ? 'bg-ocean-600 border-ocean-600 text-white shadow-sm'
                      : 'bg-white border-surface-200 text-gray-400'
                  }`}
                >
                  {currentStep > idx ? <HiCheckCircle className="w-5 h-5" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-semibold mt-2 whitespace-nowrap tracking-tight transition-all duration-300 ${
                    currentStep === idx ? 'text-ocean-950 font-bold' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Line connector */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-surface-200 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: currentStep > idx ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6 md:p-8 bg-white shadow-card border border-surface-200 rounded-2xl min-h-[450px] flex flex-col justify-between">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1">
          {renderStepContent()}
        </form>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-surface-100">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="flex items-center gap-1.5"
          >
            <HiArrowLeft className="w-4 h-4" /> Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              variant="primary"
              onClick={nextStep}
              className="flex items-center gap-1.5"
            >
              Next <HiArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              className="px-6 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Submit Registration <HiCheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
