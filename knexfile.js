// Database setup
module.exports = {
  debug: process.env.DEBUG,
  client: process.env.DB_CLIENT,
  connection: {
    host     : process.env.DB_HOST,
    user     : process.env.DB_USER,
    database : process.env.DB_NAME,
    password : process.env.DB_PASSWORD,
    port     : process.env.DB_PORT,
    charset  : process.env.DB_CHARSET,
    filename  : process.env.DB_FILENAME,
  }
}