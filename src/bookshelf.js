// Setting up the database connection
const knex = require('knex')(require('../knexfile'))
const bookshelf = require('bookshelf')(knex) 
bookshelf.plugin('bookshelf-virtuals-plugin')

module.exports = bookshelf
