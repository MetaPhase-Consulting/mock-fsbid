const bookshelf = require('../bookshelf.js')

const FutureVacancies = bookshelf.model('FutureVacancies', {
  tableName: 'futurevacancies',
  idAttribute: 'fv_seq_num',
  
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

module.exports = FutureVacancies