const bookshelf = require('../bookshelf.js')

const DifferentialRates = bookshelf.model('DifferentialRates', {
  tableName: 'differentialrates',
})

module.exports = DifferentialRates