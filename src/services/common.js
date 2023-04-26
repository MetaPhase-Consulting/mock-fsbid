const _ = require('lodash');
const jwt = require('jsonwebtoken');

// Maps filter values to data values
const FILTERS = {
  "pos_numbers": { field: "positions.position" },
  "grades": { field: "positions.pos_grade_code" },
  "languages": {field: ["positions.lang1", "positions.lang2"] },
  "bureaus": { field: "positions.bureau" },
  "org_codes": { field: "positions.org_code" },
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
  },
  "htf_ind": { field: "acp_hard_to_fill_ind" },
}

const CYCLE_POSITION_FILTERS = {
  ...FILTERS,
  "bureaus": { field: ["positions.bureau", "positions.consultative_bureau"] },
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
  },
  "cpn_codes": { field: "locations_commuterposts.cpn_code" },
  "htf_ind": { field: "acp_hard_to_fill_ind" },
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
  },
  "cpn_codes2": { field: "locations_commuterposts.cpn_code" },
  "htf_ind": { field: "acp_hard_to_fill_ind" },
}

// Get field for the provided filter.
const getFilter = (param, isCycle) => {
  const FILTERS$ = isCycle ? CYCLE_POSITION_FILTERS : FILTERS;
  return FILTERS$[param.split('.').slice(-1)[0]]
}

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
          .orWhere('positions.position', operator, val)
          .orWhere('capsuledescriptions.description', operator, val)
    })
  }
}

