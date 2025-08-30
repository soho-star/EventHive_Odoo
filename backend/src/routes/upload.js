const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadDir;
    
    // Create subdirectories based on file type
    if (file.fieldname === 'profileImage') {
      uploadPath = path.join(uploadDir, 'profiles');
    } else if (file.fieldname === 'eventPoster' || file.fieldname === 'eventImages') {
      uploadPath = path.join(uploadDir, 'events');
    } else {
      uploadPath = path.join(uploadDir, 'general');
    }

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// All upload routes require authentication
router.use(authenticateToken);

// @desc    Upload profile image
// @route   POST /api/upload/profile
// @access  Private
router.post('/profile', upload.single('profileImage'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload event poster
// @route   POST /api/upload/event-poster
// @access  Private (Organizer/Admin)
router.post('/event-poster', upload.single('eventPoster'), (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Event poster uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Upload multiple event images
// @route   POST /api/upload/event-images
// @access  Private (Organizer/Admin)
router.post('/event-images', upload.array('eventImages', 5), (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileUrl = `/uploads/${path.basename(path.dirname(file.path))}/${file.filename}`;
      return {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: fileUrl
      };
    });

    res.json({
      success: true,
      message: `${uploadedFiles.length} images uploaded successfully`,
      data: {
        files: uploadedFiles
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete uploaded file
// @route   DELETE /api/upload/:filename
// @access  Private
router.delete('/:filename', (req, res, next) => {
  try {
    const filename = req.params.filename;
    
    // Security check - prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename'
      });
    }

    // Search for the file in subdirectories
    const subdirs = ['profiles', 'events', 'general'];
    let filePath = null;

    for (const subdir of subdirs) {
      const testPath = path.join(uploadDir, subdir, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
  }

  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed'
    });
  }

  next(error);
});

module.exports = router;
