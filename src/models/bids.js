const bookshelf = require('../bookshelf.js')

const Bids = bookshelf.model('Bids', {
  tableName: 'bids',

  initialize() {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on('saved', this._update_bid_stats)
  },

  position() {
    return this.belongsTo('AvailablePositions', 'cp_id')
  },
  employee() {
    return this.belongsTo('Employees', 'perdet_seq_num')
  },
  cycle() {
    return this.belongsTo('Cycles').through('position')
  },

  _update_bid_stats(model) {
    // Updates the bid stats based on the user for whom the bid is for
    const status = model.get('bs_cd')
    // Do nothing if this is a draft bid
    if (status !== 'W') {
      // Update the bid stats for the position
      Promise.all([
        model.position().fetch({ withRelated: ['bidstats', 'position']}),
        model.employee().fetch({ withRelated: ['skills']})
      ])
      .then(values => {
        const available_position = values[0]
        const employee = values[1]
        const position = available_position.related('position')
        const at_grade = position.get('pos_grade_code') === employee.get('grade_code')
        const skill = position.related('skill')
        const in_skill = employee._has_skill_code(skill.get('skl_code'))
        const at_grade_in_skill = at_grade && in_skill

        const bidstats = available_position.related('bidstats')
        let cp_ttl_bidder_qty = bidstats.get('cp_ttl_bidder_qty')
        let cp_at_grd_qty = bidstats.get('cp_at_grd_qty')
        let cp_in_cone_qty = bidstats.get('cp_in_cone_qty')
        let cp_at_grd_in_cone_qty = bidstats.get('cp_at_grd_in_cone_qty')
        if (status === 'A') {
          cp_ttl_bidder_qty += 1
          cp_at_grd_qty += 1
          cp_in_cone_qty += 1
          cp_at_grd_in_cone_qty += 1
        } else if (status === 'D') {
          cp_ttl_bidder_qty -= 1
          cp_at_grd_qty -= 1
          cp_in_cone_qty -= 1
          cp_at_grd_in_cone_qty -= 1
        }
        bidstats.set('cp_ttl_bidder_qty', cp_ttl_bidder_qty)
        if (at_grade) bidstats.set('cp_at_grd_qty', cp_at_grd_qty)
        if (in_skill) bidstats.set('cp_in_cone_qty', cp_in_cone_qty)
        if (at_grade_in_skill) bidstats.set('cp_at_grd_in_cone_qty', cp_at_grd_in_cone_qty)
        
        return bidstats.save()
      })
    }
  }
})

module.exports = Bids