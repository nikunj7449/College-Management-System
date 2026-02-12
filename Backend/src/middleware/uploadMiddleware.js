const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Configure where to store files (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath); 
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.extension
    // Example: documents-1674567890.pdf
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// 2. Check File Type (Security: Only allow Images and PDFs)
const checkFileType = (file, cb) => {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|pdf/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only Images and PDFs are allowed!'));
  }
};

// 3. Initialize Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

module.exports = upload;