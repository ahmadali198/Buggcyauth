
// import express from "express";
// import upload from "../middleware/upload.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { User, Sequelize } from "../db/models/index.js";
// const { Op } = Sequelize;

// const router = express.Router();
// const baseUrl = process.env.BASE_URL || "http://localhost:2000";

// // 🔹 Get all users including current
// router.get("/", authMiddleware, async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: ["id", "name", "email", "age", "gender", "profilePicture", "createdAt"],
//       order: [["createdAt", "DESC"]],
//     });

//     const usersWithAvatars = users.map((user) => ({
//       ...user.toJSON(),
//       avatarUrl: user.profilePicture ? `${baseUrl}/uploads/${user.profilePicture}` : null,
//       isCurrentUser: user.id === req.user.id,
//     }));

//     return res.json({ users: usersWithAvatars });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching users" });
//   }
// });

// // 🔹 Get current user's profile
// router.get("/me", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id, {
//       attributes: [
//         "id", "name", "email", "age", "gender", "profilePicture",
//         "provider", "emailVerified", "lastLoginAt", "createdAt", "updatedAt"
//       ],
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     return res.json({
//       user: {
//         ...user.toJSON(),
//         avatarUrl: user.profilePicture ? `${baseUrl}/uploads/${user.profilePicture}` : null,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching profile" });
//   }
// });

// // 🔹 Update current user's profile
// router.put("/me", authMiddleware, upload.single("profilePicture"), async (req, res) => {
//   try {
//     const { name, email, age, gender } = req.body;
//     const user = await User.findByPk(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.name = name || user.name;
//     user.email = email || user.email;
//     user.age = age || user.age;
//     user.gender = gender || user.gender;

//     if (req.file) user.profilePicture = req.file.filename;

//     await user.save();

//     // Return with full avatar URL
//     res.json({
//       user: {
//         ...user.toJSON(),
//         avatarUrl: user.profilePicture ? `${baseUrl}/uploads/${user.profilePicture}` : null,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error updating profile" });
//   }
// });

// // 🔹 Get user by ID
// router.get("/:id", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id, {
//       attributes: ["id", "name", "email", "age", "gender", "profilePicture", "createdAt"],
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     return res.json({
//       user: {
//         ...user.toJSON(),
//         avatarUrl: user.profilePicture ? `${baseUrl}/uploads/${user.profilePicture}` : null,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching user" });
//   }
// });


// // 🔹 Analytics overview
// router.get("/analytics/overview", async (req, res) => {
//   try {
//     const totalUsers = await User.count();

//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     const newUsers = await User.count({
//       where: { createdAt: { [Op.gte]: thirtyDaysAgo } },
//     });

//     const sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//     const weeklyUsers = await User.count({
//       where: { createdAt: { [Op.gte]: sevenDaysAgo } },
//     });

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const todayUsers = await User.count({
//       where: { createdAt: { [Op.gte]: today } },
//     });

//     res.json({ totalUsers, newUsers, weeklyUsers, todayUsers });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });

// // 🔹 Recent users
// router.get("/analytics/recent", async (req, res) => {
//   try {
//     const recentUsers = await User.findAll({
//       order: [["createdAt", "DESC"]],
//       limit: 10,
//       attributes: ["id", "name", "email", "provider", "createdAt"],
//     });
//     res.json(recentUsers);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;

import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { User, Sequelize } from "../db/models/index.js";
import upload from "../middleware/upload.js"; // 👈 multer memoryStorage + cloudinary uploader
import { uploadToCloudinary } from "../utils/cloudinary.js"
const { Op } = Sequelize;

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
      avatarUrl: user.profilePicture || null, // 👈 directly use cloudinary url
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

    // ✏️ Update basic fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.age = age || user.age;
    user.gender = gender || user.gender;

    // 🌩️ Upload profile picture if provided
    if (req.file) {
      const result = await uploadToCloudinary(req.file); // 👈 upload memory buffer
      user.profilePicture = result.secure_url;           // 👈 Cloudinary ka URL save hoga
    }

    await user.save();

    // ✅ Return with Cloudinary URL
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

export default router;
