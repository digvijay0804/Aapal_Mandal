require("dotenv").config();

const { Pool } = require("pg");

const isProduction =
    process.env.NODE_ENV === "production";

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,

    ...(isProduction
        ? {
              ssl: {
                  rejectUnauthorized: false,
              },
          }
        : {}),
});

module.exports = pool;