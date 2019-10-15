// Setting up the database connection
const knex = require('knex')(require('../knexfile'))

module.exports = require('bookshelf')(knex)
