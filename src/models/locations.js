const bookshelf = require('../bookshelf.js')

const Locations = bookshelf.model('Locations', {
  tableName: 'locations',
  idAttribute: 'location_code',
})

module.exports = Locations
