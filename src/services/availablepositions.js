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
  "request_params.skills": { field: "pos_skill_code" },
  "request_params.cp_ids": { field: "cp_id" },
}

const create_query = (query, isCount=false) => {
  return AvailablePositions.query(qb => {
    qb.join('locations', 'availablepositions.pos_location_code', 'locations.code')
    qb.join('bureaus', 'availablepositions.bureau', 'bureaus.bur')
    Object.keys(query).map(q => {
      const filter = FILTERS[q]
      const value = query[q]
      if (filter && filter.field && value) {
        // Handle multiple fields on the same param
        if (Array.isArray(filter.field)) {
          qb.where(function() {
            const operator = Array.isArray(value) ? 'in' : '='
            w = this.where(filter.field[0], operator, value)
            for (let i = 1; i < filter.field.length; i++) {
              w.orWhere(filter.field[i], operator, value)
            }
          })
        } else {
          common.addFilter(qb, filter.field, value)
        }
      }
    })
    // Free Text filter is special
    common.addFreeTextFilter(qb, query["request_params.freeText"])
    // Overseas filter is also special
    common.addOverseasFilter(qb, query["request_params.overseas_ind"])
    if (!isCount) {
      // Order by
      common.addOrderBy(qb, query['request_params.order_by'])
    }
  })
}

const formatData = data => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    return data.map(d => {
      const { tod, lang1, lang2, cycle, org, location, bureau } = d
      d.tod = tod && tod.long_desc
      d.lang1 = common.formatLanguage(lang1)
      d.lang2 = common.formatLanguage(lang2)
      d.cycle_status = cycle.cycle_status_code
      d.cycle_nm_txt = cycle.cycle_name
      delete d.cycle
      d.org_code = org.code
      d.org_long_desc = org.long_desc
      d.org_short_desc = org.short_desc
      delete d.org
      d.location_city = location.city
      d.location_state = location.state
      d.location_country = location.country
      delete d.location
      d.pos_bureau_short_desc = bureau.bureau_short_desc
      d.pos_bureau_long_desc = bureau.bureau_long_desc
      delete d.bureau
      return d
    })
  }
}

async function get_available_positions(query) {
  const data = await create_query(query).fetchPage({
    withRelated: ['tod', 'lang1', 'lang2', 'cycle', 'org', 'location', 'bureau'],
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
      withRelated: ['tod', 'lang1', 'lang2', 'cycle', 'org', 'location', 'bureau'],
      require: false,
    })
  if (data) {
    return formatData(data.serialize())
  }
}

module.exports = { get_available_positions, get_available_positions_count, get_available_position_by_id }
