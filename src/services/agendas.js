const _ = require('lodash')
const { pmdNameMapping } = require('./common.js')
const { AgendaItems, AgendaItemLegs, Assignments, AssignmentDetails, AgendaItemRemarks, AgendaItemStatuses,
  Bureaus, PanelMeetings, PanelMeetingDates, PanelMeetingItemCategories } = require('../models')

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

const getAgendaItems = async (ai_id, perdet, pmseqnum) => {
  try {
// grab AIs with PMI
    let ai_pmiData = await AgendaItems.query(qb => {
      qb.join('panelmeetingitems', 'agendaitems.pmiseqnum', 'panelmeetingitems.pmiseqnum')
      qb.join('agenda_item_statuses', 'agendaitems.aiscode', 'agenda_item_statuses.aiscode')
      if(ai_id) {
        qb.where('aiseqnum', '=', ai_id);
      }
      if(perdet) {
        qb.where('perdetseqnum', '=', perdet);
      }
      if(pmseqnum) {
        qb.where('pmseqnum', '=', pmseqnum);
      }
    }).fetchPage({
        withRelated: ['pmiseqnum', 'aiscode'],
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
// with related on pmscode and pmpmtcode
    let pmData = await PanelMeetings.query(qb => {
      if (Array.isArray(pmSeqNums)) {
        qb.where('pmseqnum', "in", pmSeqNums)
        qb.join('panelmeetingstatuses', 'panelmeetings.pmscode', 'panelmeetingstatuses.pmscode')
        qb.join('panelmeetingtypes', 'panelmeetings.pmpmtcode', 'panelmeetingtypes.pmpmtcode')
      } else {
        qb.where('pmseqnum', pmSeqNums)
        qb.join('panelmeetingstatuses', 'panelmeetings.pmscode', 'panelmeetingstatuses.pmscode')
        qb.join('panelmeetingtypes', 'panelmeetings.pmpmtcode', 'panelmeetingtypes.pmpmtcode')
      }
    }).fetchAll({
      withRelated: ['pmscode', 'pmpmtcode'],
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
      const aiStatus = _.get(ai, 'aiscode.aisdesctext')

      const defaultEF = [
        {
          "asgposseqnum": 7412,
          "asgdasgseqnum": 1664,
          "asgdrevisionnum": 4,
          "asgdasgscode": "EF",
          "asgdetadate": "2021-10-06T00:00:00.000Z",
          "asgdetdteddate": "2023-05-01T00:00:00",
          "asgdtoddesctext": "3 YRS (2 R & R)",
          "position": [
            {
              "posseqnum": 7412,
              "posorgshortdesc": "DGHR",
              "posnumtext": "S7713900",
              "posgradecode": "00",
              "postitledesc": "INFORMATION MANAGEMENT SPECIAL",
              "poslanguage1code": "HU",
              "poslanguage1desc": "HUNGARIAN",
              "posspeakproficiency1code": "3",
              "posreadproficiency1code": "3",
              "poslanguage2code": "AE",
              "poslanguage2desc": "ARABIC EGYPTIAN",
              "posspeakproficiency2code": "2",
              "posreadproficiency2code": "2"
 
            }
          ]
        }
      ]

      const agendaLegs = ails.map(l => {
        const lat = l.latcode;
        const asgd = _.filter(asgdData, {'ailseqnum': l.ailseqnum})[0];
        let as = _.filter(asg_posData, {'asg_seq_num': asgd.asgseqnum})[0];
        const pos = _.get(as, 'position') || null;
        as = _.omit(as, ['position'])

        const position = {
          posseqnum: _.get(pos, 'pos_seq_num'),
          posorgshortdesc: _.get(pos, 'bureau') ?
            _.find(burData, ['bur', _.get(pos, 'bureau')])['bureau_short_desc'] : null,
          posnumtext: _.get(pos, 'position'),
          posgradecode: _.get(pos, 'pos_grade_code'),
          postitledesc: _.get(pos, 'pos_title_desc'),
          poslanguage1code: "HU",
          poslanguage1desc: "HUNGARIAN",
          posspeakproficiency1code: "3",
          posreadproficiency1code: "3",
          poslanguage2code: "AE",
          poslanguage2desc: "ARABIC EGYPTIAN",
          posspeakproficiency2code: "2",
          posreadproficiency2code: "2"
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
          latabbrdesctext: lat.latabbrdesctext,
          latdesctext: lat.latdesctext,
          agendaLegAssignment: [
            {
              asgposseqnum: as.pos_seq_num || 84903,
              asgdasgseqnum: asgd.asgseqnum || 274115,
              asgdrevisionnum: asgd.asgdrevisionnum || 4,
              asgdasgscode: as.asgs_code || "EF",
              asgdetadate: asgd.asgdetadate || "2019-05-01T00:00:00",
              asgdetdteddate: asgd.asgdetdteddate || "2023-05-01T00:00:00",
              asgdtoddesctext: asgd.asgdtodothertext || "2 YRS/HLRT/2 YRS",
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
        aisdesctext: aiStatus,
        Panel: [{
          pmseqnum: pm.pmseqnum,
          pmpmscode: pms.pmscode,
          pmiseqnum: pmi.pmiseqnum,
          pmimiccode: pmi.miccode,
          pmsdesctext: pms.pmsdesctext,
          pmdmdtcode: pmdt.mdtcode,
          pmddttm: pmdt.pmddttm,
          micdesctext: _.find(pmicData, ['miccode', pmi.miccode])['micdesctext'],
          pmtcode: _.get(pm, 'pmpmtcode.pmpmtcode'),
        }],
        agendaAssignment: _.get(agendaLegs, '[0].agendaLegAssignment') ? _.get(agendaLegs, '[0].agendaLegAssignment') : defaultEF,
        remarks: remarks.map(r => {
          return {
            airaiseqnum: r.aiseqnum,
            airrmrkseqnum: r.rmrkseqnum,
            airremarktext: r.airremarktext
          }
        }),
        creators: [
          {
            "hruempseqnbr": null,
            "hruneuid": 87496,
            "hruid": 65426,
            "neuid": 87496,
            "neulastnm": "Woodward",
            "neufirstnm": "Wendy",
            "neumiddlenm": "Cléopatre",
            "empUser": [
              {
                "perpiifirstname": "Jenny",
                "perpiilastname": "Townpost",
                "perpiiseqnum": 9852,
                "perpiimiddlename": "Yénora",
                "perpiisuffixname": " ",
                "perdetseqnum": 642572,
                "persdesc": "Retired"
              }
            ]
          }
        ],
        updaters: [
          {
            "hruempseqnbr": null,
            "hruneuid": 87496,
            "hruid": 65426,
            "neuid": 87496,
            "neulastnm": "Woodward",
            "neufirstnm": "Wendy",
            "neumiddlenm": "Cléopatre",
            "empUser": [
              {
                "perpiifirstname": "Jenny",
                "perpiilastname": "Townpost",
                "perpiiseqnum": 9852,
                "perpiimiddlename": "Yénora",
                "perpiisuffixname": " ",
                "perdetseqnum": 642572,
                "persdesc": "Retired"
              }
            ]
          }
        ],
        agendaLegs: agendaLegs
      }
      return ret
    })

    return res
  } catch (Error) {
    console.error(Error)
  }
}

const getPanelDates = async (filsCols, query) => {
  try {
    let pmdtData = await PanelMeetingDates.query(qb => {
      qb.join('panelmeetings', 'panelmeetingdates.pmseqnum', 'panelmeetings.pmseqnum')
      if(filsCols['filters'].length) {
        filsCols['filters'].map(fc => {
          return qb.where(fc.name, fc.method, fc.value);
        })
      }
    }).fetchPage({
      withRelated: ['pmseqnum'],
      require: false,
      pageSize: query['rp.pageRows'] || 25,
      page: query['rp.pageNum'] || 1,
    })

    pmdtData = pmdtData.serialize()

    pmdtData = pmdtData.map(p => {
      let pmseqnumNode = p['pmseqnum']
      delete p['pmseqnum']
      const merged = _.merge(pmseqnumNode, p)

      return _.mapKeys(merged, function(value, key) {
        return pmdNameMapping(key, true);
      })
    })

    const setCols = [
      'pmdpmseqnum',
      'pmddttm',
      'pmpmtcode'
    ];

    const colsToPick = _.union(setCols, filsCols['columns'])

    pmdtData = pmdtData.map(pd => _.pick(pd, colsToPick))

    return pmdtData
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const getPanels = async (filsCols, query) => {
  let numOfResults = query['rp.pageRows'];

  numOfResults = Number.isInteger(parseInt(numOfResults)) ? numOfResults * 7 : 200;

  try {
      let panelMeetingsData = await PanelMeetings.query(qb => {
      qb.join('panelmeetingstatuses', 'panelmeetings.pmscode', 'panelmeetingstatuses.pmscode')
      qb.join('panelmeetingtypes', 'panelmeetings.pmpmtcode', 'panelmeetingtypes.pmpmtcode')
      qb.join('panelmeetingdates', 'panelmeetings.pmseqnum', 'panelmeetingdates.pmseqnum')
      qb.join('panelmeetingdatetypes', 'panelmeetingdates.mdtcode', 'panelmeetingdatetypes.mdtcode')
      qb.select('panelmeetings.pmseqnum',
                'panelmeetings.pmscode',
                'panelmeetings.pmpmtcode',
                'panelmeetings.pmvirtualind',
                'panelmeetingstatuses.pmsdesctext',
                'panelmeetingtypes.pmtdesctext',
                'panelmeetingdates.mdtcode',
                'panelmeetingdates.pmddttm',
                'panelmeetingdatetypes.mdtdesctext',
                'panelmeetingdatetypes.mdtordernum')
      let filterTable = {
        'pmseqnum': 'panelmeetings.pmseqnum',
        'pmscode': 'panelmeetings.pmscode',
        'pmpmtcode': 'panelmeetings.pmpmtcode',
      };
      filsCols['filters'].map(fc => {
        return qb.where(filterTable[fc.name], fc.method, fc.value);
      })
    }).fetchPage({
        withRelated: ['dates', 'dates.mdtcode'],
        pageSize: numOfResults,
        page: query['rp.pageNum'] || 1,
      });

    panelMeetingsData = panelMeetingsData.serialize();
    panelMeetingsData = panelMeetingsData.map(a => {
      let panelMeetingDatesData = a.dates.map(d => {
        return {
          'pmdpmseqnum': d.pmseqnum,
          'pmdmdtcode': d.mdtcode.mdtcode,
          'pmddttm': d.pmddttm,
          'mdtcode': d.mdtcode.mdtcode,
          'mdtdesctext': d.mdtcode.mdtdesctext,
          'mdtordernum': d.mdtcode.mdtordernum,
        }});

      return {
        'pmseqnum': a.pmseqnum,
        'pmvirtualind': a.pmvirtualind,
        'pmcreateid': 8,
        'pmcreatedate': '2023-01-05T16:34:55',
        'pmupdateid': 105163,
        'pmupdatedate': '2023-01-05T16:34:55',
        'pmpmscode': a.pmscode,
        'pmpmtcode': a.pmpmtcode,
        'pmtdesctext': a.pmtdesctext,
        'pmsdesctext': a.pmsdesctext,
        'panelMeetingDates': panelMeetingDatesData,
      }
      });

    return panelMeetingsData;
  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { getAgendas, getAgendaItems, getPanelDates, getPanels }
