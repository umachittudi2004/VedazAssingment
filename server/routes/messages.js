const express = require("express");
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Send a message (fallback if socket not used)
router.post("/:id/messages", authMiddleware, async (req, res) => {
  const { id } = req.params; // receiver
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "Message text is required" });

  try {
    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: id,
      text,
      status: "sent",
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get messages between current user and another
router.get("/:id/messages", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: id },
        { sender: id, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get last message from each conversation (chat list)
router.get("/last", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: req.user.id }, { receiver: req.user.id }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", req.user.id] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
