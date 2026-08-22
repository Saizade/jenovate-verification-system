const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

// File filter - accept images and PDFs only
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed.'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Excel file filter
const excelFileFilter = (req, file, cb) => {
  const allowedExts = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed.'), false);
  }
};

const excelUpload = multer({
  storage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max for excel sheets
  }
});

// Export middleware for single and multiple file uploads
const uploadSingle = upload.single('file');
const uploadExcelSingle = excelUpload.single('file');
const uploadMultiple = upload.fields([
  { name: 'aadhaarDoc', maxCount: 1 },
  { name: 'photoDoc', maxCount: 1 },
  { name: 'receiptDoc', maxCount: 1 }
]);

module.exports = { uploadSingle, uploadExcelSingle, uploadMultiple };

