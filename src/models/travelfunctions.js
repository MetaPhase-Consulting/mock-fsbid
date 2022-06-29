const bookshelf = require('../bookshelf.js')

const TravelFunctions = bookshelf.model('TravelFunctions', {
  tableName: 'travelfunctions',
  idAttribute: 'tfcd',
})

module.exports = TravelFunctions