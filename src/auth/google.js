// // auth/google.js
// import express from "express";
// import passport from "passport";
// import AuthController from "../controllers/AuthController.js";

// const router = express.Router();

// // Route for Google login with access token
// router.post(
//   "/",
//   (req, res, next) => {
//     req.query = { access_token: req.body.access_token };
//     next();
//   },
//   passport.authenticate("google-token", { session: false }),
//   AuthController.googleLogin
// );

// export default router;
