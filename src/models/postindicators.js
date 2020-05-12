const bookshelf = require('../bookshelf.js')

const PostIndicators = bookshelf.model('PostIndicators', {
  tableName: 'postindicators',
  idAttribute: 'bt_column_name'
})

module.exports = PostIndicators
