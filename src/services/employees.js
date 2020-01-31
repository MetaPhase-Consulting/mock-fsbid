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
  return data.map(emp => {
    const [skill1 = {}, skill2 = {} ] = emp.skills
    const { roles, location = {}, currentassignment = {} } = emp
    const { position = {} } = currentassignment || {}
    delete currentassignment.position
    return {
      perdet_seq_num: emp.perdet_seq_num,
      rl_cd: roles.map(r => r.code),
      employee: {
        per_seq_num: emp.per_seq_num,
        per_full_name: emp.fullname,
        per_first_name: emp.first_name,
        per_last_name: emp.last_name,
        per_middle_name: emp.middle_name,
        per_prefix_name: emp.prefix_name,
        per_birth_date: emp.dob,
        per_org_code: "",
        per_skill_code: skill1.skl_code,
        per_skill_2_code: skill2.skl_code,
        per_pay_plan_code: "",
        per_grade_code: emp.grade_code,
        per_tenure_code: "",
        pers_code: "",
        per_create_id: "",
        per_create_date: "",
        per_retirement_code: "",
        per_concurrent_appts_flg: "N",
        'per_empl_rcd#': "",
        pert_external_id: "",
        extt_code: "",
        per_service_type_code: "",
        per_service_type_desc: "",
        'min_act_empl_rcd#_ind': 'Y',
        pert_current_ind: 'Y'
      },
      currentAssignment: {...currentassignment},
      currentPosition: {
        pos_seq_num: position.pos_seq_num,
        pos_num_text: position.position,
        pos_title_code: '',
        pos_title_desc: position.pos_title_desc,
        pos_org_code: position.org_code,
        pos_org_short_desc: '',
        pos_org_long_desc: '',
        pos_bureau_code: position.bureau,
        pos_bureau_short_desc: '',
        pos_bureau_long_desc: '',
        pos_skill_code: '',
        pos_skill_desc: '',
        pos_staff_ptrn_skill_code: '',
        pos_staff_ptrn_skill_desc: '',
        pos_overseas_ind: '',
        pos_pay_plan_code: '',
        pos_pay_plan_desc: '',
        pos_status_code: '',
        pos_status_desc: '',
        pos_service_type_code: '',
        pos_service_type_desc: '',
        pos_grade_code: position.pos_grade_code,
        pos_grade_desc: '',
        pos_post_code: '',
        pos_language_1_code: position.lang1,
        pos_language_1_desc: '',
        pos_location_code: '',
        pos_lang_req_1_code: '',
        pos_lang_req_1_desc: '',
        pos_lang_req_2_desc: '',
        pos_speak_proficiency_1_code: "",
        pos_read_proficiency_1_code: "",
        pos_job_category_desc: position.pos_job_category_desc,
        pos_position_lang_prof_code: 'QB 3/3',
        pos_position_lang_prof_desc: 'Spanish 3/3',
        pos_create_id: '',
        pos_create_date: '',
        pos_update_id: '',
        pos_update_date: '',
        pos_effective_date: '',
        pos_jobcode_code: '',
        pos_occ_series_code: '',
      },
      currentLocation: {
        gvt_geoloc_cd: '',
        effdt: '',
        err_status: '',
        gvt_st_cntry_descr: location.location_country,
        city: location.location_city,
        state: location.location_state,
        county: "",
        country: location.location_country,
        gvt_msa: '',
        gvt_cmsa: '',
        gvt_leopay_area: "",
        gvt_locality_area: "",
      },
      classifications: emp.classifications,
      hs_cd: emp.hs_cd,
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
  withRelated: ['roles', 'skills', 'manager', 'bids', 'classifications', 'currentassignment', 'currentassignment.position']
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