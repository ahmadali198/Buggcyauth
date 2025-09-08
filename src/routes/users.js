// ---------------- IMPORTS ----------------
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js");
const { User, Sequelize } = require("../db/models/index.js"); // CommonJS style
const upload = require("../middleware/upload.js"); // multer memoryStorage + cloudinary uploader
const { uploadToCloudinary } = require("../utils/cloudinary.js");
const { Op } = Sequelize;

// ---------------- ROUTER ----------------
const router = express.Router();

// 🔹 Get all users including current
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "age", "gender", "profilePicture", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    const usersWithAvatars = users.map((user) => ({
      ...user.toJSON(),
      avatarUrl: user.profilePicture || null,
      isCurrentUser: user.id === req.user.id,
    }));

    return res.json({ users: usersWithAvatars });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching users" });
  }
});

// 🔹 Get current user's profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id", "name", "email", "age", "gender", "profilePicture",
        "provider", "emailVerified", "lastLoginAt", "createdAt", "updatedAt"
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        ...user.toJSON(),
        avatarUrl: user.profilePicture || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching profile" });
  }
});

// 🔹 Update current user's profile
router.put("/me", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  try {
    const { name, email, age, gender } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.age = age || user.age;
    user.gender = gender || user.gender;

    if (req.file) {
      const result = await uploadToCloudinary(req.file);
      user.profilePicture = result.secure_url;
    }

    await user.save();

    res.json({
      user: {
        ...user.toJSON(),
        avatarUrl: user.profilePicture || null,
      },
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// 🔹 Get user by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "name", "email", "age", "gender", "profilePicture", "createdAt"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        ...user.toJSON(),
        avatarUrl: user.profilePicture || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching user" });
  }
});

// 🔹 Analytics overview
router.get("/analytics/overview", async (req, res) => {
  try {
    const totalUsers = await User.count();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.count({
      where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyUsers = await User.count({
      where: { createdAt: { [Op.gte]: sevenDaysAgo } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsers = await User.count({
      where: { createdAt: { [Op.gte]: today } },
    });

    res.json({ totalUsers, newUsers, weeklyUsers, todayUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Recent users
router.get("/analytics/recent", async (req, res) => {
  try {
    const recentUsers = await User.findAll({
      order: [["createdAt", "DESC"]],
      limit: 10,
      attributes: ["id", "name", "email", "provider", "createdAt"],
    });
    res.json(recentUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------- EXPORT ----------------
module.exports = router;
