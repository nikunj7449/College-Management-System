const mongoose = require('mongoose');

const extraFeeSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  remark: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const studentFeeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  feeStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeStructure',
    required: true
  },
  totalFee: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PAID', 'PARTIAL', 'UNPAID'],
    default: 'UNPAID'
  },
  extraFees: [extraFeeSchema]
}, {
  timestamps: true
});

// Update pendingAmount and status before saving
studentFeeSchema.pre('save', function() {
  const extraTotal = this.extraFees.reduce((sum, item) => sum + item.amount, 0);
  const totalObligation = this.totalFee + extraTotal;
  this.pendingAmount = totalObligation - this.paidAmount;
  
  if (this.paidAmount === 0) {
    this.status = 'UNPAID';
  } else if (this.pendingAmount <= 0) {
    this.status = 'PAID';
    this.pendingAmount = 0; // Prevent negative pending
  } else {
    this.status = 'PARTIAL';
  }
});

module.exports = mongoose.model('StudentFee', studentFeeSchema);
