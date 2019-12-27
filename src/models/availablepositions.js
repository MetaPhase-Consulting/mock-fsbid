const bookshelf = require('../bookshelf.js')
const BidStats = require('./bidstats.js')

const AvailablePositions = bookshelf.model('AvailablePositions', {
  tableName: 'availablepositions',
  idAttribute: 'cp_id',
  
  initialize() {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on('created', async model => {
      await BidStats.forge({cp_id: model.get('cp_id')}).save()
    })
  },

  cycle() {
    return this.belongsTo('Cycles', 'cycle_id')
  },
  position() {
    return this.belongsTo('Positions', 'position', 'position')
  },
  bidstats() {
    return this.hasOne('BidStats', 'cp_id')
  },
})

module.exports = AvailablePositions