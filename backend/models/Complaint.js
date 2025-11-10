const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    enum: ['Café', 'IT', 'Library', 'Dorm', 'Registrar']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  likes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  ticketId: {
    type: String,
    unique: true
  },
  reply: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

complaintSchema.index({ department: 1, createdAt: -1 });
complaintSchema.index({ likes: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);

