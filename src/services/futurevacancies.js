const { FutureVacancies } = require('../models')
const common = require('./common')

// Maps filter values to data values
const FILTERS = {
  "fv_request_params.pos_numbers": { field: "position" },
  "fv_request_params.grades": { field: "pos_grade_code" },
  "fv_request_params.languages": {field: ["lang1", "lang2"] },
  "fv_request_params.bureaus": { field: "bureau_code" },
  "fv_request_params.danger_pays": { field: "bt_danger_pay_num" },
  "fv_request_params.bid_seasons": { field: "bsn_id" },
  "fv_request_params.location_codes": { field: "pos_location_code" },
  "fv_request_params.tod_codes": { field: "tod" },
  "fv_request_params.differential_pays": { field: "bt_differential_rate_num" },
  "fv_request_params.skills": { field: "skill_code" },
  "fv_request_params.seq_nums": { field: "fv_seq_num" },
}

const create_query = query => {
  return FutureVacancies.query(qb => {
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
    common.addFreeTextFilter(qb, query["fv_request_params.freeText"])
    // Overseas filter is also special
    common.addOverseasFilter(qb, query["fv_request_params.overseas_ind"])
    // Order by
    common.addOrderBy(qb, query['fv_request_params.order_by'])
  })
}

const formatData = data => {
  return data.map(d => {
    const { tod, lang1, lang2 } = d
    d.tod = tod && tod.long_desc
    d.lang1 = common.formatLanguage(lang1)
    d.lang2 = common.formatLanguage(lang2)
    return d
  })
}

async function get_future_vacancies(query) {
  const data = await create_query(query).fetchPage({
    withRelated: ['tod', 'lang1', 'lang2'],
    pageSize: query["fv_request_params.page_size"] || 25,
    page: query["fv_request_params.page_index"] || 1
  })

  return { 
    "Data": formatData(data.serialize()),
    "usl_id": 44999637,
    "return_code:": 0
  }
}

async function get_future_vacancies_count(query) {
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
module.exports = { get_future_vacancies, get_future_vacancies_count }