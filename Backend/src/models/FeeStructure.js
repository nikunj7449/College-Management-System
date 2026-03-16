const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Branch is required']
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required']
  },
  fees: [{
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FeeCategory',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Calculate totalAmount before validation
feeStructureSchema.pre('validate', function() {
  if (this.fees && this.fees.length > 0) {
    this.totalAmount = this.fees.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  } else {
    this.totalAmount = 0;
  }
});

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
