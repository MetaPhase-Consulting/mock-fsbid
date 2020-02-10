// Maps filter values to data values
const FILTERS = {
  "pos_numbers": { field: "position" },
  "grades": { field: "positions.pos_grade_code" },
  "languages": {field: ["positions.lang1", "positions.lang2"] },
  "bureaus": { field: "positions.bureau" },
  "danger_pays": { field: "positions.bt_danger_pay_num" },
  "assign_cycles": { field: "cycle_id" },
  "location_codes": { field: "positions.pos_location_code" },
  "tod_codes": { field: "positions.tod" },
  "differential_pays": { field: "positions.bt_differential_rate_num" },
  "skills": { field: "codes.skl_code" },
  "cp_ids": { field: "cp_id" },
  "bid_seasons": { field: "bsn_id" },
  "seq_nums": { field: "fv_seq_num" },
  "cps_codes": { field: "cp_status" },
}

// Get field for the provided filter.
const getFilter = param => FILTERS[param.split('.').slice(-1)[0]]

// Custom filter function for overseas positions
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
const addFreeTextFilter = (qb, value) => {
  if (value) {
    const operator = 'ilike'
    const val = `%${value}%`
    qb.where(function() {
      this.where("positions.pos_title_desc", operator, val)
          .orWhere('codes.skill_descr', operator, val)
          .orWhere('positions.pos_job_category_desc', operator, val)
          .orWhere('capsuledescriptions.description', operator, val)
    })
  }
}

const createPositionQuery = (model, tableName, paramPrefix, query, isCount) => {
  return model.query(qb => {
    qb.join('positions', `${tableName}.position`, 'positions.position')
    qb.join('locations', 'positions.pos_location_code', 'locations.location_code')
    qb.join('bureaus', 'positions.bureau', 'bureaus.bur')
    qb.join('codes', 'positions.jc_id', 'codes.jc_id')
    qb.join('capsuledescriptions', 'positions.pos_seq_num', 'capsuledescriptions.pos_seq_num')
    Object.keys(query).map(q => {
      const filter = getFilter(q)
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
          addFilter(qb, filter.field, value)
        }
      }
    })
    // Free Text filter is special
    addFreeTextFilter(qb, query[`${paramPrefix}.freeText`])
    // Overseas filter is also special
    addOverseasFilter(qb, query[`${paramPrefix}.overseas_ind`])
    if (!isCount) {
      // Order by
      addOrderBy(qb, query[`${paramPrefix}.order_by`])
    }
  })
}

const addOverseasFilter = (qb, value) => {
  if (value) {
    let operator = '='
    if (value === 'D') {
      operator = '<>'
    }
    qb.where('locations.is_domestic', operator, 0)
  }
}

const addOrderBy = (qb, value, mapping=SORT_MAPPING) => {
  if (value) {
    let [field, direction="asc"] = value.split(' ')
    field = mapping[field] || field
    qb.orderBy(field, direction)
  }
}

const SORT_MAPPING = {
  "pos_bureau_short_desc": "bureaus.bureau_short_desc",
  "pos_skill_code": "codes.skl_code",
}

const formatLanguage = lang => lang && `${lang.language_long_desc}(${lang.language_code}) 1/1`

module.exports = { addFilter, addFreeTextFilter, addOverseasFilter, addOrderBy, formatLanguage, createPositionQuery }