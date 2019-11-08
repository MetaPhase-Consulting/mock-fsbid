
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
      this.where("pos_title_desc", operator, val)
          .orWhere('pos_skill_desc', operator, val)
          .orWhere('pos_job_category_desc', operator, val)
          .orWhere('ppos_capsule_descr_txt', operator, val)
    })
  }
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
}

const formatLanguage = lang => lang && `${lang.language_long_desc}(${lang.language_code}) 1/1`

module.exports = { addFilter, addFreeTextFilter, addOverseasFilter, addOrderBy, formatLanguage }