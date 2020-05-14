const bookshelf = require('../bookshelf.js')

const UnaccompaniedStatuses = bookshelf.model('UnaccompaniedStatuses', {
  tableName: 'unaccompaniedstatuses',
  idAttribute: 'us_code'
})

module.exports = UnaccompaniedStatuses
