const bookshelf = require('../bookshelf.js')

const LegActionType = bookshelf.model('LegActionType', {
  tableName: 'legactiontype',
  idAttribute: 'latcode',
})

module.exports = LegActionType