const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.id } },
      "_id username online"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
