const mongoose = require("mongoose");

// Question schema for individual questions in the paper
const EndPaperQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true
  },
  questionNumber: {
    type: Number,
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  hasImage: {
    type: Boolean,
    default: false
  },
  imageUrl: {
    type: String,
    default: null
  },
  imageState: {
    width: Number,
    height: Number,
    left: Number,
    top: Number
  },
  unit: {
    type: Number,
    required: true
  },
  bloomLevel: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  part: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: true
  }
});

// Paper part schema for different parts of the paper (A, B, C)
const EndPaperPartSchema = new mongoose.Schema({
  partId: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: true
  },
  partTitle: {
    type: String,
    required: true
  },
  instructions: {
    type: [String],
    required: true
  },
  marksFormat: {
    type: String,
    required: true
  },
  questions: [EndPaperQuestionSchema]
});

// End papers schema
const EndPapersSchema = new mongoose.Schema({
  // University details
  university: {
    name: {
      type: String,
      required: true,
      default: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27"
    },
    logoUrl: {
      type: String,
      default: "/SJU.png"
    }
  },

  // Exam details
  examDetails: {
    course: {
      type: String,
      required: true
    },
    semester: {
      type: String,
      required: true
    },
    semesterExamination: {
      type: String,
      required: true
    },
    examinationConducted: {
      type: String,
      required: true
    },
    subjectCode: {
      type: String,
      required: true
    },
    subjectName: {
      type: String,
      required: true
    },
    examTimings: {
      type: String,
      default: "2 hours"
    },
    maxMarks: {
      type: String,
      default: "60"
    },
    duration: {
      type: String,
      default: "2"
    }
  },

  // Paper metadata with simpler createdBy like in Paper model
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Keep additional metadata for other information
  metadata: {
    creatorName: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected', 'Draft', 'Submitted', 'Approved', 'Rejected'],
      default: 'draft'
    },
    approvalHistory: [{
      status: String,
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: Date,
      comments: String
    }],
    submittedAt: Date,
    approvedAt: Date
  },
  
  // Paper status (separate from metadata.status)
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Approved', 'Rejected', 'Published'],
    default: 'Draft'
  },

  // Review fields similar to Paper model
  reviewComments: {
    type: String,
    default: ''
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedOn: Date,

  // Paper structure
  paperStructure: {
    totalPages: {
      type: Number,
      required: true,
      default: 1
    },
    parts: [EndPaperPartSchema],
  },

  // Paper layout and styling
  layout: {
    paperSize: {
      type: String,
      default: 'A4'
    },
    marginTop: {
      type: Number,
      default: 20
    },
    marginRight: {
      type: Number,
      default: 15
    },
    marginBottom: {
      type: Number,
      default: 20
    },
    marginLeft: {
      type: Number,
      default: 15
    },
    headerHeight: {
      type: Number,
      default: 60
    },
    footerHeight: {
      type: Number,
      default: 20
    }
  },

  // Raw HTML structure if needed
  renderHTML: {
    type: String
  },

  // Image states for all images in the paper
  imageStates: {
    type: Map,
    of: {
      width: Number,
      height: Number,
      left: Number,
      top: Number
    }
  }
}, { timestamps: true });

// Pre-save middleware to update timestamps and normalize status values
EndPapersSchema.pre('save', function(next) {
  // Update the timestamp
  this.metadata.updatedAt = Date.now();
  
  // Normalize status field cases when saving
  if (this.status) {
    // Ensure the root status field has proper case (first letter uppercase, rest lowercase)
    this.status = this.status.charAt(0).toUpperCase() + this.status.slice(1).toLowerCase();
  }
  
  next();
});

module.exports = mongoose.model("EndPapers", EndPapersSchema);