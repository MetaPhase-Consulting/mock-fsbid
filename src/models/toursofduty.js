const bookshelf = require('../bookshelf.js')

const ToursOfDuty = bookshelf.model('ToursOfDuty', {
  tableName: 'toursofduty',
  idAttribute: 'todcode',
})

module.exports = ToursOfDuty