const createPositionQuery = (model, tableName, paramPrefix, query, isCount, isCycle) => {
  return model.query(qb => {
    qb.join('positions', `${tableName}.position`, 'positions.position')
    qb.join('locations', 'positions.pos_location_code', 'locations.location_code')
    qb.join('bureaus', 'positions.bureau', 'bureaus.bur')
    qb.join('codes', 'positions.jc_id', 'codes.jc_id')
    if (tableName === 'availablepositions') {
      qb.join('cycles', `${tableName}.cycle_id`, 'cycles.cycle_id')
    }
    qb.fullOuterJoin('unaccompaniedstatuses', 'locations.us_code', 'unaccompaniedstatuses.us_code')
    qb.join('capsuledescriptions', 'positions.pos_seq_num', 'capsuledescriptions.pos_seq_num')

    Object.keys(query).map(q => {
      const filter = getFilter(q, isCycle)
      const value = query[q]
      if (_.get(filter, 'field') === 'positions.pos_grade_code') {
        const rE = /^\s+$/g;
        let allSpaceChars = false;
          // single grade: str; multiple grades: arr
        if (Array.isArray(value)) {
          value.forEach(a => { if(a.match(rE)) allSpaceChars = true;})
        } else {
          allSpaceChars = value.match(rE);
        }
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
    if (tableName === 'availablepositions') {
      addFilter(qb, 'cycles.cycle_status_code', 'A')
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
    qb.fullOuterJoin('locations_commuterposts', 'locations.location_code', 'locations_commuterposts.location_code')
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
  "cpn_desc": "positions.pos_location_code", // Fake, just allows to sort using cpn_desc without an error
  "tandem_nbr": "positions.pos_location_code", // Fake, just allows to sort using tandem_nbr without an error
  "geoloc.city": "location_city",
  "geoloc.state": "location_state",
  "geoloc.country": "location_country",
}

const isCDO = (req) => {
  const decoded = jwt.decode(req.headers.jwtauthorization, {complete: true});
  return _.get(decoded, 'payload.role', []).some(r => ['CDO', 'CDO3'].includes(r));
}

const formatLanguage = lang => lang && `${lang.language_long_desc}(${lang.language_code}) 1/1`

const formatCommuterPost = (postsArr, counterObj, id) => {
  const idx = counterObj[id]
  const target_post = postsArr[idx]
  return {
    cpn_desc: _.get(target_post, 'cpn_desc', ''),
    cpn_freq_desc: _.get(target_post, 'cpn_freq_desc', '')
  }
}

const convertPostBodyToGetQuery = query => {
  let body$ = query || {};
  if (body$.order_by && _.isArray(body$.order_by)) {
    body$.order_by = _.filter(body$.order_by).map(m => {
      let m$ = m + ' asc';
      if (_.get(m, '[0]') === '-') {
        m$ = m.substring(1) + ' desc';
      }
      return m$;
    });
  }
  body$ = _.mapKeys(body$, (v, k) => 'request_params.' + k);
  return body$;
}

const panelNameMapping = (val, toWS=false) => {
  let colDictionary = {
    pmpmscode: 'pmscode',
    pmdmdtcode: 'mdtcode',
    pmdpmseqnum: 'pmseqnum',
    pmddttm: 'pmddttm',
    pmpmtcode: 'pmpmtcode'
  };
  if(toWS) {
    colDictionary = _.invert(colDictionary);
  }
  return _.get(colDictionary, val) || val
}

const pmdNameMapping = (val, toWS=false) => {
  let colDictionary = {
    'pmdpmseqnum': 'pmseqnum',
    'pmdmdtcode': 'mdtcode',
    'pmddttm': 'pmddttm',
  };
  if(toWS) {
    colDictionary = _.invert(colDictionary);
  }
  return _.get(colDictionary, val) || val
}

const agendaNameMapping = (val, toWS=false) => {
  let colDictionary = {
    'aiperdetseqnum': 'perdetseqnum',
    'aiseqnum': 'aiseqnum',
    'pmseqnum': 'pmseqnum',
  };
  if(toWS) {
    colDictionary = _.invert(colDictionary);
  }
  return _.get(colDictionary, val) || val
}

const asgNameMapping = (val, toWS=false) => {
  let colDictionary = {
    asgcreatedate: 'asg_create_date',
    asgcreateid: 'asg_create_id',
    asgempseqnbr: 'emp_seq_nbr',
    asgposseqnum: 'pos_seq_num',
    asgseqnum: 'asg_seq_num',
    asgupdatedate: 'asg_update_date',
    asgupdateid: 'asg_update_id',
    asgperdetseqnum: 'perdet_seq_num'
  };
  if(toWS) {
    colDictionary = _.invert(colDictionary);
  }
  return _.get(colDictionary, val) || val
}

const asgdNameMapping = (val, toWS=false) => {
  let colDictionary = {
    asgdadjustmonthsnum: 'asgdadjustmonthsnum',
    asgdailseqnum: 'ailseqnum',
    asgdasgscode: 'asgscode',
    asgdasgseqnum: 'asgseqnum',
    asgdcreatedate: 'asgdcreatedate',
    asgdcreateid: 'asgdcreateid',
    asgdcriticalneedind: 'asgdcriticalneedind',
    asgdetadate: 'asgdetadate',
    asgdetdteddate: 'asgdetdteddate',
    asgdlatcode: 'latcode',
    asgdrevisionnum: 'asgdrevisionnum',
    asgdnotecommenttext: 'asgdnotecommenttext',
    asgdorgcode: 'orgcode',
    asgdpriorityind: 'asgdpriorityind',
    asgdsalaryreimburseind: 'asgdsalaryreimburseind',
    asgdtodcode: 'todcode',
    asgdtodmonthsnum: 'asgdtodmonthsnum',
    asgdtoddesctext: 'asgdtodothertext',
    // asgdtodothertext: 'asgdtodothertext',
    // right now our asgdtodothertext matches our tourofduties.long_desc
    // asgdtoddesctext === tourofduties.long_desc
    // asgdtodothertext should be something else
    asgdtrainingind: 'asgdtrainingind',
    asgdtravelreimburseind: 'asgdtravelreimburseind',
    asgdupdatedate: 'asgdupdatedate',
    position: 'position'  
  };

  if(toWS) {
    colDictionary = _.invert(colDictionary);
  }

  return _.get(colDictionary, val) || val
}

const sepNameMapping = (val, toWS=false) => {
  let colDictionary = {
    sepempseqnbr: 'emp_seq_nbr',
    sepperdetseqnum: 'perdet_seq_num',
    sepseqnum: 'asg_seq_num',
    sepdasgscode: 'asgs_code',
  };

  if(toWS) {
    colDictionary = _.invert(colDictionary);
  }

  return _.get(colDictionary, val) || val
}

const bidNameMapping = (val, toWS=false) => {
  let colDictionary = {
    cpposseqnum: 'pos_seq_num',
    ubwcpid: 'cp_id',
    ubwbscd: 'bs_cd',
    posnumtext: 'position',
    posorgshortdesc: 'short_desc',
    postitledesc: 'pos_title_desc',
    ubwperdetseqnum: 'perdet_seq_num',
    position: 'position_info'  
  };

  if(toWS) {
    colDictionary = _.invert(colDictionary);
  }

  return _.get(colDictionary, val) || val
}

const convertTemplateFiltersCols = (query, mapFunc) => {
  const queryFilterDict = {
    EQ: "=",
    IN: "=",
    GTEQ: ">",
    LTEQ: "<",
  }

  let columns = _.get(query, 'rp.columns') || []
  let filters = _.get(query, 'rp.filter') || []
  if(typeof(columns) === 'string') columns = [columns]
  if(typeof(filters) === 'string') filters = [filters]

  filters = filters.map(f => {
    const f$ = f.split('|');

    let name = f$[0].toLowerCase()
    if (mapFunc){
      name = mapFunc([f$[0].toLowerCase()])[0]
    }
    if(f$[2] === 'MAX') {
      f$[2] = 1
    }
    return {
      name: name,
      method: queryFilterDict[f$[1].toUpperCase()],
      value: f$[2]
    };
  })

  columns = columns.map(c => c.toLowerCase())

  const filsCols = {
    filters: filters,
    columns: columns
  }
  return filsCols
}

// takes an array of objects and groups them under the values of the given key
// Disclaimer: if you need to use this function, there may be a better way to query the db
const groupArrayOfObjectsByKeyValue = (data, onKey) => {
  let dataGrouped = {};
  data.forEach(d => {
    let keyValue = d[onKey];
    if(!dataGrouped[keyValue]){
      dataGrouped[keyValue] = [];
    }
    if(dataGrouped[keyValue]){
      dataGrouped[keyValue].push(d);
    }
  })
  return dataGrouped;
}


module.exports = { addFilter, addFreeTextFilter, addOverseasFilter, addOrderBy, isCDO,
  convertPostBodyToGetQuery, formatLanguage, createPositionQuery,
  createTandemPositionQuery, formatCommuterPost, convertTemplateFiltersCols,
  panelNameMapping, asgNameMapping, sepNameMapping, bidNameMapping,
  asgdNameMapping, pmdNameMapping, agendaNameMapping, groupArrayOfObjectsByKeyValue, }
