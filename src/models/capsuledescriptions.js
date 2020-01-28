const bookshelf = require('../bookshelf.js')

const CapsuleDescriptions = bookshelf.model('CapsuleDescriptions', {
  tableName: 'capsuledescriptions',

  position() {
    return this.belongsTo('Position', 'pos_seq_num')
  }
})

module.exports = CapsuleDescriptions