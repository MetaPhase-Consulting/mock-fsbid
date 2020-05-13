const bookshelf = require('../bookshelf.js')

const Locations = bookshelf.model('Locations', {
  tableName: 'locations',
  idAttribute: 'location_code',

  unaccompaniedstatus() {
    return this.belongsTo('UnaccompaniedStatuses', 'us_code')
  }
})

module.exports = Locations
