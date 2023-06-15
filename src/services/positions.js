const _ = require('lodash')

const { Positions, Assignments } = require('../models')
const { CapsuleDescription } = require('../models')
const { formatLanguage } = require('./common')


const formatData = (data) => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }

    return data.map(d => {
      const { lang1, lang2, org, location, bureau, skill, skill2 } = d
      return {
        "pos_seq_num": d.pos_seq_num,
        "pos_num_text": d.position,
        "pos_title_code": "00301 ",
        "pos_title_desc": d.pos_title_desc,
        "pos_org_code": org.code,
        "pos_org_short_desc": org.short_desc,
        "pos_org_long_desc": org.long_desc,
        "pos_bureau_code": bureau.bur,
        "pos_bureau_short_desc": bureau.bureau_short_desc,
        "pos_bureau_long_desc": bureau.bureau_long_desc,
        "pos_skill_code": skill.skl_code,
        "pos_skill_desc": skill.skl_descr,
        "pos_staff_ptrn_skill_code": " ",
        "pos_staff_ptrn_skill_desc": " ",
        "pos_overseas_ind": "D",
        "pos_pay_plan_code": "GS",
        "pos_pay_plan_desc": "General Sc",
        "pos_status_code": "A",
        "pos_status_desc": "Approved",
        "pos_service_type_code": "C",
        "pos_service_type_desc": "Civil",
        "pos_grade_code": d.pos_grade_code,
        "pos_grade_desc": "Genl Sched Special Sal Rate",
        "pos_post_code": "R",
        "pos_language_1_code": lang1.language_code,
        "pos_language_1_desc": lang1.language_long_desc,
        "pos_language_2_code": lang2.language_code,
        "pos_language_2_desc": lang2.language_long_desc,
        "pos_location_code": location.location_code,
        "pos_lang_req_1_code": null,
        "pos_lang_req_1_desc": " ",
        "pos_lang_req_2_code": null,
        "pos_lang_req_2_desc": " ",
        "pos_speak_proficiency_1_code": null,
        "pos_read_proficiency_1_code": null,
        "pos_speak_proficiency_2_code": null,
        "pos_read_proficiency_2_code": null,
        "pos_job_category_desc": null,
        "pos_position_lang_prof_code": null,
        "pos_position_lang_prof_desc": null,
        "pos_create_id": "IDB",
        "pos_create_date": "2016-03-02T02:34:16",
        "pos_update_id": "IDB",
        "pos_update_date": "2020-12-12T06:29:20",
        "pos_effective_date": "2017-02-14T00:00:00",
        "pos_jobcode_code": "S04072",
        "pos_occ_series_code": "00301",
        "rnum": 1
      }
    })
  }
}



const RELATED = [
  'lang1',
  'lang2',
  'org',
  'location',
  'bureau',
  'skill',
  'skill2'
]


async function get_position_by_id(query) {
  const id = _.get(query, 'request_params.pos_seq_num', '')
  const data = await new Positions({ pos_seq_num: id })
    .fetch({
      withRelated: RELATED,
      require: false,
    })
  const results = data ? formatData(data.serialize()) : []
  
  return {
    "Data": results,
    "usl_id": 44999637,
    "return_code": 0
  }
}

async function get_position_by_pos_num(query) {
  const filterArg = query['rp.filter'].split('|')
  const pos_num = filterArg[2]
  const data = await new Positions({ position: pos_num })
      .fetch({
        withRelated: RELATED,
        require: false,
      })
  const results = data ? formatData(data.serialize()) : []
  const results$ = results.map(p => ({
    'posseqnum': p.pos_seq_num,
    'posorgshortdesc': p.pos_org_short_desc,
    'posnumtext': p.pos_num_text,
    'posgradecode': p.pos_grade_code,
    'postitledesc': p.pos_title_desc,
    'poslanguage1code': 'HU',
    'poslanguage1desc': 'HUNGARIAN',
    'posspeakproficiency1code': '3',
    'posreadproficiency1code': '3',
    'poslanguage2code': 'AE',
    'poslanguage2desc': 'ARABIC EGYPTIAN',
    'posspeakproficiency2code': '2',
    'posreadproficiency2code': '2'
  }))

  return {
    "Data": results$,
    "usl_id": 44999637,
    "return_code": 0
  }
}

async function get_vice_position_by_pos_seq_num(query) {
  const filterArg = query['rp.filter'].split('|')
  const pos_seq_num = filterArg[2]
  const filterSeqNum = pos_seq_num.split(',')

  const data = await Positions.query(qb => {
    qb.where('pos_seq_num', 'IN', filterSeqNum); // for now, can only filter by pos_seq_num
  }).fetchAll({
    withRelated: ['assignments', 'assignments.employee'],
    require: false,
  })
  const results = data ? data.serialize() : []

  let viceData = [];
  results.map(res => {
    const employee = res.assignments?.[0].employee
    viceData.push({
      "pos_seq_num": res.pos_seq_num,
      "asgd_etd_ted_date": res.assignments?.[0].etd_ted_date,
      "emp_first_name": employee?.first_name,
      "emp_last_name": employee?.last_name,
      "emp_middle_name": employee?.middle_name,
      "emp_prefix_name": employee?.prefix_name,
      "emp_suffix_name": employee?.suffix_name,
      "emp_full_name": `${employee?.last_name}, ${employee?.first_name}`,
    })
  })

  return {
    "Data": viceData
  }
}

const formatCapsule = (data) => {
  if (data) {
    return [data].map(d => {
      return {
        "pos_seq_num": d.pos_seq_num,
        "capsule_descr_txt": d.description,
        "capsule_modify_date": d.last_modified, 
        "update_id": 33155,
        "update_date": "20210908125141"
      }
    })
  }
}

async function get_publishable_position_capsule(query) {
  const data = await new CapsuleDescription({ pos_seq_num: query.pos_seq_num }).fetch()
  return {
    "Data": formatCapsule(data.serialize()),
    "usl_id": 44999637,
    "return_code": 0
  }
}

async function update_capsule_description(query) {
  let ReturnCode  
  try {
    await CapsuleDescription.where('pos_seq_num', query.pos_seq_num).save({
      description: query.capsule_descr_txt
    }, {patch: true})
    ReturnCode = 0   
  } catch (Error) {
    console.log(`An error occurred updating capsule description... ${Error}`)
    ReturnCode = -2
  }
  return { Data: null, usl_id: 45066084, ReturnCode }
}

module.exports = { get_position_by_id, get_position_by_pos_num, get_publishable_position_capsule, update_capsule_description, get_vice_position_by_pos_seq_num }
