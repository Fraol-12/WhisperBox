const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Like = require('../models/Like');
const generateTicketId = require('../utils/generateTicketId');
const getUserIdentifier = require('../utils/getUserIdentifier');
const { sendComplaintNotification } = require('../utils/emailService');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'complaints');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '';
    cb(null, `complaint-${unique}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 }
});

// POST /api/complaints - Create a new complaint
router.post('/', upload.array('photos', 4), async (req, res) => {
  try {
    const { department, message } = req.body;

    if (!department || !message) {
      return res.status(400).json({ error: 'Department and message are required' });
    }

    if (!['Café', 'IT', 'Library', 'Dorm', 'Registrar'].includes(department)) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    // Generate unique ticket ID
    let ticketId;
    let isUnique = false;
    while (!isUnique) {
      ticketId = generateTicketId();
      const existing = await Complaint.findOne({ ticketId });
      if (!existing) {
        isUnique = true;
      }
    }

    const photos = Array.isArray(req.files)
      ? req.files.map(f => `/uploads/complaints/${path.basename(f.path)}`)
      : [];

    const complaint = new Complaint({
      department,
      message: message.trim(),
      ticketId,
      photos
    });

    await complaint.save();

    // Send email notification (optional)
    sendComplaintNotification(ticketId, department).catch(console.error);

    res.status(201).json({
      message: 'Complaint submitted successfully',
      ticketId: complaint.ticketId,
      complaint: complaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    if (error.message && error.message.includes('image files')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/complaints/:department - Get complaints by department
router.get('/:department', async (req, res) => {
  try {
    const { department } = req.params;
    const { sortBy = 'likes', search = '' } = req.query;

    if (!['Café', 'IT', 'Library', 'Dorm', 'Registrar'].includes(department)) {
      return res.status(400).json({ error: 'Invalid department' });
    }

    let query = { department };

    // Add search filter if provided
    if (search && search.trim()) {
      query.message = { $regex: search.trim(), $options: 'i' };
    }

    // Determine sort order
    let sort = {};
    if (sortBy === 'date') {
      sort = { createdAt: -1 };
    } else {
      sort = { likes: -1, createdAt: -1 };
    }

    const complaints = await Complaint.find(query)
      .sort(sort)
      .lean();

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/complaints/:id/like - Like a complaint
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const userIdentifier = getUserIdentifier(req);

    // Check if complaint exists
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check if user has already liked this complaint
    const existingLike = await Like.findOne({
      complaintId: id,
      userIdentifier
    });

    if (existingLike) {
      return res.status(400).json({ error: 'You have already liked this complaint' });
    }

    // Create like record
    const like = new Like({
      complaintId: id,
      userIdentifier
    });
    await like.save();

    // Increment like count
    complaint.likes += 1;
    await complaint.save();

    res.json({
      message: 'Complaint liked successfully',
      likes: complaint.likes
    });
  } catch (error) {
    console.error('Error liking complaint:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already liked this complaint' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

