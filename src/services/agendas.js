const _ = require('lodash')
const { AgendaItems } = require('../models')

const get_agendas_query = () => {
  return AgendaItems.query(qb => {
    qb.join('agendaitemlegs', 'agendaitems.aiseqnum', 'agendaitemlegs.aiseqnum')
  })
}



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

const getAgendaItems = async () => {
  try {
    const data = await get_agendas_query()
    .fetchPage({
      pageSize: 100,
      page: 1,
      require: false,
    })
    const data$ = data.serialize()
    const res = data$.map(d => {
      const ret = {
        aiseqnum: d.aiseqnum,
        aicorrectiontext: d.aicorrectiontext,
        // aicombinedremarktext: "we dont really want this",
        aicombinedtodothertext: d.aicombinedtodothertext,
        aitodcode: d.todcode,
        aitoddesctext: d.toddesctext,
        //sophie
        aiasgseqnum: null,
        aiasgdrevisionnum: null,
        aiperdetseqnum: 416657,
        aipmiseqnum: 236,
        aiitemcreatorid: null,
        aiupdateid: 1,
        aisdesctext: "Approved",
        rnum: 20,
        agendaAssignment: [],
        agendaLegs: [
          {
          ailaiseqnum: 236,
          aillatcode: "E",
          ailtfcd: "8150",
          ailcpid: null,
          ailperdetseqnum: null,
          ailseqnum: 282,
          ailposseqnum: 42658,
          ailtodcode: "X",
          ailtodmonthsnum: 6,
          ailtodothertext: "six months                                                  ",
          ailetadate: "2004-09-01T00:00:00",
          ailetdtedsepdate: "2005-03-01T00:00:00",
          aildsccd: null,
          ailcitytext: "                                        ",
          ailcountrystatetext: "                         ",
          ailusind: " ",
          ailasgseqnum: 153256,
          ailasgdrevisionnum: 1,
          ailsepseqnum: null,
          ailsepdrevisionnum: null,
          latabbrdesctext: "Reassign",
          latdesctext: "Reassign",
          agendaLegAssignment: [
            {
              asgposseqnum: 42658,
              asgdasgseqnum: 153256,
              asgdrevisionnum: 1,
              asgdasgscode: "AP",
              asgdetadate: "2004-09-01T00:00:00",
              asgdetdteddate: "2005-03-01T00:00:00",
              asgdtoddesctext: "OTHER",
              position: [
                {
                  posseqnum: 42658,
                  posorgshortdesc: "GTM/FSSI",
                  posnumtext: "S0000209",
                  posgradecode: "00",
                  postitledesc: "Spcl Coordinator for Democracy"
                }
              ]
            }
          ]
        }
        ]
      }
      return ret
    })

    console.log("++++++++++++++++++++")
    console.log(res);
    console.log("++++++++++++++++++++")
    return res
  } catch (Error) {
    console.error(Error)
  }
}

module.exports = { getAgendas, getAgendaItems }
