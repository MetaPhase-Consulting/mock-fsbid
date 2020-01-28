const bookshelf = require('../bookshelf.js')

const Positions = bookshelf.model('Positions', {
  tableName: 'positions',
  idAttribute: 'pos_seq_num',
  
  tod() {
    return this.belongsTo('TourOfDuties', 'tod')
  },
  lang1() {
    return this.belongsTo('Languages', 'lang1')
  },
  lang2() {
    return this.belongsTo('Languages', 'lang2')
  },
  org() {
    return this.belongsTo('Organizations', 'org_code')
  },
  location() {
    return this.belongsTo('Locations', 'pos_location_code')
  },
  bureau() {
    return this.belongsTo('Bureaus', 'bureau')
  },
  skill() {
    return this.belongsTo('Codes', 'jc_id')
  },
  capsuledescription() {
    return this.hasOne('CapsuleDescriptions', 'pos_seq_num')
  }
})

module.exports = Positions