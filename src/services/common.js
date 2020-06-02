const _ = require('lodash');

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
  "us_codes": { field: "unaccompaniedstatuses.us_code" },
  "post_ind": {
    fields: [
      "bt_consumable_allowance_flg",
      "bt_service_needs_diff_flg",
      "bt_most_difficult_to_staff_flg",
      "bt_inside_efm_employment_flg",
      "bt_outside_efm_employment_flg",
    ],
    value: 'Y',
  }
}

const TANDEM_ONE_FILTERS = {
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
  "cps_codes": { field: "cp_status" },
  "bid_seasons": { field: "bsn_id" },
  "seq_nums": { field: "fv_seq_num" },
  "us_codes": { field: "unaccompaniedstatuses.us_code" },
  "post_ind": {
    fields: [
      "bt_consumable_allowance_flg",
      "bt_service_needs_diff_flg",
      "bt_most_difficult_to_staff_flg",
      "bt_inside_efm_employment_flg",
      "bt_outside_efm_employment_flg",
    ],
    value: 'Y',
  }
  // "cpn_codes": { field: cpn_code },    -- TO-DO --
}

const TANDEM_TWO_FILTERS = {
  "pos_numbers2": { field: "position" },
  "grades2": { field: "positions.pos_grade_code" },
  "languages2": {field: ["positions.lang1", "positions.lang2"] },
  "bureaus2": { field: "positions.bureau" },
  "danger_pays2": { field: "positions.bt_danger_pay_num" },
  "assign_cycles2": { field: "cycle_id" },
  "location_codes2": { field: "positions.pos_location_code" },
  "tod_codes2": { field: "positions.tod" },
  "differential_pays2": { field: "positions.bt_differential_rate_num" },
  "skills2": { field: "codes.skl_code" },
  "cp_ids2": { field: "cp_id" },
  "cps_codes2": { field: "cp_status" },
  "bid_seasons": { field: "bsn_id" },
  "seq_nums2": { field: "fv_seq_num" },
  "us_codes2": { field: "unaccompaniedstatuses.us_code" },
  "post_ind2": {
    fields: [
      "bt_consumable_allowance_flg",
      "bt_service_needs_diff_flg",
      "bt_most_difficult_to_staff_flg",
      "bt_inside_efm_employment_flg",
      "bt_outside_efm_employment_flg",
    ],
    value: 'Y',
  }
  // "cpn_codes2": { field: cpn_code },   -- TO-DO --
}

// Get field for the provided filter.
const getFilter = param => FILTERS[param.split('.').slice(-1)[0]]

// Get field for the tandem filters.
const getTandemFilter = (param, isTandemOne) => {
  const tandem_filters = isTandemOne ? TANDEM_ONE_FILTERS : TANDEM_TWO_FILTERS
  return tandem_filters[param.split('.').slice(-1)[0]]
}

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
    qb.fullOuterJoin('unaccompaniedstatuses', 'locations.us_code', 'unaccompaniedstatuses.us_code')
    qb.join('capsuledescriptions', 'positions.pos_seq_num', 'capsuledescriptions.pos_seq_num')
    Object.keys(query).map(q => {
      const filter = getFilter(q)
      const value = query[q]
      if (filter.field === 'positions.pos_grade_code') {
        const rE = /^\s+$/g;
        const allSpaceChars = value.match(rE);
        if (allSpaceChars) throw 'Error: pos_grade_code contains all whitespace characters'
      }

      if (filter && (filter.field || filter.fields) && value) {
        // Handle multiple fields on the same param
        if (Array.isArray(filter.field)) {
          qb.where(function() {
            const operator = Array.isArray(value) ? 'in' : '='
            w = this.where(filter.field[0], operator, value)
            for (let i = 1; i < filter.field.length; i++) {
              w.orWhere(filter.field[i], operator, value)
            }
          })
        } else if (Array.isArray(filter.fields)) {
          // For when we want a single query array to map to multiple
          // fields, as listed by the query array, using a predefined
          // value defined in FILTERS.
          qb.where(function() {
            const value$ = filter.value || 'Y';
            let values$ = Array.isArray(value) ? value : [value];
            values$ = values$.map(m => m.toLowerCase());
            const fields$ = _.intersection(filter.fields, values$);
            w = this.where(fields$[0], '=', value$)
            for (let i = 1; i < fields$.length; i++) {
              w.orWhere(fields$[i], '=', value$)
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

const createTandemPositionQuery = (model, tableName, paramPrefix, query, isCount, isTandemOne) => {
  return model.query(qb => {
    qb.join('positions', `${tableName}.position`, 'positions.position')
    qb.join('locations', 'positions.pos_location_code', 'locations.location_code')
    qb.join('bureaus', 'positions.bureau', 'bureaus.bur')
    qb.join('codes', 'positions.jc_id', 'codes.jc_id')
    qb.fullOuterJoin('unaccompaniedstatuses', 'locations.us_code', 'unaccompaniedstatuses.us_code')
    qb.join('capsuledescriptions', 'positions.pos_seq_num', 'capsuledescriptions.pos_seq_num')
    Object.keys(query).map(q => {
      const tandemFilter = getTandemFilter(q, isTandemOne)
      const value = query[q]
      if (tandemFilter && (tandemFilter.field || tandemFilter.fields) && value) {
        // Handle multiple fields on the same param
        if (Array.isArray(tandemFilter.field)) {
          qb.where(function() {
            const operator = Array.isArray(value) ? 'in' : '='
            w = this.where(tandemFilter.field[0], operator, value)
            for (let i = 1; i < tandemFilter.field.length; i++) {
              w.orWhere(tandemFilter.field[i], operator, value)
            }
          })
        } else if (Array.isArray(tandemFilter.fields)) {
          // For when we want a single query array to map to multiple
          // fields, as listed by the query array, using a predefined
          // value defined in FILTERS.
          qb.where(function() {
            const value$ = tandemFilter.value || 'Y';
            let values$ = Array.isArray(value) ? value : [value];
            values$ = values$.map(m => m.toLowerCase());
            const fields$ = _.intersection(tandemFilter.fields, values$);
            w = this.where(fields$[0], '=', value$)
            for (let i = 1; i < fields$.length; i++) {
              w.orWhere(fields$[i], '=', value$)
            }
          })
        } else {
          addFilter(qb, tandemFilter.field, value)
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
    let sortParams = value
    if (!Array.isArray(value)) {
      sortParams = [value]
    }
    sortParams.forEach(v => {
      let [field, direction="asc"] = v.split(' ')
      field = mapping[field] || field
      qb.orderBy(field, direction)
    })
  }
}

const SORT_MAPPING = {
  "pos_bureau_short_desc": "bureaus.bureau_short_desc",
  "pos_skill_code": "codes.skl_code",
}

const formatLanguage = lang => lang && `${lang.language_long_desc}(${lang.language_code}) 1/1`

module.exports = { addFilter, addFreeTextFilter, addOverseasFilter, addOrderBy, formatLanguage, createPositionQuery, createTandemPositionQuery }
