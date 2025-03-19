const express = require("express");
const paperController = require("../controllers/paperController");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/save", protect, paperController.savePaper);
router.get("/my-papers", protect, paperController.getMyPapers);
router.delete("/:id", protect, paperController.deletePaper);
module.exports = router;