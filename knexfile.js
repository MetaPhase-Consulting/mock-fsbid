require("dotenv-safe").config({ allowEmptyValues: true });

// Database setup
module.exports = {
  debug: process.env.DEBUG,
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