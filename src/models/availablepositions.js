const bookshelf = require('../bookshelf.js')

const AvailablePositions = bookshelf.model('AvailablePositions', {
  tableName: 'availablepositions',
  idAttribute: 'cp_id',
  
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
  }
})

module.exports = AvailablePositions