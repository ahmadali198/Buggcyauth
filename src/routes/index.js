const express = require("express");
const authRoutes = require("./auth.js");
const userRoutes = require("./users.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

module.exports = router;
