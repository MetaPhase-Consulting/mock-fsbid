const bookshelf = require('../bookshelf.js')

const FutureVacancies = bookshelf.model('FutureVacancies', {
  tableName: 'futurevacancies',
  idAttribute: 'fv_seq_num',
  
  position() {
    return this.belongsTo('Positions', 'position', 'position')
  },
})

module.exports = FutureVacancies