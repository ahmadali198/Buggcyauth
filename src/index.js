import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import logger from "morgan";
import express from "express";
import bodyParser from "body-parser";

import routes from "./routes/index.js";
import "./services/google.js";

const app = express();

// ✅ Dynamic allowed origins
const allowedOrigins = [
  process.env.CLIENT_URL,     // frontend from env (localhost in dev, vercel in prod)
  "http://localhost:3000"     // always allow local for safety
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger("dev"));

// Routes
app.use("/api", routes);

// Start server
const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`🚀 Server running on ${process.env.BASE_URL || `http://localhost:${port}`}`);
  console.log(`✅ Allowed Frontend: ${process.env.CLIENT_URL}`);
});
