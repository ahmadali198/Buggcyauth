// // src/routes/index.js
// import express from "express";
// const router = express.Router();

// import AuthController from "../controllers/AuthController.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import upload from '../middleware/upload.js';
// import { User, Sequelize } from "../db/models/index.js";
// const { Op } = Sequelize;

// // ===== Debug =====
// console.log("AuthController:", AuthController);
// console.log("authMiddleware:", authMiddleware);

// // ===== Auth routes =====
// router.post("/auth/signup",upload.single('profilePicture'), AuthController.signup);
// router.post("/auth/login", AuthController.login);
// router.post("/oauth/google", AuthController.googleLogin);

// // ===== Protected user routes =====

// // Get own profile
// router.get("/users/me", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findByPk(req.user.id, {
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "age",
//         "gender",
//         "profilePicture",
//         "provider",
//         "emailVerified",
//         "lastLoginAt",
//         "createdAt",
//         "updatedAt",
//       ],
//     });
//     return res.json({ user });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching profile" });
//   }
// });

// // Get all other users (excluding self)
// router.get("/users", authMiddleware, async (req, res) => {
//   try {
//     const users = await User.findAll({
//       attributes: ["id", "name", "email", "age", "gender", "createdAt"],
//       where: { id: { [Op.ne]: req.user.id } },
//     });
//     return res.json({ users });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching users" });
//   }
// });

// // Get another user profile by ID
// router.get("/users/:id", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id, {
//       attributes: ["id", "name", "email", "age", "gender", "createdAt"],
//     });
//     if (!user) return res.status(404).json({ message: "User not found" });
//     return res.json({ user });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error fetching user" });
//   }
// });

// // Update own profile
// router.put("/users/me", authMiddleware, async (req, res) => {
//   try {
//     const { name, age, gender, profilePicture } = req.body;
//     const user = await User.findByPk(req.user.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     // Update only provided fields
//     user.name = name || user.name;
//     user.age = age !== undefined ? age : user.age;
//     user.gender = gender || user.gender;
//     user.profilePicture = profilePicture || user.profilePicture;

//     await user.save();
//     return res.json({ user });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Error updating profile" });
//   }
// });

// export default router;



import express from "express";
import authRoutes from "./auth.js";
import userRoutes from "./users.js";

const router = express.Router();

// Mount sub-routers
router.use("/auth", authRoutes);   // -> /api/auth/*
router.use("/users", userRoutes); // -> /api/users/*

export default router;
