const { FutureVacancies } = require('../models')
const { createPositionQuery, createTandemPositionQuery, formatLanguage, formatCommuterPost} = require('./common')

const create_query = (query, isCount=false) => createPositionQuery(FutureVacancies, 'futurevacancies', 'fv_request_params', query, isCount)
const create_tandem_query = (query, isCount=false, isTandemOne=false) => createTandemPositionQuery(FutureVacancies, 'futurevacancies', 'fv_request_params', query, isCount, isTandemOne)

const formatData = data => {
  return data.map((d, i)=> {
    const { position } = d
    const { tod, lang1, lang2, org, location, bureau, skill, capsuledescription } = position
    d.tod = tod && tod.long_desc
    delete position.tod
    d.lang1 = formatLanguage(lang1)
    delete position.lang1
    d.lang2 = formatLanguage(lang2)
    delete position.lang2
    d.org_code = org.code
    d.org_long_desc = org.long_desc
    d.org_short_desc = org.short_desc
    delete position.org
    d.location_city = location.location_city
    d.location_state = location.location_state
    d.location_country = location.location_country
    d.state_country_desc = location.location_country
    d.post_org_country_state = `${location.location_city}, ${location.location_state || location.location_country}`
    delete position.location
    d.pos_bureau_short_desc = bureau.bureau_short_desc
    d.pos_bureau_long_desc = bureau.bureau_long_desc
    d.bureau_code = bureau.bur
    delete position.bureau
    delete position.pos_seq_num
    d.pos_skill_desc = skill.skill_descr
    d.pos_skill_code = skill.skl_code
    delete position.skill
    d.ppos_capsule_descr_txt = capsuledescription.description
    d.ppos_capsule_modify_dt = capsuledescription.last_modified
    delete position.capsuledescription
    return { rnum: i, ...d, ...position }
  })
}

const formatTandemData = (data, isTandemOne) => {
  // Counter for determing commuter posts on identical id positions
  const counter = {}
  return data.map((d, i)=> {
    const { position } = d
    const { tod, lang1, lang2, org, location, bureau, skill, capsuledescription, commuterpost } = position
    // Sets up a counter for duplicate cp_ids to determine which commuter post to use
    const fv_seq_num = d.fv_seq_num
    counter.hasOwnProperty(fv_seq_num) ? counter[fv_seq_num] += 1 : counter[fv_seq_num] = 0
    const cpn = formatCommuterPost(commuterpost, counter, d.fv_seq_num)
    delete position.commuterpost

    d.tod = tod && tod.long_desc
    delete position.tod
    d.lang1 = formatLanguage(lang1)
    delete position.lang1
    d.lang2 = formatLanguage(lang2)
    delete position.lang2
    d.org_code = org.code
    d.org_long_desc = org.long_desc
    d.org_short_desc = org.short_desc
    delete position.org
    d.location_city = location.location_city
    d.location_state = location.location_state
    d.location_country = location.location_country
    d.state_country_desc = location.location_country
    d.post_org_country_state = `${location.location_city}, ${location.location_state || location.location_country}`
    delete position.location
    d.pos_bureau_short_desc = bureau.bureau_short_desc
    d.pos_bureau_long_desc = bureau.bureau_long_desc
    d.bureau_code = bureau.bur
    delete position.bureau
    delete position.pos_seq_num
    d.pos_skill_desc = skill.skill_descr
    d.pos_skill_code = skill.skl_code
    delete position.skill
    d.ppos_capsule_descr_txt = capsuledescription.description
    d.ppos_capsule_modify_dt = capsuledescription.last_modified
    delete position.capsuledescription
    d.tandem_nbr = isTandemOne ? 1 : 2
    return { rnum: i, ...d, ...cpn, ...position }
  })
}

const RELATED = [
  'position',
  'position.tod',
  'position.lang1',
  'position.lang2',
  'position.org',
  'position.location', 
  'position.bureau',
  'position.skill',
  'position.capsuledescription',
  'position.commuterpost'
]

async function get_future_vacancies(query) {
  const data = await create_query(query).fetchPage({
    withRelated: RELATED,
    pageSize: query["fv_request_params.page_size"] || 25,
    page: query["fv_request_params.page_index"] || 1
  })

  return {
    "Data": formatData(data.serialize()),
    "usl_id": 44999637,
    "return_code": 0
  }
}

async function get_future_vacancies_count(query) {
  const count = await create_query(query, true).count()
  return {
    "Data": [
        {
           "count(1)": parseInt(count)
        }
     ],
    "usl_id":  44999615,
    "return_code":  0
  }
}

async function get_future_vacancies_tandem(query) {
  const isCount = query['request_params.count'] === 'true'

  if (isCount) {
    return await get_fv_tandem_count(query, isCount)
  } else {
    const dataTandemOne = await create_tandem_query(query, false, true).fetchPage({
      withRelated: RELATED,
      pageSize: query["fv_request_params.page_size"] || 25,
      page: query["fv_request_params.page_index"] || 1,
      require: false,
      merge: false, 
      remove: false
    })
  
    const dataTandemTwo = await create_tandem_query(query, false, false).fetchPage({
      withRelated: RELATED,
      pageSize: query["fv_request_params.page_size"] || 25,
      page: query["fv_request_params.page_index"] || 1,
      require: false,
      merge: false, 
      remove: false
    })
  
    return {
      "Data": formatTandemData(dataTandemOne.serialize(), true).concat(formatTandemData(dataTandemTwo.serialize(), false)),
      "usl_id": 44999637,
      "return_code": 0
    }
  }
}

async function get_fv_tandem_count(query, isCount) {
  const dataTandemOne = await create_tandem_query(query, isCount, true).count()
  const dataTandemTwo = await create_tandem_query(query, isCount, false).count()
  const combinedCount = parseInt(dataTandemOne) + parseInt(dataTandemTwo)
  return {
    "Data": [{ "cnt": combinedCount }],
    "usl_id": 44999637,
    "return_code": 0
  }
}
module.exports = { get_future_vacancies, get_future_vacancies_count, get_future_vacancies_tandem }
