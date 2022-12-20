const bookshelf = require('../bookshelf.js')

const FrequentPositions = bookshelf.model('FrequentPositions', {
  tableName: 'frequentpositions',
  idAttribute: 'posseqnum',

  position() {
    return this.belongsTo('Positions', 'posseqnum', 'pos_seq_num')
  },
})

module.exports = FrequentPositions