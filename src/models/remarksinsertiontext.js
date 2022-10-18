const bookshelf = require('../bookshelf.js')

const RemarksInsertionText = bookshelf.model('RemarksInsertionText', {
  tableName: 'remarksinsertiontext',
  idAttribute: 'riseqnum',

  rirmrkseqnum() {
    return this.belongsTo('Remarks', 'rirmrkseqnum')
  },
})

module.exports = RemarksInsertionText