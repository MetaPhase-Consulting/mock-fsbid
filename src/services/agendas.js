const _ = require('lodash')
const { AgendaItems } = require('../models')

const getAgendas = async (perdet, onlyLatest) => {
  try {
    const data = await AgendaItems.query(qb => {
      if (perdet) {
        qb.where('agendaitems.perdetseqnum', perdet)
      }
    }).fetchPage({
      require: false,
      pageSize: onlyLatest ? 1 : 25,
      page: 1,
    })
    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { getAgendas }
