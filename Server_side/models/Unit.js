const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
}, { timestamps: true });

// ✅ Ensure `_id` is returned properly and no separate `unitId` is created
unitSchema.set("toJSON", { virtuals: true });
unitSchema.set("toObject", { virtuals: true });

const Unit = mongoose.models.Unit || mongoose.model("Unit", unitSchema);

module.exports = Unit;
