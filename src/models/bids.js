const bookshelf = require('../bookshelf.js')

const Bids = bookshelf.model('Bids', {
  tableName: 'bids',
  
  position() {
    return this.belongsTo('AvailablePositions', 'cp_id')
  },
  employee() {
    return this.belongsTo('Employees', 'perdet_seq_num')
  },
})

module.exports = Bids