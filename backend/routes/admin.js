const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');
const authMiddleware = require('../middleware/auth');

// POST /api/admin/login - Admin login
router.post('/login', async (req, res) => {
  try {
  const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

  // Normalize the email to match the schema's `lowercase: true` behavior
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const admin = await Admin.findOne({ email: normalizedEmail });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, department: admin.department },
      process.env.JWT_SECRET || 'your_secret_jwt_key_change_in_production',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        department: admin.department,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/complaints - Get complaints for admin's department
router.get('/complaints', authMiddleware, async (req, res) => {
  try {
    const { sortBy = 'likes', search = '' } = req.query;
    const department = req.admin.department;

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

    const complaints = await Complaint.find(query).sort(sort);

    res.json(complaints);
  } catch (error) {
    console.error('Error fetching admin complaints:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/stats - Get statistics for charts
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const department = req.admin.department;

    const stats = await Complaint.aggregate([
      { $match: { department } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalComplaints = await Complaint.countDocuments({ department });
    const totalLikes = await Complaint.aggregate([
      { $match: { department } },
      { $group: { _id: null, total: { $sum: '$likes' } } }
    ]);

    res.json({
      statusDistribution: stats,
      totalComplaints,
      totalLikes: totalLikes[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/complaints/:id/status - Update complaint status
router.put('/complaints/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Verify admin has access to this complaint's department
    if (complaint.department !== req.admin.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    complaint.status = status;
    await complaint.save();

    res.json({
      message: 'Status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/complaints/:id/reply - Add reply to complaint
router.put('/complaints/:id/reply', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ error: 'Reply is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Verify admin has access to this complaint's department
    if (complaint.department !== req.admin.department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    complaint.reply = reply.trim();
    await complaint.save();

    res.json({
      message: 'Reply added successfully',
      complaint
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

