const { Employees } = require('../models')

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
    const { code: rolecode, description: rl_descr_txt } = emp.roles[0]
    delete emp.roles
    return { 
      ...emp,
      rolecode,
      rl_descr_txt,
    }
  })
}

// Gets clients for an Agent
const get_clients = async query => {
  const data = await get_paged_employees_by_query(query, get_clients_filters)
  return data.map((emp, index) => {
    const [skill1 = {}, skill2 = {} ] = emp.skills
    const { roles = [],  manager = {}, currentassignment = {} } = emp
    const { position = {} } = currentassignment || {}
    const { location = {}, bureau = {} } = position
    delete currentassignment.position
    return {
      rnum: index + 1,
      hru_id: manager.hru_id,
      perdet_seq_num: emp.perdet_seq_num,
      rl_cd: roles.length > 0 ? roles[0]['code'] : '', // FSBid only returns one role
      employee: {
        pert_external_id: `${emp.per_seq_num}`,
        per_first_name: emp.first_name,
        per_last_name: emp.last_name,
        per_grade_code: emp.grade_code,
        per_middle_name: emp.middle_name,
        per_skill_code: skill1.skl_code,
        per_skill_code_desc: skill1.skill_descr,
        per_skill_2_code: skill2.skl_code,
        per_skill_2_code_desc: skill2.skill_descr,
        per_pay_plan_code: "",
        per_tenure_code: "",
        currentAssignment: {
          ags_seq_num: currentassignment.ags_seq_num,
          pos_seq_num: `${position.pos_seq_num}`,
          asgd_revision_num: currentassignment.asgd_revision_num,
          asgd_eta_date: currentassignment.eta_date,
          asgd_etd_ted_date: currentassignment.etd_ted_date,
          currentPosition: {
            pos_seq_num: `${position.pos_seq_num}`,
            pos_location_code: position.pos_location_code,
            pos_num_text: position.position,
            pos_grade_code: position.pos_grade_code,
            pos_skill_code: position.skill.skl_code,
            pos_skill_desc: position.skill.skill_descr,
            pos_bureau_short_desc: bureau.bureau_short_desc,
            pos_bureau_long_desc: bureau.bureau_long_desc,
            pos_title_desc: position.pos_title_desc,
            currentLocation: {
              gvt_geoloc_cd: "",
              city: location.location_city,
              country: location.location_country,
            },
          },
        },
      }
    }
  })
}

// Maps request params to employee fields for filtering
const get_agents_filters = (params = {}) => {
  const { rl_cd, perdet_seq_num } = params
  const q = {}
  if (rl_cd) q['employees_roles.code'] = rl_cd
  if (perdet_seq_num) q['employees.perdet_seq_num'] = perdet_seq_num
  
  return q
}

// Maps request params to employee fields for filtering
const get_clients_filters = (params = {}) => {
  const perdet_seq_num = params['request_params.perdet_seq_num']
  const hru_id = params['request_params.hru_id']
  const rl_cd = params['request_params.rl_cd']
  const hs_cd = params['request_params.hs_cd']
  // TODO - add these filters if needed
  // const grades = params['request_params.grades']
  // const skills = params['request_params.skills']
  const q = {}
  if (perdet_seq_num) q['employees.perdet_seq_num'] = perdet_seq_num
  if (hru_id) q['manager.hru_id'] = hru_id
  if (rl_cd) q['employees_roles.code'] = rl_cd
  if (hs_cd) q['hs_cd'] = hs_cd

  return q
}

// Query for fetching employees
const get_employees_query = (params, mapping) => {
  return Employees.query(qb => {
    qb.join('employees_roles', 'employees.perdet_seq_num', 'employees_roles.perdet_seq_num')
    qb.leftOuterJoin('employees as manager', 'employees.manager_id', 'manager.perdet_seq_num')
    let q = params
    if (mapping) {
      q = mapping(params)
    }
    qb.where(q)

    addFreeTextFilter(qb, params['request_params.freeText'])
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

// Default fetch options
const FETCH_OPTIONS = {
  require: false, 
  withRelated: [
    'roles', 
    'skills', 
    'manager', 
    'bids', 
    'classifications', 
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

module.exports = { get_employee_by_ad_id, get_employee_by_perdet_seq_num, get_employee_by_username, get_agents, get_clients }