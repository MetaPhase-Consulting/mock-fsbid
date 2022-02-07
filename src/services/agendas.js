const { readJson } = require('../../seeds/data/helpers')
const _ = require('lodash')
const { AgendaItems, AgendaItemLegs, AssignmentDetails, AgendaItemRemarks, PanelMeetings, PanelMeetingDates } = require('../models')
const PMIC = readJson('./panelmeetingitemcategories.json')

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
      qb.join('availablepositions', 'agendaitemlegs.cpid', 'availablepositions.cp_id')
      qb.join('legactiontypes', 'agendaitemlegs.latcode', 'legactiontypes.latcode')
      if (Array.isArray(aiSeqNums)) {
        qb.where('aiseqnum', "in", aiSeqNums)
      } else {
        qb.where('aiseqnum', aiSeqNums)
      }
    }).fetchAll({
      withRelated: ['cpid', 'latcode'],
    })
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


// 🧠 for each pmseqnum, grab the PMDT with the same pmseqnum
    let pmdtData = await PanelMeetingDates.query(qb => {
      if (Array.isArray(pmSeqNums)) {
        qb.where('pmseqnum', "in", pmSeqNums)
      } else {
        qb.where('pmseqnum', pmSeqNums)
      }
    }).fetchAll({
      require: false,
    })
    pmdtData = pmdtData.serialize()


    const res = ai_pmiData.map(ai => {
      const pmi = ai.pmiseqnum;
      const remarks = _.filter(airData, ['aiseqnum',  ai.aiseqnum]);
      const pm = _.filter(pmData, ['pmseqnum',  pmi.pmseqnum])[0];
      const pmdt = _.filter(pmdtData, ['pmseqnum',  pmi.pmseqnum])[0];
      const pms = pm.pmscode;
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
          pmpmscode: pms.pmscode,
          pmiseqnum: pmi.pmiseqnum,
          pmimiccode: pmi.miccode,
          pmsdesctext: pms.pmsdesctext,
          pmdmdtcode: pmdt.mdtcode,
          pmddttm: pmdt.pmddttm,
          micdesctext: _.find(PMIC, ['miccode', pmi.miccode])['micdesctext'],
        }],
        agendaAssignment: [
          // same as agendaLegs[0].agendaLegAssignment
          'sophie'],
        remarks: remarks.map(r => {
          return {
            airaiseqnum: r.aiseqnum,
            airrmrkseqnum: r.rmrkseqnum,
            airremarktext: r.airremarktext
          }
        }),
        creators: ['sophie'], // ⭕check if dev1 ever returns this
        updaters: [],
        agendaLegs: ails.map(l => {
          const lat = l.latcode;
          return {
            ailaiseqnum: l.aiseqnum,
            ailseqnum: l.ailseqnum,
            aillatcode: lat.latcode,
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
            ailasgdrevisionnum: l.asgdrevisionnum,
            latabbrdesctext: lat.latabbredesctext,
            latdesctext: lat.latdesctext,
            agendaLegAssignment: [
              {
                "asgposseqnum": 8463, //sophie
                "asgdasgseqnum": 134641, //assignmentdetails.asgseqnum
                "asgdrevisionnum": 1, //assignemntdetails.asgdrevisionnum
                "asgdasgscode": "EF", //assignments.asgs_code
                "asgdetadate": "2003-02-01T00:00:00", //assingmentdetails.asgdetadate
                "asgdetdteddate": "2005-08-01T00:00:00", //assingmentdetails.asgdetdteddate
                "asgdtoddesctext": "OTHER", //assignmentdetails.asgdtodothertext
                "position": [
                  {
                    "posseqnum": 8463, //positions
                    "posorgshortdesc": "DS/FLD/CFO", //position.pos_bureau_short_desc
                    "posnumtext": "S7874101", //positions.bureau -> lookup on bureau
                    "posgradecode": "04",  //positions.pos_grade_code
                    "postitledesc": "EDUCATION ASSISTANT" //position.pos_title_desc
                  }
                ]
              }
            ],
            agendaLegPosition: [
              {
                // same as agendaLegAssignment.position
                "posseqnum": 8463,
                "posorgshortdesc": "DS/FLD/CFO",
                "posnumtext": "S7874101",
                "posgradecode": "04",
                "postitledesc": "EDUCATION ASSISTANT"
              }
            ]
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
