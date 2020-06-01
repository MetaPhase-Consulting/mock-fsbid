const bookshelf = require('../bookshelf.js')

const CommuterPosts = bookshelf.model('CommuterPosts', {
  tableName: 'commuterposts',
  idAttribute: 'cpn_code'
})

module.exports = CommuterPosts
