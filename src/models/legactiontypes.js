const bookshelf = require('../bookshelf.js')

const LegActionTypes = bookshelf.model('LegActionTypes', {
  tableName: 'legactiontypes',
  idAttribute: 'latcode',
})

module.exports = LegActionTypes