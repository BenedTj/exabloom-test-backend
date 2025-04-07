// Load the environment variables from the .env file
require("dotenv").config();

// Import Postgresql pool class.
const Pool = require('pg').Pool;

// Create Postgresql pool object in Javascript.
const pool = new Pool({
    user: "postgres",
    password: process.env.DB_PASSWORD,
    host: "localhost",
    port: "5432",
    database: "backend"
});

// Export the pool object.
module.exports = pool;