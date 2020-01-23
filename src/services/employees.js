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
    const [skill1 = {}, skill2 = {}, skill3 = {}] = emp.skills
    const { roles, location = {}, manager = {}} = emp
    return {
      rnum: index + 1,
      hru_id: manager.hru_id,
      per_full_name: emp.fullname,
      perdet_seq_num: emp.perdet_seq_num,
      grade_code: emp.grade_code,
      skill_code: skill1.skl_code,
      skill_code_desc: skill1.skill_descr,
      skill2_code: skill2.skl_code,
      skill2_code_desc: skill2.skill_descr,
      skill3_code: skill3.skl_code,
      skill3_code_desc: skill3.skill_descr,
      emplid: emp.username,
      role_code: roles.map(r => r.code),
      pos_location_code: location.code,
      hs_cd: emp._has_handshake(),
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
          .orWhere('employees.fullname', operator, val)
          .orWhere('employees_roles.code', operator, val)
          .orWhere('employees.ad_id', operator, val)
    })
  }
}

// Default fetch options
const FETCH_OPTIONS = {
  require: false, 
  withRelated: ['roles', 'skills', 'manager']
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