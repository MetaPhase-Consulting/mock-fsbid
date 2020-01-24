const bookshelf = require('../bookshelf.js')

const Cycles = bookshelf.model('Cycles', {
  tableName: 'cycles',
  idAttribute: 'cycle_id',

  availablePosition() {
    return hasMany('AvailablePositions', 'cp_id')
  }
})

module.exports = Cycles