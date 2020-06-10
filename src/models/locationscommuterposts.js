const bookshelf = require('../bookshelf.js')

const LocationsCommuterPosts = bookshelf.model('LocationsCommuterPosts', {
  tableName: 'locations_commuterposts',

  commuterpost() {
    return this.belongsTo('CommuterPosts', 'cpn_code')
  },
  location() {
    return this.belongsTo('Locations', 'location_code')
  }
})

module.exports = LocationsCommuterPosts
