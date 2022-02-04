const _ = require('lodash')
const { AgendaItems, AgendaItemLegs, AssignmentDetails, AgendaItemRemarks, PanelMeetings } = require('../models')

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
    }).fetchAll()
    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const getAgendaItems = async () => {
  try {
// 🧠 grab AIs with PMI
    let ai_pmiData = await AgendaItems.query(qb => {
      qb.join('panelmeetingitems', 'agendaitems.pmiseqnum', 'panelmeetingitems.pmiseqnum')
    }).fetchPage({
        withRelated: ['pmiseqnum'],
        pageSize: 5, //TODO: update after building ⭕
        page: 1,
        require: false,
      })
    ai_pmiData = ai_pmiData.serialize()
    const aiSeqNums = ai_pmiData.map(e => e.aiseqnum);
    const pmSeqNums = _.uniq(ai_pmiData.map(e => e.pmiseqnum.pmseqnum));

// 🧠  for each AI grab all the AILs that match the aiseqnum
    let ailData = await AgendaItemLegs.query(qb => {
      if (Array.isArray(aiSeqNums)) {
        qb.where('aiseqnum', "in", aiSeqNums)
      } else {
        qb.where('aiseqnum', aiSeqNums)
      }
    }).fetchAll()
    ailData = ailData.serialize()
    const ailSeqNums = ailData.map(e => e.ailseqnum);

// 🧠  for each AI grab all the AIRs that have the same aiseqnum
    let airData = await AgendaItemRemarks.query(qb => {
      if (Array.isArray(aiSeqNums)) {
        qb.where('aiseqnum', "in", aiSeqNums)
      } else {
        qb.where('aiseqnum', aiSeqNums)
      }
    }).fetchAll()
    airData = airData.serialize()

// 🧠 for each AIL grab the AGSD with the same ailseqnum
    let asgdData = await AssignmentDetails.query(qb => {
      if (Array.isArray(ailSeqNums)) {
        qb.where('ailseqnum', "in", ailSeqNums)
      } else {
        qb.where('ailseqnum', ailSeqNums)
      }
    }).fetchAll()
    asgdData = asgdData.serialize()

// 🧠 for each unique PMI pmseqnum, grab the PM with the same pmseqnum
// with related on pmscode and pmtcode
    let pmData = await PanelMeetings.query(qb => {
      if (Array.isArray(pmSeqNums)) {
        qb.where('pmseqnum', "in", pmSeqNums)
        qb.join('panelmeetingstatuses', 'panelmeetings.pmscode', 'panelmeetingstatuses.pmscode')
        qb.join('panelmeetingtypes', 'panelmeetings.pmtcode', 'panelmeetingtypes.pmtcode')
      } else {
        qb.where('pmseqnum', pmSeqNums)
        qb.join('panelmeetingstatuses', 'panelmeetings.pmscode', 'panelmeetingstatuses.pmscode')
        qb.join('panelmeetingtypes', 'panelmeetings.pmtcode', 'panelmeetingtypes.pmtcode')
      }
    }).fetchAll({
      withRelated: ['pmscode', 'pmtcode'],
      require: false,
    })
    pmData = pmData.serialize()


    const res = ai_pmiData.map(ai => {
      const pmi = ai.pmiseqnum;
      const remarks = _.filter(airData, ['aiseqnum',  ai.aiseqnum]);
      const pm = _.filter(pmData, ['pmseqnum',  pmi.pmseqnum]);
      const ails = _.filter(ailData, ['aiseqnum',  ai.aiseqnum]);
      console.log('🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄')
      console.log(ails)
      console.log('🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄🦄')
      const ret = {
        aiseqnum: ai.aiseqnum,
        aicorrectiontext: ai.aicorrectiontext,
        aicombinedtodothertext: ai.aicombinedtodothertext,
        aitodcode: ai.todcode,
        aitoddesctext: ai.toddesctext,
        aiperdetseqnum: ai.perdetseqnum,
        aipmiseqnum: pmi.pmiseqnum,
        aiitemcreatorid: ai.aiitemcreatorid,
        aiupdateid: ai.aiupdateid,
        Panel: [{
          pmseqnum: pm.pmseqnum,
          pmpmscode: pm.pmscode,
          pmiseqnum: pmi.pmiseqnum,
          pmimiccode: pmi.miccode,
          pmsdesctext: 'sophie',
          pmdmdtcode: 'sophie',
          pmddttm: 'sophie',
          micdesctext: 'sophie',
        }],
        agendaAssignment: ['sophie'],
        remarks: remarks.map(r => {
          return {
            airaiseqnum: r.aiseqnum,
            airrmrkseqnum: r.rmrkseqnum,
            airremarktext: r.airremarktext
          }
        }),
        creators: ['sophie'],
        updaters: [],
        agendaLegs: ails.map(l => {
          return {
            ailaiseqnum: l.aiseqnum,
            ailseqnum: l.ailseqnum,
            aillatcode: l.latcode,
            ailcpid: l.cpid,
            ailtodcode: l.todcode,
            ailposseqnum: l.posseqnum,
            ailperdetseqnum: l.perdetseqnum,
            ailtodmonthsnum: l.ailtodmonthsnum,
            ailtodothertext: l.ailtodothertext,
            ailetadate: l.ailetadate,
            ailetdtedsepdate: l.ailetdtedsepdate,
            ailcitytext: l.ailcitytext,
            ailcountrystatetext: l.ailcountrystatetext,
            ailasgseqnum: l.asgseqnum,
          }
        }),
      }
      return ret
    })

    return res
  } catch (Error) {
    console.error(Error)
  }
}

module.exports = { getAgendas, getAgendaItems }
