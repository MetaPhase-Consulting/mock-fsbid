const bookshelf = require('../bookshelf.js')

const DangerPays = bookshelf.model('DangerPays', {
  tableName: 'dangerpays',
})

module.exports = DangerPays