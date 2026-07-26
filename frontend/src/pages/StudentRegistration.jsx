import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

import PersonalInfo from '../components/forms/FormSteps/PersonalInfo';
import FamilyInfo from '../components/forms/FormSteps/FamilyInfo';
import AddressInfo from '../components/forms/FormSteps/AddressInfo';
import AcademicInfo from '../components/forms/FormSteps/AcademicInfo';
import PaymentInfo from '../components/forms/FormSteps/PaymentInfo';
import DocumentUpload from '../components/forms/FormSteps/DocumentUpload';
import ReviewSubmit from '../components/forms/FormSteps/ReviewSubmit';

import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { HiCheckCircle, HiArrowRight, HiArrowLeft } from 'react-icons/hi2';

const STEPS = [
  'Personal Info',
  'Family Info',
  'Address Info',
  'Academic Info',
  'Payment Info',
  'Upload Docs',
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
      fullName: '',
      dateOfBirth: '',
      gender: '',
      mobile: '',
      email: '',
      fatherName: '',
      motherName: '',
      siblings: 0,
      guardianName: '',
      guardianPhone: '',
      state: '',
      city: '',
      address: '',
      pinCode: '',
      qualification: '',
      previousInstitution: '',
      course: '',
      yearOfPassing: '',
      totalFees: 0,
      amountPaid: 0,
      paymentMode: '',
      transactionId: '',
      aadhaarDoc: null,
      photoDoc: null,
      receiptDoc: null
    }
  });

  const nextStep = async () => {
    // Validate fields for current step
    let fieldsToValidate = [];
    if (currentStep === 0) {
      fieldsToValidate = ['fullName', 'dateOfBirth', 'gender', 'mobile', 'email'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['fatherName', 'motherName', 'siblings'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['state', 'city', 'address', 'pinCode'];
    } else if (currentStep === 3) {
      fieldsToValidate = ['qualification', 'previousInstitution', 'course', 'yearOfPassing'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['totalFees', 'amountPaid', 'paymentMode', 'transactionId'];
    } else if (currentStep === 5) {
      fieldsToValidate = ['aadhaarDoc', 'photoDoc', 'receiptDoc'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error('Please fix validation errors before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      // Append standard text fields
      formData.append('fullName', data.fullName);
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('gender', data.gender);
      formData.append('mobile', data.mobile);
      formData.append('email', data.email);
      formData.append('fatherName', data.fatherName);
      formData.append('motherName', data.motherName);
      formData.append('siblings', data.siblings);
      formData.append('guardianName', data.guardianName);
      formData.append('guardianPhone', data.guardianPhone);
      formData.append('state', data.state);
      formData.append('city', data.city);
      formData.append('address', data.address);
      formData.append('pinCode', data.pinCode);
      formData.append('qualification', data.qualification);
      formData.append('previousInstitution', data.previousInstitution);
      formData.append('course', data.course);
      formData.append('yearOfPassing', data.yearOfPassing);
      formData.append('totalFees', data.totalFees);
      formData.append('amountPaid', data.amountPaid);
      formData.append('paymentMode', data.paymentMode);
      formData.append('transactionId', data.transactionId);

      // Append files
      if (data.aadhaarDoc) {
        formData.append('aadhaarDoc', data.aadhaarDoc);
      }
      if (data.photoDoc) {
        formData.append('photoDoc', data.photoDoc);
      }
      if (data.receiptDoc) {
        formData.append('receiptDoc', data.receiptDoc);
      }

      // API Call
      const response = await api.post('/students', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

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
        return <FamilyInfo register={register} errors={errors} watch={watch} />;
      case 2:
        return <AddressInfo register={register} errors={errors} watch={watch} />;
      case 3:
        return <AcademicInfo register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 4:
        return <PaymentInfo register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 5:
        return <DocumentUpload register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 6:
        return <ReviewSubmit watch={watch} />;
      default:
        return null;
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-fade-in">
        <Card className="text-center p-8 md:p-12 border-2 border-emerald-100 bg-white/95 shadow-xl rounded-2xl relative overflow-hidden">
          {/* Confetti decoration */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
          
          <div className="mx-auto w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-inner animate-pulse">
            <HiCheckCircle className="w-12 h-12" />
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
            Registration Submitted!
          </h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Your detailed registration has been locked successfully and sent for official verification.
          </p>

          <div className="my-8 p-6 bg-surface-50 border border-gray-100 rounded-2xl max-w-sm mx-auto shadow-sm">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">
              Your Reference ID
            </span>
            <span className="text-3xl font-black text-primary-950 font-mono tracking-wide select-all bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-inner">
              {successData.reference_id}
            </span>
            <p className="text-xs text-amber-600 font-semibold mt-3 bg-amber-50 py-1.5 px-3 rounded-lg border border-amber-100">
              🔑 Note down this ID for verification.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="text-left p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Student Name</span>
                <span className="text-sm font-semibold text-gray-800">{successData.full_name}</span>
              </div>
              <div className="text-left p-4 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-400 block font-medium">Course Selected</span>
                <span className="text-sm font-semibold text-gray-800">{successData.course_name}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-center">
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
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Jenovate Verification System
        </h1>
        <p className="text-gray-500 mt-2">
          Submit student registration form details to complete your enrollment.
        </p>
      </div>

      {/* Progress Wizard */}
      <div className="mb-10 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex items-center justify-between min-w-[650px] px-2">
          {STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1 last:flex-initial">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 transition-all duration-300 ${
                    currentStep > idx
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                      : currentStep === idx
                      ? 'bg-primary-950 border-primary-950 text-white shadow-md shadow-primary-950/20 scale-110'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > idx ? <HiCheckCircle className="w-6 h-6" /> : idx + 1}
                </div>
                <span
                  className={`text-xs font-bold mt-2 whitespace-nowrap tracking-tight transition-all duration-300 ${
                    currentStep === idx ? 'text-primary-950 font-extrabold' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Line connector */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-gray-200 relative">
                  <div
                    className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: currentStep > idx ? '100%' : '0%' }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6 md:p-8 bg-white shadow-lg border border-gray-100 rounded-2xl min-h-[450px] flex flex-col justify-between">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex-1">
          {renderStepContent()}
        </form>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
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
              className="px-8 flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              Submit Registration <HiCheckCircle className="w-4.5 h-4.5" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
