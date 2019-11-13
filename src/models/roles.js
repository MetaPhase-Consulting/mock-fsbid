const bookshelf = require('../bookshelf.js')

const Roles = bookshelf.model('Roles', {
  tableName: 'roles',
  idAttribute: 'code',
})

module.exports = Roles