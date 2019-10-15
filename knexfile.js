require("dotenv-safe").config();

// Database setup
module.exports = {
  client: 'pg',
  connection: {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    database : process.env.DB_NAME,
    password : process.env.DB_PASSWORD,
    port     : process.env.DB_PORT,
    charset  : process.env.DB_CHARSET
  }
}