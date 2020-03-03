const { Employees, Assignments, Classifications } = require('../models')
const { addOrderBy } = require('./common.js')

// Mapping of provided sort fields to matching query fields
const SORT_MAPPING = {
  per_grade_code: 'employees.grade_code',
  per_skill_code: 'codes.skl_code',
  per_last_name: 'employees.last_name',
  per_first_name: 'employees.first_name',
}

// Fetch an employee for an ad_id value
const get_employee_by_ad_id = async query => await get_employees_by_query({'employees.ad_id': query.ad_id})

// Fetch an employee for a username value
const get_employee_by_username = async username => await get_employees_by_query({'employees.username': username})

// Fetch an employee for a a perdet_seq_num value
const get_employee_by_perdet_seq_num = async perdet_seq_num => await get_employees_by_query({'employees.perdet_seq_num': perdet_seq_num})

// Gets agents
const get_agents = async query => {
  const data = await get_employees_by_query(query, get_agents_filters)
  return data.map(emp => {
    delete emp.perdet_seq_num
    delete emp.username
    delete emp.ad_id
    delete emp.grade_code
    delete emp.skills
    delete emp.manager
    delete emp.manager_id
    delete emp.dob
    delete emp.classifications
    const { code: rolecode, description: rl_descr_txt } = emp.roles[0]
    delete emp.roles
    return {
      ...emp,
      rolecode,
      rl_descr_txt,
    }
  })
}

const personSkills = skills => {
  const result = {}
  skills.forEach((skill, i) => {
    let index = ''
    if (i !== 0) {
      index = `_${i+1}`
    }
    const code_field = `per_skill${index}_code`
    result[code_field] = skill.skl_code
    result[`${code_field}_desc`] = skill.skill_descr
  })
  return result
}

const getAssignment = (assignment = {}, isCurrent = false) => {
  const { position = {} } = assignment || {}
  const { location = {}, bureau = {} } = position
  const response = {
    ags_seq_num: assignment.ags_seq_num,
    pos_seq_num: `${position.pos_seq_num}`,
    asgd_revision_num: assignment.asgd_revision_num,
    asgd_eta_date: assignment.eta_date,
    asgd_etd_ted_date: assignment.etd_ted_date,
    [isCurrent ? 'currentPosition' : 'position']: {
      pos_seq_num: `${position.pos_seq_num}`,
      pos_location_code: position.pos_location_code,
      pos_num_text: position.position,
      pos_grade_code: position.pos_grade_code,
      pos_skill_code: position.skill ? position.skill.skl_code : null,
      pos_skill_desc: position.skill ? position.skill.skill_descr : null,
      pos_bureau_short_desc: bureau.bureau_short_desc,
      pos_bureau_long_desc: bureau.bureau_long_desc,
      pos_title_desc: position.pos_title_desc,
      pos_language_1_code: "QB", // TODO - use real data
      pos_language_1_desc: "Spanish", // TODO - use real data
      pos_position_lang_prof_desc: "Spanish 3/3", // TODO - use real data
      [isCurrent ? 'currentLocation' : 'location']: {
        gvt_geoloc_cd: position.pos_location_code,
        city: location.location_city,
        country: location.location_country,
        state: location.location_state,
      },
    },
  };
  return isCurrent ? { currentAssignment: response } : response;
}

