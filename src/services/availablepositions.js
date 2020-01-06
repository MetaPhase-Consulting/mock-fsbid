const { AvailablePositions } = require('../models')
const common = require('./common')

// Maps filter values to data values
const FILTERS = {
  "request_params.pos_numbers": { field: "position" },
  "request_params.grades": { field: "positions.pos_grade_code" },
  "request_params.languages": {field: ["positions.lang1", "positions.lang2"] },
  "request_params.bureaus": { field: "positions.bureau" },
  "request_params.danger_pays": { field: "positions.bt_danger_pay_num" },
  "request_params.assign_cycles": { field: "cycle_id" },
  "request_params.location_codes": { field: "positions.pos_location_code" },
  "request_params.tod_codes": { field: "positions.tod" },
  "request_params.differential_pays": { field: "positions.bt_differential_rate_num" },
  "request_params.skills": { field: "codes.skl_code" },
  "request_params.cp_ids": { field: "cp_id" },
}

const create_query = (query, isCount=false) => common.createPositionQuery(AvailablePositions, 'availablepositions', 'request_params', FILTERS, query, isCount)

const formatData = data => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    return data.map(d => {
      const { cycle, position } = d
      const { tod, lang1, lang2, org, location, bureau, skill } = position
      d.tod = tod && tod.long_desc
      d.lang1 = common.formatLanguage(lang1)
      d.lang2 = common.formatLanguage(lang2)
      d.cycle_status = cycle.cycle_status_code
      d.cycle_nm_txt = cycle.cycle_name
      delete d.cycle
      d.org_code = org.code
      d.org_long_desc = org.long_desc
      d.org_short_desc = org.short_desc
      delete position.org
      d.location_city = location.location_city
      d.location_state = location.location_state
      d.location_country = location.location_country
      delete position.location
      d.pos_bureau_short_desc = bureau.bureau_short_desc
      d.pos_bureau_long_desc = bureau.bureau_long_desc
      d.bureau_code = bureau.bur
      delete position.bureau
      d.pos_skill_desc = skill.skill_descr
      d.pos_skill_code = skill.skl_code
      delete position.skill
      return { ...d, ...position }
    })
  }
}

const RELATED = [
  'cycle', 
  'position', 
  'position.tod', 
  'position.lang1', 
  'position.lang2', 
  'position.org', 
  'position.location', 
  'position.bureau',
  'position.skill',
]

async function get_available_positions(query) {
  const data = await create_query(query).fetchPage({
    withRelated: RELATED,
    pageSize: query["request_params.page_size"] || 25,
    page: query["request_params.page_index"] || 1,
    require: false,
  })

  return {
    "Data": formatData(data.serialize()),
    "usl_id": 44999637,
    "return_code": 0
  }
}

async function get_available_positions_count(query) {
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

async function get_available_position_by_id(id) {
  const data = await new AvailablePositions({ cp_id: id })
    .fetch({
      withRelated: RELATED,
      require: false,
    })
  if (data) {
    return formatData(data.serialize())
  }
}

module.exports = { get_available_positions, get_available_positions_count, get_available_position_by_id }
