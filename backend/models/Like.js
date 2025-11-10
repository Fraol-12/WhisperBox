const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  userIdentifier: {
    type: String,
    required: true
  }
});

likeSchema.index({ complaintId: 1, userIdentifier: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);

