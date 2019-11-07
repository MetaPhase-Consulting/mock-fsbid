const bookshelf = require('../bookshelf.js')

const Cones = bookshelf.model('Cones', {
  tableName: 'cones',
  idAttribute: 'cone_id',
})

module.exports = Cones