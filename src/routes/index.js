const express = require("express");
const authRoutes = require("./auth.js");
const userRoutes = require("./users.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 API Root is working!",
    routes: {
      auth: "/api/auth",
      users: "/api/users",
      testAuth: "/api/auth/test-protected"
    }
  });
});

module.exports = router;
