const bookshelf = require('../bookshelf.js')

const Remarks = bookshelf.model('Remarks', {
  tableName: 'remarks',
  idAttribute: 'rmrkseqnum',

  RemarkInserts() {
    return this.hasMany('RemarksInsertionText', 'rirmrkseqnum')
  },
})

module.exports = Remarks