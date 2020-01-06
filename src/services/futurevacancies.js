const { FutureVacancies } = require('../models')
const common = require('./common')

// Maps filter values to data values
const FILTERS = {
  "fv_request_params.pos_numbers": { field: "position" },
  "fv_request_params.grades": { field: "positions.pos_grade_code" },
  "fv_request_params.languages": {field: ["positions.lang1", "positions.lang2"] },
  "fv_request_params.bureaus": { field: "positions.bureau" },
  "fv_request_params.danger_pays": { field: "positions.bt_danger_pay_num" },
  "fv_request_params.bid_seasons": { field: "bsn_id" },
  "fv_request_params.location_codes": { field: "positions.pos_location_code" },
  "fv_request_params.tod_codes": { field: "positions.tod" },
  "fv_request_params.differential_pays": { field: "positions.bt_differential_rate_num" },
  "fv_request_params.skills": { field: "codes.skl_code" },
  "fv_request_params.seq_nums": { field: "fv_seq_num" },
}

const create_query = (query, isCount=false) => common.createPositionQuery(FutureVacancies, 'futurevacancies', 'fv_request_params', FILTERS, query, isCount)

const formatData = data => {
  return data.map(d => {
    const { position } = d
    const { tod, lang1, lang2, org, location, bureau, skill } = position
    d.tod = tod && tod.long_desc
    d.lang1 = common.formatLanguage(lang1)
    d.lang2 = common.formatLanguage(lang2)
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
