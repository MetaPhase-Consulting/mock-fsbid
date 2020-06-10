const bookshelf = require('../bookshelf.js')

const CommuterPosts = bookshelf.model('CommuterPosts', {
  tableName: 'commuterposts',
  idAttribute: 'cpn_code',

  location1() {
    return this.belongsTo('Locations', 'location_code_1', 'location_code')
  },
  location2() {
    return this.belongsTo('Locations', 'location_code_2', 'location_code')
  },
  locations() {
    return this.hasMany('LocationsCommuterPosts', 'cpn_code')
  }
})

module.exports = CommuterPosts
