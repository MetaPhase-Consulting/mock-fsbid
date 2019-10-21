const { FutureVacancies } = require('../models')

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

// Adds a filter to the qb for the field and value
const addFilter = (qb, field, value) => {
  if (Array.isArray(value)) {
    // If there are more than one value for a field, handle that
    qb.where(`${field}`, "in", value)
  } else {
    qb.where({ [field]: value })
  }
}
// Free text filter does an ilike/contains type filter
const addFreeTextFilter = (qb, query) => {
  const freeText = query["fv_request_params.freeText"]
  if (freeText) {
    const operator = 'ilike'
    const value = `%${freeText}%`
    qb.where(function() {
      this.where("pos_title_desc", operator, value)
          .orWhere('pos_skill_desc', 'ilike', value)
          .orWhere('pos_job_category_desc', 'ilike', value)
          .orWhere('ppos_capsule_descr_txt', 'ilike', value)
    })
  }
}

const addOverseasFilter = (qb, query) => {
  const overseas = query["fv_request_params.overseas_ind"]
  if (overseas) {
    let operator = '='
    if (overseas === 'D') {
      operator = '<>'
    }
    qb.where('pos_location_code', operator, '110010001')
  }
}

const addOrderBy = (qb, query) => {
  const orderBy = query['fv_request_params.order_by']
  if (orderBy) {
    const [field, direction="asc"] = orderBy.split(' ')
    qb.orderBy(field, direction)
  }
}

const create_query = query => {
  return FutureVacancies.query(qb => {
    Object.keys(query).map(q => {
      const filter = FILTERS[q]
      const value = query[q]
      if (filter && filter.field && value) {
        // Handle multiple fields on the same param
        if (Array.isArray(filter.field)) {
          filter.field.map(f => addFilter(qb, f, value))
        } else {
          addFilter(qb, filter.field, value)
        }
      }
    })
    // Free Text filter is special
    addFreeTextFilter(qb, query)
    // Overseas filter is also special
    addOverseasFilter(qb, query)
    // Order by
    addOrderBy(qb, query)
  })
}

const formatLanguage = lang => lang && `${lang.language_long_desc}(${lang.language_code}) 1/1`

const formatData = data => {
  return data.map(d => {
    const { tod, lang1, lang2 } = d
    d.tod = tod && tod.long_desc
    d.lang1 = formatLanguage(lang1)
    d.lang2 = formatLanguage(lang2)
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