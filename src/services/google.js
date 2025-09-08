// services/google.js
const passport = require("passport");
require("dotenv").config();

const { User } = require("../db/models/index.js"); // CommonJS import
const GoogleTokenStrategy = require("passport-google-token").Strategy;

passport.use(
  new GoogleTokenStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) return done(new Error("Google account has no email"), null);

        let user = await User.findByEmail(email);

        if (!user) {
          user = await User.create({
            name: profile.displayName || email.split("@")[0],
            email,
            googleId: profile.id,
            provider: "google",
            profilePicture: profile.photos?.[0]?.value || null,
            password: null,
            emailVerified: true,
          });
        } else if (!user.googleId) {
          await user.update({ googleId: profile.id, provider: "google" });
        }

        return done(null, user);
      } catch (error) {
        console.error("Passport error:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
