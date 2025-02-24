const Unit = require("../models/Unit");

// @desc    Create a new unit
// @route   POST /api/units
// @access  Public
const createUnit = async (req, res) => {
  try {
    const { subjectId, name } = req.body;

    // Validate input
    if (!subjectId || !name) {
      return res.status(400).json({ message: "Subject ID and Unit Name are required" });
    }

    // Create a new unit
    const unit = await Unit.create({ subjectId, name });

    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ message: "Error creating unit", error: error.message });
  }
};

// @desc    Get all units for a subject
// @route   GET /api/units/:subjectId
// @access  Public
const getUnitsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;

    // Retrieve all units for the given subject
    const units = await Unit.find({ subjectId });

    if (!units || units.length === 0) {
      return res.status(404).json({ message: "No units found for this subject" });
    }

    res.status(200).json(units);
  } catch (error) {
    res.status(500).json({ message: "Error fetching units", error: error.message });
  }
};

// @desc    Update a unit
// @route   PUT /api/units/:id
// @access  Public
const updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Unit name is required" });
    }

    // Find and update the unit
    const updatedUnit = await Unit.findByIdAndUpdate(id, { name }, { new: true });

    if (!updatedUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json(updatedUnit);
  } catch (error) {
    res.status(500).json({ message: "Error updating unit", error: error.message });
  }
};

// @desc    Delete a unit
// @route   DELETE /api/units/:id
// @access  Public
const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the unit
    const deletedUnit = await Unit.findByIdAndDelete(id);

    if (!deletedUnit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({ message: "Unit deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting unit", error: error.message });
  }
};

module.exports = {
  createUnit,
  getUnitsBySubject,
  updateUnit,
  deleteUnit,
};
