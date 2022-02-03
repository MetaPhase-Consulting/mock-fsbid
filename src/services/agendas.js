const _ = require('lodash')
const { AgendaItems } = require('../models')

const getAgendas = async (empData) => {
  try {
    const perdets = empData.map(e => e.perdet_seq_num);
    const data = await AgendaItems.query(qb => {
      if (Array.isArray(perdets)) {
        //grab only a single AI per perdet for all users
        qb.where('perdetseqnum', "in", perdets)
          .distinctOn('perdetseqnum')
      } else {
          qb.where('perdetseqnum', perdets)
            .distinctOn('perdetseqnum')
      }
    })
    .fetchPage({
      page: 1,
      require: false,
    })

    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { getAgendas }
