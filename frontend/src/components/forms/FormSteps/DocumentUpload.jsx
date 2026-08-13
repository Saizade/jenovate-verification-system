import { useState, useCallback } from 'react';
import { HiArrowUpTray, HiXMark, HiIdentification, HiPhoto, HiDocumentText, HiCheckCircle } from 'react-icons/hi2';

const uploadZones = [
  {
    key: 'aadhaarDoc',
    label: 'Aadhaar Card',
    description: 'Upload front side of your Aadhaar card',
    icon: HiIdentification,
    accept: 'image/jpeg,image/png,image/webp,application/pdf',
    maxSizeMB: 5,
    required: true,
  },
  {
    key: 'photoDoc',
    label: 'Passport Photo',
    description: 'Recent passport-size photograph',
    icon: HiPhoto,
    accept: 'image/jpeg,image/png,image/webp',
    maxSizeMB: 2,
    required: true,
  },
  {
    key: 'receiptDoc',
    label: 'Payment Receipt',
    description: 'Upload your payment receipt or screenshot',
    icon: HiDocumentText,
    accept: 'image/jpeg,image/png,image/webp,application/pdf',
    maxSizeMB: 5,
    required: false,
  },
];

export default function DocumentUpload({ register, errors, setValue, watch }) {
  const [previews, setPreviews] = useState({});
  const [dragOverKey, setDragOverKey] = useState(null);
  const [fileErrors, setFileErrors] = useState({});

  const handleFile = useCallback((file, zone) => {
    // Validate file type
    const allowedTypes = zone.accept.split(',');
    if (!allowedTypes.some((type) => file.type === type.trim())) {
      setFileErrors((prev) => ({ ...prev, [zone.key]: 'Invalid file type. Please upload an image or PDF.' }));
      return;
    }

    // Validate file size
    const maxBytes = zone.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileErrors((prev) => ({ ...prev, [zone.key]: `File too large. Max size is ${zone.maxSizeMB}MB.` }));
      return;
    }

    // Clear error
    setFileErrors((prev) => ({ ...prev, [zone.key]: null }));

    // Set value in form
    setValue(zone.key, file, { shouldValidate: true });

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => ({ ...prev, [zone.key]: e.target.result }));
      };
      reader.readAsDataURL(file);
    } else {
      // PDF indicator
      setPreviews((prev) => ({ ...prev, [zone.key]: 'pdf' }));
    }
  }, [setValue]);

  const handleDrop = useCallback((e, zone) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, zone);
  }, [handleFile]);

  const handleDragOver = useCallback((e, key) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(key);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverKey(null);
  }, []);

  const handleInputChange = useCallback((e, zone) => {
    const file = e.target.files[0];
    if (file) handleFile(file, zone);
  }, [handleFile]);

  const removeFile = useCallback((key) => {
    setPreviews((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setValue(key, null);
    setFileErrors((prev) => ({ ...prev, [key]: null }));
  }, [setValue]);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 animate-stagger">
      <div className="mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Document Upload</h3>
        <p className="text-sm text-gray-500 mt-1">
          Upload the required documents. Accepted formats: JPG, PNG, WebP, PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {uploadZones.map((zone) => {
          const Icon = zone.icon;
          const preview = previews[zone.key];
          const fileValue = watch(zone.key);
          const error = fileErrors[zone.key] || (errors[zone.key]?.message);
          const isDragOver = dragOverKey === zone.key;

          return (
            <div key={zone.key} className="flex flex-col">
              <label className="form-label mb-2">
                {zone.label} {zone.required && <span className="text-red-500">*</span>}
              </label>

              {preview ? (
                /* Preview State */
                <div className="relative group rounded-xl border-2 border-primary-200 bg-primary-50/30 overflow-hidden">
                  {preview === 'pdf' ? (
                    <div className="flex flex-col items-center justify-center p-8 gap-3">
                      <HiDocumentText className="w-12 h-12 text-red-400" />
                      <p className="text-sm font-medium text-gray-700">PDF Document</p>
                      {fileValue && (
                        <p className="text-xs text-gray-400">{formatFileSize(fileValue.size)}</p>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-[4/3]">
                      <img
                        src={preview}
                        alt={zone.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Success indicator */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                    <HiCheckCircle className="w-3.5 h-3.5" />
                    Uploaded
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(zone.key)}
                    className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-150 opacity-0 group-hover:opacity-100 shadow-sm"
                    title="Remove file"
                  >
                    <HiXMark className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Drop Zone */
                <label
                  htmlFor={`upload-${zone.key}`}
                  className={`drop-zone flex flex-col items-center justify-center min-h-[180px] ${
                    isDragOver ? 'drag-over' : ''
                  } ${error ? 'border-red-300 bg-red-50/30' : ''}`}
                  onDrop={(e) => handleDrop(e, zone)}
                  onDragOver={(e) => handleDragOver(e, zone.key)}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    id={`upload-${zone.key}`}
                    type="file"
                    accept={zone.accept}
                    className="sr-only"
                    onChange={(e) => handleInputChange(e, zone)}
                  />
                  {/* Hidden register for validation */}
                  <input
                    type="hidden"
                    {...register(zone.key, {
                      required: zone.required ? `${zone.label} is required` : false,
                    })}
                  />

                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors duration-200 ${
                    isDragOver ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${isDragOver ? 'text-primary-600' : 'text-gray-400'}`} />
                  </div>

                  <div className="flex items-center gap-1.5 text-sm font-medium text-primary-600 mb-1">
                    <HiArrowUpTray className="w-4 h-4" />
                    {isDragOver ? 'Drop here' : 'Click to upload'}
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    {zone.description}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">
                    Max {zone.maxSizeMB}MB
                  </p>
                </label>
              )}

              {error && (
                <p className="form-error mt-1.5">{error}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
