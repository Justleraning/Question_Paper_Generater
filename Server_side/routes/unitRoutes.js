const express = require("express");
const router = express.Router();
const Unit = require("../models/Unit"); // Ensure correct model
const {
  createUnit,
  getUnitsBySubject,
  updateUnit,
  deleteUnit,
} = require("../controllers/unitController");

// ✅ GET all units (with explicit unitId)
router.get("/", async (req, res) => {
    try {
        const units = await Unit.find();
        
        // Format response to include unitId explicitly
        const formattedUnits = units.map(unit => ({
            unitId: unit._id.toString(),  // Explicitly return _id as unitId
            name: unit.name,
            description: unit.description,
            subjectId: unit.subjectId
        }));

        console.log("📜 Retrieved Units:", formattedUnits); // ✅ Debugging log
        res.json({ units: formattedUnits });
    } catch (error) {
        console.error("❌ Error fetching units:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// ✅ CREATE a new unit (Avoid duplicates)
router.post("/", async (req, res) => {
    try {
        const { name, subjectId, description = "" } = req.body; // ✅ Default description to empty string

        if (!name || !subjectId) {
            return res.status(400).json({ error: "Missing required fields: name and subjectId" });
        }

        // Check if the unit already exists for this subject
        let existingUnit = await Unit.findOne({ name, subjectId });

        if (existingUnit) {
            return res.json({ message: "Unit already exists", unitId: existingUnit._id });
        }

        // Create new unit
        const newUnit = new Unit({ name, subjectId, description });
        const savedUnit = await newUnit.save();

        res.json({ message: "Unit created", unitId: savedUnit._id });
    } catch (error) {
        console.error("❌ Error creating unit:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


// ✅ GET units for a specific subject
router.get("/:subjectId", getUnitsBySubject);

// ✅ UPDATE a unit by ID
router.put("/:id", updateUnit);

// ✅ DELETE a unit by ID
router.delete("/:id", deleteUnit);

module.exports = router;
