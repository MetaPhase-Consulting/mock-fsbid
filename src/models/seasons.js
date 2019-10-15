const bookshelf = require('../bookshelf.js')

const Seasons = bookshelf.model('Seasons', {
  tableName: 'seasons',
})

module.exports = Seasons