const bookshelf = require('../bookshelf.js')

const BidStats = bookshelf.model('BidStats', {
  tableName: 'bidstats',

  position() {
    return this.belongsTo('AvailablePositions', 'cp_id')
  },
})

module.exports = BidStats