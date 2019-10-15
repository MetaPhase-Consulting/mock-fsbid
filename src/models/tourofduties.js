const bookshelf = require('../bookshelf.js')

const TourOfDuties = bookshelf.model('TourOfDuties', {
  tableName: 'tourofduties',
})

module.exports = TourOfDuties