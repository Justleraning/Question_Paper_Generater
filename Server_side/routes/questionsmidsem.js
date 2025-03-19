const express = require("express");
const router = express.Router();
const QuestionPaper = require("../models/QuestionPaper_midsem");

// ✅ Get all saved question papers with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { 
      subject, 
      semester, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query filter
    const query = {};
    if (subject) query.subject = subject;
    if (semester) query.semester = semester;

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch papers with pagination and sorting
    const papers = await QuestionPaper.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-__v'); // Exclude version key

    // Get total count for pagination
    const totalPapers = await QuestionPaper.countDocuments(query);

    res.json({
      papers,
      currentPage: Number(page),
      totalPages: Math.ceil(totalPapers / limit),
      totalPapers
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch question papers" });
  }
});

// ✅ Get a single question paper by ID with more robust error handling
router.get("/:id", async (req, res) => {
  try {
    console.log("Fetching Paper with ID:", req.params.id);
    
    const paper = await QuestionPaper.findById(req.params.id).populate({
      path: "questions",
      select: "-__v" // Exclude version key from populated questions
    });
    
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    
    res.json(paper);
  } catch (error) {
    console.error("Error fetching paper:", error);
    
    // Handle specific Mongoose errors
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid paper ID format" });
    }
    
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// ✅ Update a paper by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate input
    if (!updateData) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // Validate questions if present
    if (updateData.questions) {
      updateData.questions = updateData.questions.filter(q => 
        q.text && q.text.trim() !== '' && q.marks
      );

      if (updateData.questions.length === 0) {
        return res.status(400).json({ error: "No valid questions provided" });
      }
    }

    // Perform update
    const updatedPaper = await QuestionPaper.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true,        // Return the modified document
        runValidators: true // Run model validation
      }
    );

    if (!updatedPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json(updatedPaper);
  } catch (error) {
    console.error("Error updating paper:", error);
    res.status(500).json({ error: "Failed to update paper" });
  }
});

// ✅ Delete a paper by ID with more robust error handling
router.delete("/:id", async (req, res) => {
  try {
    const deletedPaper = await QuestionPaper.findByIdAndDelete(req.params.id);
    
    if (!deletedPaper) {
      return res.status(404).json({ message: "Paper not found" });
    }
    
    res.json({ 
      message: "Paper deleted successfully",
      deletedPaper: {
        id: deletedPaper._id,
        subject: deletedPaper.subject,
        semester: deletedPaper.semester
      }
    });
  } catch (error) {
    console.error("Error deleting paper:", error);
    
    // Handle specific Mongoose errors
    if (error.name === 'CastError') {
      return res.status(400).json({ message: "Invalid paper ID format" });
    }
    
    res.status(500).json({ message: "Server error while deleting paper" });
  }
});

// ✅ Generate a randomized paper with more advanced randomization
router.post("/randomize", async (req, res) => {
  try {
    const { subject, semester, difficulty } = req.body;
    
    // Build query based on provided filters
    const query = {};
    if (subject) query.subject = subject;
    if (semester) query.semester = semester;
    if (difficulty) query['questions.difficulty'] = difficulty;

    const papers = await QuestionPaper.find(query);

    if (!papers.length) {
      return res.status(404).json({ error: "No questions available matching the criteria" });
    }

    // Randomly select a paper
    const selectedPaper = papers[Math.floor(Math.random() * papers.length)];
    
    // Optional: Further randomize questions within the paper
    const randomizeQuestions = (questions) => {
      return questions
        .sort(() => Math.random() - 0.5) // Shuffle
        .slice(0, Math.min(questions.length, 10)); // Limit to 10 questions
    };

    // Create a randomized version of the paper
    const randomizedPaper = {
      ...selectedPaper.toObject(),
      questions: randomizeQuestions(selectedPaper.questions)
    };

    res.json(randomizedPaper);
  } catch (error) {
    console.error("Error randomizing paper:", error);
    res.status(500).json({ error: "Failed to randomize questions" });
  }
});

// ✅ Send for approval with more comprehensive logic
router.post("/send-for-approval", async (req, res) => {
  try {
    const { paperId, userId } = req.body;

    if (!paperId) {
      return res.status(400).json({ error: "Paper ID is required" });
    }

    // Find the paper
    const paper = await QuestionPaper.findById(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Update paper status
    paper.status = 'Submitted';
    paper.submittedBy = userId;
    paper.submittedAt = new Date();

    await paper.save();

    res.json({ 
      message: "Paper sent for approval! ✅", 
      paper: {
        id: paper._id,
        subject: paper.subject,
        status: paper.status
      }
    });
  } catch (error) {
    console.error("Error sending paper for approval:", error);
    res.status(500).json({ error: "Failed to send paper for approval" });
  }
});

module.exports = router;