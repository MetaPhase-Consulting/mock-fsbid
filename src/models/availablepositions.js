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
  tod() {
    return this.belongsTo('TourOfDuties', 'tod')
  },
  lang1() {
    return this.belongsTo('Languages', 'lang1')
  },
  lang2() {
    return this.belongsTo('Languages', 'lang2')
  },
  org() {
    return this.belongsTo('Organizations', 'org_code')
  },
  location() {
    return this.belongsTo('Locations', 'pos_location_code')
  },
  bureau() {
    return this.belongsTo('Bureaus', 'bureau')
  },
  bidstats() {
    return this.hasOne('BidStats', 'cp_id')
  },
})

module.exports = AvailablePositions