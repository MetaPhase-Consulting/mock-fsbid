const bookshelf = require('../bookshelf.js')

const CommuterPosts = bookshelf.model('CommuterPosts', {
  tableName: 'commuterposts',
  idAttribute: 'cpn_code',

  location() {
    return this.belongsTo('Locations', 'location_code_1', 'location_code')
  },

  locations() {
    return this.hasMany('LocationsCommuterPosts', 'cpn_code')
  }
})

module.exports = CommuterPosts
