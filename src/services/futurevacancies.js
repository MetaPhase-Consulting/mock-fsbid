const { FutureVacancies } = require('../models')
const { createPositionQuery, formatLanguage} = require('./common')

const create_query = (query, isCount=false) => createPositionQuery(FutureVacancies, 'futurevacancies', 'fv_request_params', query, isCount)

const formatData = data => {
  return data.map(d => {
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
    d.location_city = location.city
    d.location_state = location.state
    d.location_country = location.country
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
    return { ...d, ...position }
  })
}

async function get_future_vacancies(query) {
  const data = await create_query(query).fetchPage({
    withRelated: [
      'position',
      'position.tod',
      'position.lang1',
      'position.lang2',
      'position.org',
      'position.location', 
      'position.bureau',
      'position.skill',
      'position.capsuledescription'
    ],
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
module.exports = { get_future_vacancies, get_future_vacancies_count }
