const bookshelf = require('../bookshelf.js')

const Classifications = bookshelf.model('Classifications', {
  tableName: 'classifications',
  idAttribute: 'td_id',

})

module.exports = Classifications