
require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "your_username",   // e.g. postgres
    password: process.env.DB_PASS || "your_password",   // password you set during installation
    database: process.env.DB_NAME || "your_db_name",    // e.g. myappdb
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
    port: process.env.DB_PORT || 5433,
    logging: console.log, // optional: shows SQL in console
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