// Gets clients for an Agent
const get_clients = async query => {
  const data = await get_paged_employees_by_query(query, get_clients_filters)
  const currentAssignmentOnly = query["request_params.currentAssignmentOnly"]
  return (data || []).map((emp, index) => {
    const { roles = [],  manager = {}, currentassignment = {}, assignments = [], classifications = [] } = emp
    let assignmentInfo = getAssignment(currentassignment, true)
    // Have to specifically check for false as null will return currentAssignment
    if (currentAssignmentOnly === 'false') {
       // FSBid returns an object if there is only 1 assignment ¯\_(ツ)_/¯
       const assignments$ = (assignments || []).map(m => getAssignment(m));
       assignmentInfo = {
        assignment: assignments$.length === 1 ? assignments$[0] : assignments$
      }
    }
    const res =  {
      rnum: index + 1,
      hru_id: manager.hru_id,
      rl_cd: roles.length > 0 ? roles[0]['code'] : '', // FSBid only returns one role
      employee: {
        perdet_seq_num: emp.perdet_seq_num,
        pert_external_id: `${emp.per_seq_num}`,
        per_first_name: emp.first_name,
        per_last_name: emp.last_name,
        per_grade_code: emp.grade_code,
        per_middle_name: emp.middle_name,
        ...personSkills(emp.skills),
        per_pay_plan_code: "",
        per_tenure_code: "",
        ...assignmentInfo,
        classifications: classifications.length === 1 ? classifications[0] : classifications,
      }
    }
    // Deletes pivot_td_id and pivot_perdet_seq_num field used in our mock db to randomly assign to employees
    if (res.employee.classifications.length < 1) {
      // No classifications exist, returning nothing
      delete res.employee.classifications
    } else if (res.employee.classifications.length > 1) {
      // Classifications as array
      res.employee.classifications = res.employee.classifications.map((classification) => {
        const { _pivot_perdet_seq_num, _pivot_td_id, ...filteredClassification } = classification
        return filteredClassification
      })
    } else {
      // Single classification as object
      const { _pivot_perdet_seq_num, _pivot_td_id, ...filteredClassifications } = res.employee.classifications
      res.employee.classifications = filteredClassifications
    }
    return res
  })
}

// Maps request params to employee fields for filtering
const get_agents_filters = (params = {}) => {
  const { rl_cd, perdet_seq_num, hru_id } = params
  const q = {}
  if (rl_cd) q['employees_roles.code'] = rl_cd
  if (perdet_seq_num) q['employees.perdet_seq_num'] = perdet_seq_num
  if (hru_id) q['employees.hru_id'] = hru_id

  return q
}

// Maps request params to employee fields for filtering
const get_clients_filters = (params = {}) => {
  const rl_cd = params['request_params.rl_cd']
  // TODO - add these filters if needed
  // const grades = params['request_params.grades']
  // const skills = params['request_params.skills']
  const q = {}
  if (rl_cd) q['employees_roles.code'] = rl_cd

  return q
}

// Query for fetching employees
const get_employees_query = (params, mapping) => {
  return Employees.query(qb => {
    qb.join('employees_roles', 'employees.perdet_seq_num', 'employees_roles.perdet_seq_num')
    qb.join('employees_skills', 'employees.perdet_seq_num', 'employees_skills.perdet_seq_num')
    qb.join('codes', 'employees_skills.jc_id', 'codes.jc_id')
    qb.leftOuterJoin('employees as manager', 'employees.manager_id', 'manager.perdet_seq_num')
    let q = params
    if (mapping) {
      q = mapping(params)
    }
    qb.where(q)

    hru_idFilter(qb, params['request_params.hru_id'])
    perdet_seq_numFilter(qb, params['request_params.perdet_seq_num'])
    addHSFilter(qb, params['request_params.hs_cd'])
    addFreeTextFilter(qb, params['request_params.freeText'])
    const isCount = params['request_params.get_count'] === 'true'
    if (!isCount) {
      const orderByField = params['request_params.order_by']
      if (orderByField) {
        addOrderBy(qb, orderByField, SORT_MAPPING)
      } else {
        // Default sort
        qb.orderBy('employees.last_name')
      }
    }
  })
}

// Free text filter does an ilike/contains type filter
const addFreeTextFilter = (qb, value) => {
  if (value) {
    const operator = 'ilike'
    const val = `%${value}%`
    qb.where(function() {
      this.where("employees.username", operator, val)
          .orWhere('employees.first_name', operator, val)
          .orWhere('employees.middle_name', operator, val)
          .orWhere('employees.last_name', operator, val)
          .orWhere('employees_roles.code', operator, val)
          .orWhere('employees.ad_id', operator, val)
    })
  }
}

