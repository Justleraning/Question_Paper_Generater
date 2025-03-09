const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter to validate uploads
const fileFilter = (req, file, cb) => {
  // Accept image files and documents
  const allowedFileTypes = /jpeg|jpg|png|gif|svg|pdf|docx?|txt/i;
  
  // Get file extension and check if it's allowed
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mimetype for additional security
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image and document files are allowed.'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Error handling middleware for file upload
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File too large',
        error: 'File size exceeds 5MB limit'
      });
    }
    
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  } else if (err) {
    // An unknown error occurred when uploading
    return res.status(500).json({
      message: 'Upload failed',
      error: err.message
    });
  }
  next();
};

module.exports = upload;
module.exports.handleMulterError = handleMulterError;