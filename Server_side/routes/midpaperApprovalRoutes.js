const express = require("express");
const router = express.Router();
const Question = require("../models/midQuestion");

// Get all submitted papers for admin review
router.get("/get-submitted-papers", async (req, res) => {
  try {
    const submittedPapers = await Question.find({ status: "Submitted" })
      .sort({ submittedAt: -1 }) // Sort by submission date, newest first
      .populate("submittedBy", "name email") // Get submitter information
      .select("-__v"); // Exclude version key
    
    console.log(`Found ${submittedPapers.length} submitted papers`);
    res.json(submittedPapers);
  } catch (error) {
    console.error("Error fetching submitted papers:", error);
    res.status(500).json({ error: "Failed to fetch submitted papers" });
  }
});

// Update paper status
router.put("/update-paper-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, approvedAt, rejectedBy, rejectedAt, rejectionReason } = req.body;
    
    // Validate input
    if (!status || !id) {
      return res.status(400).json({ error: "Paper ID and status are required" });
    }
    
    // Check if status is valid
    if (!["Draft", "Submitted", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }
    
    // Build update object based on status
    const updateData = { status };
    
    // Add appropriate metadata based on status
    if (status === "Approved") {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = approvedAt || new Date();
    } else if (status === "Rejected") {
      updateData.rejectedBy = rejectedBy;
      updateData.rejectedAt = rejectedAt || new Date();
      updateData.rejectionReason = rejectionReason;
    } else if (status === "Submitted") {
      updateData.submittedAt = req.body.submittedAt || new Date();
      updateData.submittedBy = req.body.submittedBy;
    }
    
    // Update the paper
    const updatedPaper = await Question.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );
    
    if (!updatedPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    
    console.log(`Paper ${id} status updated to: ${status}`);
    
    // Return success response
    res.json({
      message: `Paper status updated to ${status}`,
      paper: updatedPaper
    });
  } catch (error) {
    console.error("Error updating paper status:", error);
    res.status(500).json({ error: "Failed to update paper status" });
  }
});

module.exports = router;