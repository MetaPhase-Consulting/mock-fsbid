const { readJson } = require('../../seeds/data/helpers')
const _ = require('lodash')
const { AgendaItems, AgendaItemLegs, Assignments, AssignmentDetails, AgendaItemRemarks,
  Bureaus, PanelMeetings, PanelMeetingDates, PanelMeetingItemCategories } = require('../models')
const BUR = readJson('./bureaus.json')

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

const getAgendaItems = async (ai_id, perdet) => {
  try {
// grab AIs with PMI
    let ai_pmiData = await AgendaItems.query(qb => {
      qb.join('panelmeetingitems', 'agendaitems.pmiseqnum', 'panelmeetingitems.pmiseqnum')
      if(ai_id) {
        qb.where('aiseqnum', '=', ai_id);
      }
      if(perdet) {
        qb.where('perdetseqnum', '=', perdet);
      }
    }).fetchPage({
        withRelated: ['pmiseqnum'],
        pageSize: ai_id ? 1 : 50,
        page: 1,
        require: false,
      })
    ai_pmiData = ai_pmiData.serialize()
    const aiSeqNums = ai_pmiData.map(e => e.aiseqnum);
    const pmSeqNums = _.uniq(ai_pmiData.map(e => e.pmiseqnum.pmseqnum));

// for each AI grab all the AILs that match the aiseqnum
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

// for each AI grab all the AIRs that have the same aiseqnum
    let airData = await AgendaItemRemarks.query(qb => {
      if (Array.isArray(aiSeqNums)) {
        qb.where('aiseqnum', "in", aiSeqNums)
      } else {
        qb.where('aiseqnum', aiSeqNums)
      }
    }).fetchAll()
    airData = airData.serialize()

// for each AIL grab the AGSD with the same ailseqnum
    let asgdData = await AssignmentDetails.query(qb => {
      if (Array.isArray(ailSeqNums)) {
        qb.where('ailseqnum', "in", ailSeqNums)
      } else {
        qb.where('ailseqnum', ailSeqNums)
      }
    }).fetchAll()
    asgdData = asgdData.serialize()
    const asgSeqNums = asgdData.map(e => e.asgseqnum);

    // for each ASGD grab the ASG with the same asg_seq_num
    let asg_posData = await Assignments.query(qb => {
      qb.join('positions', 'assignments.pos_seq_num', 'positions.pos_seq_num')
      if (Array.isArray(asgSeqNums)) {
        qb.where('asg_seq_num', "in", asgSeqNums)
      } else {
        qb.where('asg_seq_num', asgSeqNums)
      }
    }).fetchAll(
      {withRelated: ['position'],}
    )
    asg_posData = asg_posData.serialize()

// for each unique PMI pmseqnum, grab the PM with the same pmseqnum
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


// for each pmseqnum, grab the PMDT with the same pmseqnum
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

    let pmicData = await PanelMeetingItemCategories.fetchAll({require: false})
    pmicData = pmicData.serialize()

    let burData = await Bureaus.fetchAll({require: false})
    burData = burData.serialize()


    const res = ai_pmiData.map(ai => {
      const pmi = ai.pmiseqnum;
      const remarks = _.filter(airData, ['aiseqnum',  ai.aiseqnum]);
      const pm = _.filter(pmData, ['pmseqnum',  pmi.pmseqnum])[0];
      const pmdt = _.filter(pmdtData, ['pmseqnum',  pmi.pmseqnum])[0];
      const pms = pm.pmscode;
      const ails = _.filter(ailData, ['aiseqnum',  ai.aiseqnum]);

      const agendaLegs = ails.map(l => {
        const lat = l.latcode;
        const asgd = _.filter(asgdData, {'ailseqnum': l.ailseqnum})[0];
        const as = _.filter(asg_posData, {'asg_seq_num': asgd.asgseqnum})[0];
        const pos = _.get(as, 'position') || null;
        delete as.position

        const position = {
          posseqnum: _.get(pos, 'pos_seq_num'),
          posorgshortdesc: _.get(pos, 'bureau') ?
            _.find(burData, ['bur', _.get(pos, 'bureau')])['bureau_short_desc'] : null,
          posnumtext: _.get(pos, 'position'),
          posgradecode: _.get(pos, 'pos_grade_code'),
          postitledesc: _.get(pos, 'pos_title_desc'),
        };

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
              asgposseqnum: as.pos_seq_num,
              asgdasgseqnum: asgd.asgseqnum,
              asgdrevisionnum: asgd.asgdrevisionnum,
              asgdasgscode: as.asgs_code,
              asgdetadate: asgd.asgdetadate,
              asgdetdteddate: asgd.asgdetdteddate,
              asgdtoddesctext: asgd.asgdtodothertext,
              position: [
                position
              ]
            }
          ],
          agendaLegPosition: [
            position
          ]
        }
      });


      const ret = {
        aiseqnum: ai.aiseqnum,
        aicorrectiontext: ai.aicorrectiontext,
        aicombinedremarktext: "Remarks:Critical Need Position;High Differential Post;Reassignment at post;SND Post;Continues SND eligibility;Creator(s):Townpost, Jenny Nmn;Modifier(s):WoodwardWA;CDO: Rehman, Tarek S; ;",
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
          micdesctext: _.find(pmicData, ['miccode', pmi.miccode])['micdesctext'],
        }],
        agendaAssignment: [_.get(agendaLegs, '[0].agendaLegPosition')],
        remarks: remarks.map(r => {
          return {
            airaiseqnum: r.aiseqnum,
            airrmrkseqnum: r.rmrkseqnum,
            airremarktext: r.airremarktext
          }
        }),
        creators: [],
        updaters: [],
        agendaLegs: agendaLegs
      }

      //remove extra data
      if(!ai_id){
        delete ret['Panel']
        delete ret['remarks']
        delete ret['creators']
        delete ret['updaters']
        ret.agendaLegs.forEach(l => {
          delete l['agendaLegAssignment']
          delete l['agendaLegPosition']
        })
      }

      return ret
    })

    return res
  } catch (Error) {
    console.error(Error)
  }
}

module.exports = { getAgendas, getAgendaItems }
