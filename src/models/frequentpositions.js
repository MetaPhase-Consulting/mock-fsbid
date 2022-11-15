const bookshelf = require('../bookshelf.js')

const FrequentPositions = bookshelf.model('FrequentPositions', {
  tableName: 'frequentpositions',
  idAttribute: 'posseqnum',
})

module.exports = FrequentPositions