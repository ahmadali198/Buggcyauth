import jwt from "jsonwebtoken";
import { User } from "../db/models/index.js";
import fs from "fs";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const signToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const AuthController = {
  // ---------------- SIGNUP ----------------
  async signup(req, res) {
    try {
      let { name, email, password, age, gender } = req.body;
      if (!email || !password) {
        return res.status(400).send({ error: "Email and password required" });
      }

      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(409).send({ error: "Email already registered" });
      }

      // 🌩️ Upload to Cloudinary if file present
    let profilePicture = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file);
        profilePicture = result.secure_url; // ✅ hosted image URL
      } catch (cloudErr) {
        console.error("❌ Cloudinary upload error:", cloudErr);
        return res.status(500).send({ error: "Image upload failed" });
      }
    }


      const user = await User.create({
        name: name?.trim() || email.split("@")[0],
        email: email.trim().toLowerCase(),
        password, // raw password
        provider: "local",
        profilePicture,
        age: age || null,
        gender: gender || null,
        emailVerified: true,
      });

      const token = signToken(user);
      return res.status(201).send({ token, user: user.toJSON() });
    } catch (err) {
      console.error("❌ Signup error details:", err);
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(500).send({
        error: "Signup failed",
        details: err.message,
      });
    }
  },

  // ---------------- LOGIN ----------------
// ---------------- LOGIN ----------------
async login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({ error: "Email and password required" });
    }

    const user = await User.findByEmail(email);

    // Combined check for invalid email or password
    if (!user || (user.provider === "local" && password !== user.password)) {
      return res.status(401).send({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    return res.status(200).send({ token, user: user.toJSON() });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).send({ error: "Login failed" });
  }
},

  // ---------------- GOOGLE LOGIN ----------------
  async googleLogin(req, res) {
    try {
      if (!req.user) {
        return res.status(401).send({ error: "User not authenticated" });
      }

      const { id: googleId, displayName, emails, photos } = req.user;
      const email = emails?.[0]?.value?.toLowerCase();

      if (!email) {
        return res.status(400).send({ error: "Google account has no email" });
      }

      let user = await User.findByEmail(email);

      if (!user) {
        // Create Google user without password
        user = await User.create({
          name: displayName || email.split("@")[0],
          email,
          googleId,
          provider: "google",
          profilePicture: photos?.[0]?.value || null,
          password: null,
          emailVerified: true,
        });
      } else if (!user.googleId) {
        // Link Google account if local user exists
        await user.update({ googleId, provider: "google" });
      }

      const token = signToken(user);
      return res.status(200).send({ token, user: user.toJSON() });
    } catch (err) {
      console.error("Google login error:", err);
      return res.status(500).send({ error: "Internal server error" });
    }
  },
};

export default AuthController;
