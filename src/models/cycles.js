const bookshelf = require('../bookshelf.js')

const Cycles = bookshelf.model('Cycles', {
  tableName: 'cycles',
})

module.exports = Cycles