const addHSFilter = (qb, value) => {
  if (value) {
    qb.leftOuterJoin('bids', 'employees.perdet_seq_num', 'bids.perdet_seq_num')
    if (value === 'Y') {
      qb.where('bids.ubw_hndshk_offrd_flg', 'Y')
    } else {
      qb.whereNotIn('employees.perdet_seq_num', function() {
        this.select('employees.perdet_seq_num')
            .from('employees')
            .leftOuterJoin('bids', 'employees.perdet_seq_num', 'bids.perdet_seq_num')
            .where('bids.ubw_hndshk_offrd_flg', 'Y')
      })
    }
  }
}

const hru_idFilter = (qb, value) => addMultiValueFilter(qb, value, 'manager.hru_id')
const perdet_seq_numFilter = (qb, value) => addMultiValueFilter(qb, value, 'employees.perdet_seq_num')

const addMultiValueFilter = (qb, value, field) => {
  if (value) {
    if (Array.isArray(value)) {
      qb.whereIn(field, value)
    } else {
      qb.where(field, value)
    }
  }
}

// Default fetch options
const FETCH_OPTIONS = {
  require: false,
  withRelated: [
    'roles',
    'skills',
    'manager',
    'bids',
    'classifications',
    'assignments',
    'assignments.position',
    'assignments.position.skill',
    'assignments.position.location',
    'assignments.position.bureau',
    'assignments.position.lang1',
    'currentassignment',
    'currentassignment.position',
    'currentassignment.position.skill',
    'currentassignment.position.location',
    'currentassignment.position.bureau',
  ]
}

// Fetch employees for the query params
const get_employees_by_query = async (query, mapping) => {
  try {
    const data = await get_employees_query(query, mapping).fetchAll(FETCH_OPTIONS)
    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

// Fetch employees for the query params with paging
const get_paged_employees_by_query = async (query, mapping) => {
  try {
    const data = await get_employees_query(query, mapping).fetchPage({
      ...FETCH_OPTIONS,
      pageSize: query["request_params.page_size"] || 25,
      page: query["request_params.page_index"] || 1
    })
    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_assignments = async query => {
  try {
    const data = await Assignments.query(qb => {
        const perdet_seq_num = query['request_params.perdet_seq_num']
        if (perdet_seq_num) {
          qb.join('employees', 'employees.per_seq_num', 'assignments.emp_seq_nbr')
          qb.where('employees.perdet_seq_num', perdet_seq_num)
        }
      }).fetchPage({
        require: false,
        withRelated: ['employee'],
        pageSize: query["request_params.page_size"] || 25,
        page: query["request_params.page_index"] || 1,
      })

    return data.serialize().map((asg, i) => {
      delete asg.eta_date
      delete asg.etd_ted_date
      const { perdet_seq_num } = asg.employee
      delete asg.employee
      return {
        asg_seq_num: i,
        perdet_seq_num,
        ...asg
      }
    })
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_classifications = async query => {
  try {
    const data = await Classifications.query(qb => {
      const perdet_seq_num = query['request_params.perdet_seq_num']
      if (perdet_seq_num) {
        qb.join('employees_classifications', 'employees_classifications.td_id', 'classifications.td_id')
        qb.where('employees_classifications.perdet_seq_num', perdet_seq_num)
      }
    }).fetchPage({
      require: false,
      pageSize: query["request_params.page_size"] || 25,
      page: query["request_params.page_index"] || 1,
    })

    return await data.serialize().map(classification => {
      const { _pivot_perdet_seq_num, _pivot_td_id, ...filteredClassification } = classification
      return filteredClassification
    })
  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { get_employee_by_ad_id, get_employee_by_perdet_seq_num, get_employee_by_username, get_agents, get_clients, get_assignments, get_classifications }
