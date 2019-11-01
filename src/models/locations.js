const bookshelf = require('../bookshelf.js')

const Locations = bookshelf.model('Locations', {
  tableName: 'locations',
  idAttribute: 'code',
})

module.exports = Locations