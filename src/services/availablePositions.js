const { AvailablePositions } = require('../models')
const common = require('./common')

// Maps filter values to data values
const FILTERS = {
  "request_params.pos_numbers": { field: "position" },
  "request_params.grades": { field: "pos_grade_code" },
  "request_params.languages": {field: ["lang1", "lang2"] },
  "request_params.bureaus": { field: "bureau_code" },
  "request_params.danger_pays": { field: "bt_danger_pay_num" },
  "request_params.assign_cycles": { field: "cycle_id" },
  "request_params.location_codes": { field: "pos_location_code" },
  "request_params.tod_codes": { field: "tod" },
  "request_params.differential_pays": { field: "bt_differential_rate_num" },
  "request_params.skills": { field: "skill_code" },
  "request_params.cp_ids": { field: "cp_id" },
}

const create_query = query => {
  return AvailablePositions.query(qb => {
    Object.keys(query).map(q => {
      const filter = FILTERS[q]
      const value = query[q]
      if (filter && filter.field && value) {
        // Handle multiple fields on the same param
        if (Array.isArray(filter.field)) {
          filter.field.map(f => common.addFilter(qb, f, value))
        } else {
          common.addFilter(qb, filter.field, value)
        }
      }
    })
    // Free Text filter is special
    common.addFreeTextFilter(qb, query["request_params.freeText"])
    // Overseas filter is also special
    common.addOverseasFilter(qb, query["request_params.overseas_ind"])
    // Order by
    common.addOrderBy(qb, query['request_params.order_by'])
  })
}

const formatData = data => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    return data.map(d => {
      const { tod, lang1, lang2, cycle } = d
      d.tod = tod && tod.long_desc
      d.lang1 = common.formatLanguage(lang1)
      d.lang2 = common.formatLanguage(lang2)
      d.cycle_status = cycle.cycle_status_code
      d.cycle_nm_txt = cycle.cycle_name
      delete d.cycle
      return d
    })
  }
}

async function get_available_positions(query) {
  const data = await create_query(query).fetchPage({
    withRelated: ['tod', 'lang1', 'lang2', 'cycle'],
    pageSize: query["request_params.page_size"] || 25,
    page: query["request_params.page_index"] || 1,
    require: false,
  })

  return { 
    "Data": formatData(data.serialize()),
    "usl_id": 44999637,
    "return_code:": 0
  }
}

async function get_available_positions_count(query) {
  const count = await create_query(query).count()
  return {
    "Data": [
        {
           "count(1)": count
        }
     ],
    "usl_id":  44999615,
    "return_code":  0
 }
}

async function get_available_position_by_id(id) {
  const data = await new AvailablePositions({ cp_id: id })
    .fetch({
      withRelated: ['tod', 'lang1', 'lang2', 'cycle'],
      require: false,
    })
  if (data) {
    return formatData(data.serialize())
  }
}

module.exports = { get_available_positions, get_available_positions_count, get_available_position_by_id }
