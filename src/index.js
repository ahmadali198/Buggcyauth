// src/index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const bodyParser = require("body-parser");

// Routes & services
const routes = require("./routes/index.js"); // CommonJS routes
require("./services/google.js");             // Passport Google strategy

const app = express();

// ✅ Dynamic allowed origins
// ✅ Dynamic allowed origins with safe fallback
const allowedOrigins = [
  process.env.CLIENT_URL || "", // empty string if not yet set
  "http://localhost:3000",     // always allow local for dev
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (Postman, curl)
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


app.get("/", (req, res) => {
  res.json({ success: true, message: "🚀 Backend is working!" });
});
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url} from origin: ${req.headers.origin || "no origin"}`);
  next();
});

// Start server
const port = process.env.PORT || 2000;
app.listen(port, () => {
  console.log(`🚀 Server running on ${process.env.BASE_URL || `http://localhost:${port}`}`);
  console.log(`✅ Allowed Frontend: ${process.env.CLIENT_URL}`);
});
module.exports = app; // for testing