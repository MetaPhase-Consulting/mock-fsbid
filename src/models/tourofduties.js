const bookshelf = require('../bookshelf.js')

const TourOfDuties = bookshelf.model('TourOfDuties', {
  tableName: 'tourofduties',
  idAttribute: 'code',
})

module.exports = TourOfDuties