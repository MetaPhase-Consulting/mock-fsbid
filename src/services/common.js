
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
          .orWhere('positions.ppos_capsule_descr_txt', operator, val)
    })
  }
}

const createPositionQuery = (model, tableName, paramPrefix, filters, query, isCount) => {
  return model.query(qb => {
    qb.join('positions', `${tableName}.position`, 'positions.position')
    qb.join('locations', 'positions.pos_location_code', 'locations.location_code')
    qb.join('bureaus', 'positions.bureau', 'bureaus.bur')
    qb.join('codes', 'positions.jc_id', 'codes.jc_id')
    Object.keys(query).map(q => {
      const filter = filters[q]
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

const addOrderBy = (qb, value) => {
  if (value) {
    let [field, direction="asc"] = value.split(' ')
    field = SORT_MAPPING[field] || field
    qb.orderBy(field, direction)
  }
}

const SORT_MAPPING = {
  "pos_bureau_short_desc": "bureaus.bureau_short_desc",
  "pos_skill_code": "codes.skl_code",
}

const formatLanguage = lang => lang && `${lang.language_long_desc}(${lang.language_code}) 1/1`

module.exports = { addFilter, addFreeTextFilter, addOverseasFilter, addOrderBy, formatLanguage, createPositionQuery }