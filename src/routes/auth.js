// ---------------- IMPORTS ----------------
const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const AuthController = require("../controllers/AuthController.js");
const upload = require("../middleware/upload.js"); // Cloudinary-based upload
const authMiddleware = require("../middleware/authMiddleware.js");

// ---------------- ROUTER ----------------
const router = express.Router();

// ======================
// ✅ Auth routes
// ======================

// Signup route (with profile picture)
router.post("/signup", upload.single("profilePicture"), async (req, res) => {
  console.log("➡️ Signup body:", req.body);
  console.log("➡️ Signup file (Cloudinary):", req.file);

  try {
    await AuthController.signup(req, res);
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Email/password login
router.post("/login", async (req, res) => {
  console.log("➡️ Login body:", req.body);

  try {
    await AuthController.login(req, res);
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Google OAuth login
router.post(
  "/google",
  (req, res, next) => {
    console.log("➡️ Google login access_token:", req.body.access_token);
    req.query = { access_token: req.body.access_token };
    next();
  },
  passport.authenticate("google-token", { session: false }),
  async (req, res) => {
    if (!req.user) {
      console.error("❌ Google auth failed, no user returned");
      return res.status(401).json({ error: "Google authentication failed" });
    }

    console.log("✅ Google user info:", req.user);

    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      res.json({ success: true, user: req.user, token });
    } catch (err) {
      console.error("❌ JWT sign error:", err);
      res.status(500).json({ error: "Failed to generate token" });
    }
  }
);

// ======================
// ✅ Test routes
// ======================

router.get("/test", (req, res) => {
  res.json({ success: true, message: "🚀 Auth API is working!", timestamp: new Date() });
});

router.get("/test-jwt", (req, res) => {
  try {
    const testToken = jwt.sign({ id: "123", role: "test" }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token: testToken });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/test-protected", authMiddleware, (req, res) => {
  res.json({ success: true, message: "You accessed a protected route ✅", user: req.user });
});

// ---------------- EXPORT ----------------
module.exports = router;
