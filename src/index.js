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
const allowedOrigins = [
  process.env.CLIENT_URL,     // frontend from env
  "http://localhost:3000"     // always allow local
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
module.exports = app; // for testing