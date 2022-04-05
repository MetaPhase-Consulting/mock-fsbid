const { find, isArray } = require('lodash');
const _ = require('lodash');
const { Employees, Assignments, AssignmentDetails, Classifications, EmployeesClassifications, Locations } = require('../models')
const { addOrderBy, asgNameMapping, asgdNameMapping, sepNameMapping } = require('./common.js')
const agendas = require('./agendas');
const lookups = require('./lookups');

// Mapping of provided sort fields to matching query fields
const SORT_MAPPING = {
  per_grade_code: 'employees.grade_code',
  per_skill_code: 'codes.skl_code',
  per_last_name: 'employees.last_name',
  per_first_name: 'employees.first_name',
  per_middle_name: 'employees.middle_name',
  perpiifullname: 'employees.last_name',
  perpiifirstname: 'employees.first_name',
  perpiilastname: 'employees.last_name',
  pertexternalid: 'employees.per_seq_num',
}

// Fetch an employee for an ad_id value
const get_employee_by_ad_id = async query => await get_employees_by_query({'employees.ad_id': query.ad_id})

// Fetch an employee for a username value
const get_employee_by_username = async username => await get_employees_by_query({'employees.username': username})

// Fetch an employee for a a perdet_seq_num value
const get_employee_by_perdet_seq_num = async perdet_seq_num => await get_employees_by_query({'employees.perdet_seq_num': perdet_seq_num})

// Gets agents
const get_agents = async query => {
  let data;
  if (_.get(query, 'request_params.perdet_seq_num')) {
   const client = await get_employee_by_perdet_seq_num(_.get(query, 'request_params.perdet_seq_num'))
   const managerId = client[0].manager_id;
   data = await get_employee_by_perdet_seq_num(managerId)
  } else {
    data = await get_employees_by_query(query, get_agents_filters)
  }
  return data.map(emp => {
    delete emp.perdet_seq_num
    delete emp.username
    delete emp.ad_id
    delete emp.grade_code
    delete emp.skills
    delete emp.bureaus
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

const personLanguages = languages => {
  const result = {}
  languages.forEach((language, i) => {
    let index = ''
    if (i !== 0) {
      index = `_${i+1}`
    }
    const code_field = `per_language${index}_code`
    result[code_field] = language.language_code
    result[`${code_field}_desc`] = language.language_short_desc
    result[`${code_field}_reading_proficiency`] = '1'
    result[`${code_field}_spoken_proficiency`] = '1'
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

const getLanguage = (language) => {
  return {
    "empl_language_code": language._pivot_language_code,
    "empl_language": language.language_long_desc,
    "empl_high_test_date": "2003-05-28T00:00:00-04:00",
    "empl_high_speaking": "2+",
    "empl_high_reading": "2",
  }
}

const getCDOs = (manager) => {
  return {
    "hru_id": manager.hru_id ? `${manager.hru_id}` : null,
    "rl_cd": "CDO",
    "cdo_fullname": `${manager.last_name},${manager.first_name} ${manager.middle_name ? manager.middle_name : 'NMN'}`,
    "cdo_last_name": manager.last_name,
    "cdo_first_name": manager.first_name,
    "cdo_email": manager.email,
  }
}

// Gets clients for an Agent
const get_clients = async query => {
  if (query['request_params.get_count'] === 'true') {
    return await get_employees_count_by_query(query, get_clients_filters)
  } else {
    const data = await get_paged_employees_by_query(query, get_clients_filters)
    const currentAssignmentOnly = query["request_params.currentAssignmentOnly"]
    return (data || []).map((emp, index) => {
      const { 
        roles = [],  
        manager = {}, 
        currentassignment = {}, 
        assignments = [], 
        classifications = [],
      } = emp
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
          per_suffix_name: emp.suffix_name || undefined,
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
        res.employee.classifications = res.employee.classifications.map((c) => {
          const { 
            td_id,
            classification
          } = c
          return _.pick({ td_id, ...classification }, [
            "tp_code",
            "te_id",
            "tp_descr_txt",
            "disabled_ind",
            "rnum",
            "td_id",
          ])
        })
      } else {
        // Single classification as object
        const { 
          td_id,
          classification 
        } = res.employee.classifications
        res.employee.classifications = _.pick({ td_id, ...classification }, [
          "tp_code",
          "te_id",
          "tp_descr_txt",
          "disabled_ind",
          "rnum",
          "td_id",
        ])
      }
      return res
    })
  }
}

const get_v2_clients = async query => {
  if (query['request_params.get_count'] === 'true') {
    return await get_employees_count_by_query(query, get_clients_filters)
  } else {
    const data = await get_paged_employees_by_query(query, get_clients_filters)
    const currentAssignmentOnly = query["request_params.currentAssignmentOnly"]
    return (data || []).map((emp, index) => {
      const { 
        roles = [],  
        manager = [], 
        currentassignment = {}, 
        assignments = [], 
        classifications = [],
        languages = [],
      } = emp
      console.log(manager);
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
          per_suffix_name: emp.suffix_name || undefined,
          per_grade_code: emp.grade_code,
          per_middle_name: emp.middle_name,
          ...personSkills(emp.skills),
          per_pay_plan_code: "",
          per_tenure_code: "",
          ...assignmentInfo,
          classifications: classifications.length === 1 ? classifications[0] : classifications,
        },
        // TO-DO: Establish m2m relationship on manager with CDO and CDO3 -> Return array of relations instead of single obj
        cdos: [manager].map(m => getCDOs(m)),
        languages: languages.map(l => getLanguage(l)),
      }
      // Deletes pivot_td_id and pivot_perdet_seq_num field used in our mock db to randomly assign to employees
      if (res.employee.classifications.length < 1) {
        // No classifications exist, returning nothing
        delete res.employee.classifications
      } else if (res.employee.classifications.length > 1) {
        // Classifications as array
        res.employee.classifications = res.employee.classifications.map((c) => {
          const { 
            td_id,
            classification
          } = c
          return _.pick({ td_id, ...classification }, [
            "tp_code",
            "te_id",
            "tp_descr_txt",
            "disabled_ind",
            "rnum",
            "td_id",
          ])
        })
      } else {
        // Single classification as object
        const { 
          td_id,
          classification 
        } = res.employee.classifications
        res.employee.classifications = _.pick({ td_id, ...classification }, [
          "tp_code",
          "te_id",
          "tp_descr_txt",
          "disabled_ind",
          "rnum",
          "td_id",
        ])
      }
      return res
    })
  }
}

// Maps request params to employee fields for filtering
const get_agents_filters = (params = {}) => {
  const { 'request_params.rl_cd': rl_cd, 'request_params.perdet_seq_num': perdet_seq_num, 'request_params.hru_id': hru_id } = params
  const q = {}
  if (rl_cd) q['employees_roles.code'] = rl_cd

  // This is only going to return 'CDO' (not 'CDO3'). Could use the addFilter function to query by multiple values
  if (isArray(rl_cd)) {
    q['employees_roles.code'] = 'CDO'
  }

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

const get_persons_filters = (params = {}) => {
  const { perdet_seq_num } = params
  const q = {}
  if (perdet_seq_num) q['employees.perdet_seq_num'] = perdet_seq_num
  if (params['rp.filter']) {
    const filterArg = params['rp.filter'].split('|')
    const col = filterArg[0]
    const val = filterArg.slice(-2)[0]
    if (col === 'pertexternalid') q['employees.per_seq_num'] = val
    if (col === 'perpiifullname') q['employees.last_name'] = _.capitalize(val)
    // Update to be %like search on first, last, middle name
  }
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

    manager_idFilter(qb, params['request_params.hru_id'])
    perdet_seq_numFilter(qb, params['request_params.perdet_seq_num'])
    addHSFilter(qb, params['request_params.hs_cd'])
    addNoSuccessfulPanelFilter(qb, params['request_params.no_successful_panel'])
    addNoBidsFilter(qb, params['request_params.no_bids'])
    addFreeTextFilter(qb, params['request_params.freeText'])
    const isCount = params['request_params.get_count'] === 'true'
    if (!isCount) {
      const orderByField = params['request_params.order_by'] || params['rp.orderBy']
      if (orderByField) {
        addOrderBy(qb, orderByField, SORT_MAPPING)
      } else {
        // Default sort
        qb.orderBy('employees.last_name')
      }
    }
  })
}

// Query for fetching users
const get_users_query = (params) => {
  return Employees.query(qb => {
    qb.join('employees_roles', 'employees.perdet_seq_num', 'employees_roles.perdet_seq_num')
    qb.join('employees_skills', 'employees.perdet_seq_num', 'employees_skills.perdet_seq_num')
    qb.join('codes', 'employees_skills.jc_id', 'codes.jc_id')
    hru_idFilter(qb, params['request_params.hru_id'])
    perdet_seq_numFilter(qb, params['request_params.perdet_seq_num'])
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

const addNoSuccessfulPanelFilter = (qb, value) => {
  if (value) {
    qb.leftJoin('bids', 'employees.perdet_seq_num', 'bids.perdet_seq_num')
    if (value === 'Y') {
      qb.whereNotIn('employees.perdet_seq_num', function() {
        this.select('employees.perdet_seq_num')
          .from('employees')
          .leftJoin('bids', 'employees.perdet_seq_num', 'bids.perdet_seq_num')
          .where('bs_cd', 'P')
      })
    } else {
      qb.where('bs_cd', 'P')
    }
  }
}

const addNoBidsFilter = (qb, value) => {
  if (value) {
    qb.leftJoin('bids', 'employees.perdet_seq_num', 'bids.perdet_seq_num')
    if (value === 'Y') {
      qb.whereNotIn('employees.perdet_seq_num', function() {
        this.select('employees.perdet_seq_num')
          .from('employees')
          .leftJoin('bids', 'employees.perdet_seq_num', 'bids.perdet_seq_num')
          .whereIn('bs_cd', ['A', 'C', 'P']);
      })
    } else {
      qb.whereIn('employees.perdet_seq_num', function() {
        this.select('employees.perdet_seq_num')
          .from('employees')
          .leftJoin('bids', 'employees.perdet_seq_num', 'bids.perdet_seq_num')
          .whereIn('bs_cd', ['A', 'C', 'P']);
      })
    }
  }
}

const hru_idFilter = (qb, value) => addMultiValueFilter(qb, value, 'employees.hru_id')
const manager_idFilter = (qb, value) => addMultiValueFilter(qb, value, 'manager.hru_id')
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
    'bureaus',
    'organizations',
    'languages',
    'classifications.classification',
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
const get_employee_bureaus_by_query = async (query, mapping) => {
  try {
    const data = await get_employee_by_ad_id(query, mapping);
    const bureaus = _.get(data, '[0].bureaus', []);
    return bureaus.map(m => _.pick(m, ['bur', 'bureau_long_desc', 'bureau_short_desc']))
  } catch (Error) {
    console.error(Error)
    return null
  }
}

// Fetch employees for the query params
const get_employee_organizations_by_query = async (query, mapping) => {
  try {
    const data = await get_employee_by_ad_id(query, mapping);
    const organizations = _.get(data, '[0].organizations', []);
    const organizations$ = organizations.map(m => _.pick(m, ['code', 'short_desc', 'long_desc']))
    return organizations$.map(m => ({ org_code: m.code, org_short_desc: m.short_desc, org_long_desc: m.long_desc }))
  } catch (Error) {
    console.error(Error)
    return null
  }
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

const get_employees_count_by_query = async (query, mapping) => {
  try {
    const data = await get_employees_query(query, mapping).fetchAll()
    return [{ count: parseInt(data.length) }]
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
      pageSize: query["request_params.page_size"] || query["rp.pageRows"] || 2000,
      page: query["request_params.page_index"] || query["rp.pageNum"] || 1
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
      const perdet_seq_num = query['perdet_seq_num']
      if (perdet_seq_num) {
        qb.join('employees_classifications', 'employees_classifications.te_id', 'classifications.te_id')
        qb.where('employees_classifications.perdet_seq_num', perdet_seq_num)
      }
    }).fetchPage({
      require: false,
      pageSize: query["page_size"] || 1000,
      page: query["page_index"] || 1,
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

const add_classification = async query => {
  const tracking_events = query['te_id']
  const perdet_seq_num = query['perdet_seq_num']
  try {
    if (Array.isArray(tracking_events)) {
      const proms = tracking_events.map(async (tracking_event) => {
        await EmployeesClassifications.forge({
          te_id: tracking_event,
          perdet_seq_num: perdet_seq_num,
        }).save()
      })
      await Promise.all(proms)
    } else {
      await EmployeesClassifications.forge({
        te_id: tracking_events,
        perdet_seq_num: perdet_seq_num,
      }).save()
    }
    return await get_classifications({"perdet_seq_num": perdet_seq_num})
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const remove_classification = async query => {
  const tracking_events = query['te_id']
  const perdet_seq_num = query['perdet_seq_num']
  try {
    if (Array.isArray(tracking_events)) {
      const proms = tracking_events.map(async (tracking_event) => {
        await EmployeesClassifications.where({
          te_id: tracking_event,
          perdet_seq_num: perdet_seq_num,
        }).destroy()
      })
      await Promise.all(proms)
    } else {
      await EmployeesClassifications.where({
        te_id: tracking_events,
        perdet_seq_num: perdet_seq_num,
      }).destroy()
    }
    return await get_classifications({"perdet_seq_num": perdet_seq_num})
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_persons = async query => {
  try {
    const data = await get_employees_by_query(query, get_persons_filters)
    return data.map(emp => {
      const res = {
          per_seq_num: emp.per_seq_num,
          per_full_name: emp.fullname,
          per_last_name: emp.last_name,
          per_first_name: emp.first_name,
          per_middle_name: emp.middle_name || '',
          per_suffix_name: emp.per_suffix_name || '',
          per_prefix_name: emp.prefix_name || '',
          per_ssn_id: emp.per_ssn_id || '',
          per_birth_date: emp.dob || '',
          per_org_code: emp.currentassignment.position.org_code || '',
          ...personSkills(emp.skills),
          per_pay_plan_code: emp.per_pay_plan_code || '',
          per_grade_code: emp.grade_code || ' ',
          per_tenure_code: emp.tenure_code || '',
          pers_code: emp.pers_code || '',
          per_create_id: emp.per_create_id || '',
          per_create_date: emp.per_create_date || '',
          per_update_id: emp.per_update_id || '',
          per_update_date: emp.per_updated_date || '',
          per_middle_initial_name: '',
          per_retirement_code: emp.per_retirement_code || '',
          per_concurrent_appts_flg: emp.per_concurrent_appts_flg || '',
          'per_empl_rcd#': '',
          pert_external_id: emp.per_seq_num || '',
          extt_code: emp.extt_code || '',
          perdet_seq_num: emp.perdet_seq_num || '',
          per_service_type_code: emp.per_service_type_code || '',
          per_service_type_desc: emp.per_service_type_desc || '',
          'min_act_empl_rcd#_ind': '',
          pert_current_ind: emp.pert_current_ind || '',
          rnum: emp.rnum || '',
          per_profile_url: emp.employee_profile_url || '',
        }
        delete res.per_skill_code_desc
        delete res.per_skill_2_code_desc
        delete res.per_skill_3_code_desc
      return res
    })
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_v3_persons = async query => {
  try {
    const data = await get_paged_employees_by_query(query, get_persons_filters)
    return data.map(emp => {
      const res = {
        perpiifirstname: emp.first_name,
        perpiilastname: emp.last_name,
        perpiimiddlename: emp.middle_name || '',
        perpiisuffixname: emp.per_suffix_name || '',
        perdetseqnum: emp.perdet_seq_num || '',
        persdesc: "Active",
        rnum: emp.rnum || '',
      }
      return res
    })
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_v3_persons_agenda_items = async query => {
  try {
    const data = await get_paged_employees_by_query(query, get_persons_filters)
    const getAgendas = await agendas.getAgendas(data)

    const mapData = Promise.all(data.map(async (emp) => {
        const {
          roles = [],
          manager = [],
          currentassignment = {},
          assignments = [],
          classifications = [],
          languages = [],
        } = emp
        let assignmentInfo = getAssignment(currentassignment, true)
        const res = {
          perpiifirstname: emp.first_name,
          perpiilastname: emp.last_name,
          perpiimiddlename: emp.middle_name || '',
          perpiisuffixname: emp.per_suffix_name || '',
          perpiifullname: emp.fullname,
          perpiiseqnum: emp.emp_seq_nbr,
          perdetorgcode: "219910",
          "perdetminactemplrcd#ind": "Y",
          pertexttcode: "G",
          perdetseqnum: emp.perdet_seq_num || '',
          perdetperscode: "A",
          pertexternalid: emp.per_seq_num || '',
          pertcurrentind: "Y",
          rnum: emp.rnum || '',
          currentAssignment: assignmentInfo ? [
            {
              asgperdetseqnum: emp.perdet_seq_num || '',
              asgempseqnbr: emp.emp_seq_nbr || '',
              asgposseqnum: assignmentInfo.currentAssignment.currentPosition.pos_seq_num,
              asgdasgseqnum: assignmentInfo.currentAssignment.asg_seq_num,
              asgdrevisionnum: assignmentInfo.currentAssignment.asg_seq_num,
              asgdasgscode: assignmentInfo.currentAssignment.asgs_code,
              asgdetdteddate: assignmentInfo.currentAssignment.asgd_etd_ted_date,
              asgdtodcode: "Y",
              position: [
                {
                  posseqnum: assignmentInfo.currentAssignment.currentPosition.pos_seq_num,
                  posorgshortdesc: assignmentInfo.currentAssignment.currentPosition.pos_bureau_short_desc,
                  posnumtext: assignmentInfo.currentAssignment.currentPosition.pos_num_text,
                  posgradecode: assignmentInfo.currentAssignment.currentPosition.pos_grade_code,
                  postitledesc: assignmentInfo.currentAssignment.currentPosition.pos_title_desc,
                }
              ],
              latestAgendaItem: _.find(getAgendas, ['perdetseqnum', emp.perdet_seq_num]) || {},
            }
          ] : [],
          handshake: [],
          cdos: [{ hruid: 1 }]
        }
        return res
      }))
    return mapData;
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_agenda_organizations = async ({ isCurrent = true }) => {
  const ref = isCurrent ? 'current' : 'hs'
  let orgs = await lookups.get_organizations();
  orgs = orgs.Data.map(m => ({
    [`tmper${ref}orgcode`]: m.code,
    [`tmper${ref}orgdesc`]: m.short_desc,
  }))
  return orgs;
}

const get_agenda_bureaus = async ({ isCurrent = true }) => {
  const ref = isCurrent ? 'current' : 'hs'
  let burs = await lookups.get_bureaus();
  burs = burs.Data.map(m => ({
    [`tmper${ref}bureaucode`]: m.bur,
    [`tmper${ref}bureaudesc`]: m.bureau_short_desc,
  }))
  return burs;
}


const get_user = async query => {
  try {
    const data = await get_users_query(query).fetchAll(FETCH_OPTIONS);
    return data.serialize().map(user => {
      return {
          hru_id: user.hru_id || '',
          hru_logon_nm: user.hru_logon_nm || '',
          hru_pswd_txt: user.hru_pswd_txt || '',
          hru_pswd_chg_ind: user.hru_pswd_chg_ind || '',
          hru_last_pswd_chd_dt: user.hru_last_pswd_chd_dt || '',
          hru_log_ind: user.hru_log_ind || '',
          hru_last_lgn_tmsmp_dt: user.hru_last_lgn_tmsmp_dt || '',
          hru_lgn_atmps_qty: user.hru_lgn_atmps_qty || '',
          hru_ip_adrs_txt: user.hru_ip_adrs_txt || '',
          hru_email_ovrd_ind: user.hru_email_ovrd_ind || '',
          emp_seq_nbr: user.emp_seq_nbr || '',
          uls_cd: user.uls_cd || '',
          ut_cd: user.ut_cd || '',
          neu_id: user.neu_id || '',
          gal_id: user.gal_id || '',
          hru_create_tmsmp_dt: user.hru_create_tmsmp_dt || '',
          hru_create_user_id: user.hru_create_user_id || '',
          hru_last_updt_tmsmp_dt: user.hru_last_updt_tmsmp_dt || '',
          hru_last_updt_user_id: user.hru_last_updt_user_id || '',
          gal_smtp_email_adrs_text: user.email || '',
          hru_ad_sync_tmsmp_dt: user.hru_ad_sync_tmsmp_dt || '',
          hru_ad_sam_name_text: user.username || '',
          hru_ad_unsync_tmsmp_dt: user.hru_ad_unsync_tmsmp_dt || '',
          hru_ad_domain_name_text: user.hru_ad_domain_name_text || '',
          hru_ad_lockout_tmsmp_dt: user.hru_ad_lockout_tmsmp_dt || '',
          gal_seq_num: user.gal_seq_num || '',
          gal_custom_attr_10_text: user.gal_custom_attr_10_text || '',
          gal_last_name: user.last_name || '',
          gal_first_name: user.first_name || '',
          gal_mi_name: user.middle_name || '',
          gal_display_name: user.fullname || '',
          gal_alias_name: user.gal_alias_name || '',
          gal_address_text: user.office_address || '',
          gal_city_text: user.gal_city_text || '',
          gal_state_text: user.gal_state_text || '',
          gal_zip_code_text: user.gal_zip_code_text || '',
          gal_cntry_text: user.gal_cntry_text || '',
          gal_title_text: user.gal_title_text || '',
          gal_company_text: user.gal_company_text || '',
          gal_dept_text: user.gal_dept_text || '',
          gal_office_text: user.gal_office_text || '',
          gal_assistant_name: user.gal_assistant_name || '',
          gal_phone_nbr_text: user.office_phone || '',
          gal_smtp_email_address_text: user.email || '',
          gal_object_class_text: user.gal_object_class_text || '',
          gal_nt_account_text: user.gal_nt_account_text || '',
          gal_home_server_text: user.gal_home_server_text || '',
          gal_directory_name: user.gal_directory_name || '',
          gal_status_ind: user.gal_status_ind || '',
          gal_create_id: user.gal_create_id || '',
          gal_create_date: user.gal_create_date || '',
          gal_update_id: user.gal_update_id || '',
          gal_update_date: user.gal_update_date || '',
          gal_fax_nbr_text: user.gal_fax_nbr_text || '',
          gal_mobile_nbr_text: user.gal_mobile_nbr_text || '',
          gal_pager_nbr_text: user.gal_pager_nbr_text || '',
          gal_home_nbr_text: user.gal_home_nbr_text || '',
          gal_notes_text: user.gal_notes_text || '',
          gal_domain_name: user.gal_domain_name || '',
          rnum: user.rnum || ''
      }
    })
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const v2_get_assignments = async (filsCols, query) => {
  try {
    let asgd_asgData, employeeData;
    let perdet = _.get(_.filter(filsCols['filters'], { 'name': 'perdet_seq_num'})[0], 'value', null);
    if(perdet) {
      filsCols['filters'] = _.filter(filsCols['filters'], function(f) { return f.name !== 'perdet_seq_num'; })

      employeeData = await Employees.query(qb => {
        qb.where('perdet_seq_num', '=', perdet)
      }).fetchAll({
        require: false,
        columns: ['per_seq_num', 'perdet_seq_num']
      })
      employeeData = employeeData.serialize()
      let empPerSeq = _.get(employeeData[0], 'per_seq_num', null)
      asgd_asgData = await AssignmentDetails.query(qb => {
        qb.join('assignments', 'assignments.asg_seq_num', 'assignmentdetails.asgseqnum')
        qb.where('emp_seq_nbr', '=', empPerSeq)
        if(filsCols['filters'].length) {
          filsCols['filters'].map(fc => {
            return qb.where(fc.name, fc.method, fc.value);
          })
        }
      }).fetchPage({
        require: false,
        withRelated: ['assignment'],
        pageSize: query['rp.pageRows'] || 100,
        page: query['rp.pageNum'] || 1,
      })
      asgd_asgData = asgd_asgData.serialize()
    }
    else {
      asgd_asgData = await AssignmentDetails.query(qb => {
        qb.join('assignments', 'assignments.asg_seq_num', 'assignmentdetails.asgseqnum')
        if(filsCols['filters'].length) {
          filsCols['filters'].map(fc => {
            return qb.where(fc.name, fc.method, fc.value);
          })
        }
      }).fetchPage({
        require: false,
        withRelated: ['assignment'],
        pageSize: query['rp.pageRows'] || 100,
        page: query['rp.pageNum'] || 1,
      })
      asgd_asgData = asgd_asgData.serialize()

      const empSeqNbrs = asgd_asgData.map(a => a.assignment.emp_seq_nbr);
      const empSeqNbrsUniq = _.uniq(empSeqNbrs);

      employeeData = await Employees.query(qb => {
        qb.whereIn('per_seq_num', empSeqNbrsUniq)
      }).fetchAll({
        require: false,
        columns: ['per_seq_num', 'perdet_seq_num']
      })
      employeeData = employeeData.serialize()
    }

    let asgd_asg_empData = asgd_asgData.map(asgd_asg => {
      const asg = asgd_asg.assignment
      const asgd_asg$ = _.omit(asgd_asg, ['assignment'])
      _.merge(asgd_asg$, asg)
      asgd_asg$['asgperdetseqnum'] = _.find(employeeData, ['per_seq_num', asgd_asg$.emp_seq_nbr])['perdet_seq_num'] || null
      return asgd_asg$
    })

    //asg and asgd mapping
    asgd_asg_empData = asgd_asg_empData.map(a_p => {
      return _.mapKeys(a_p, function(value, key) {
        let mapped = asgdNameMapping(key, true);
        return asgNameMapping(mapped, true);
      })
    })


    //adding static data we dont have in our db
    asgd_asg_empData = asgd_asg_empData.map(renderedData => {
      const aoCdoPerdets = [2, 7, 8, 13];
      const codeMap = {
        AP: 'Pending',
        BR: 'Break',
        EF: 'Effective',
        CP: 'Completed'
      };
      return {
        ...renderedData,
        asgdtfcd: "8155",
        asgdwrtcoderrrepay: _.sample(["G", "N"]),
        asgscode: renderedData.asgdasgscode,
        asgscreatedate: _.get(renderedData, 'asgdcreatedate') || null,
        asgscreateid: _.sample(aoCdoPerdets),
        asgsdesctext: codeMap[renderedData.asgdasgscode] || '',
        asgsupdatedate: _.get(renderedData, 'asgdcreatedate') || null,
        asgsupdateid: _.sample(aoCdoPerdets)
      }
    })

    const setCols = [
      'asgposseqnum',
      'asgdasgseqnum',
      'asgdrevisionnum',
      'asgdasgscode',
      'asgdetadate',
      'asgdetdteddate',
      'asgdtoddesctext'
    ];

    const colsToPick = _.union(setCols, filsCols['columns'])

    asgd_asg_empData = asgd_asg_empData.map(pd => _.pick(pd, colsToPick))

    return asgd_asg_empData
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_separations = async (filsCols, query) => {
  try {
    // we have no concept of separation mocked in our DB,
    // so we are just grabbing assignments
    let asg_empData = await Assignments.query(qb => {
      qb.join('employees', 'employees.per_seq_num', 'assignments.emp_seq_nbr')
      if(filsCols['filters'].length) {
        filsCols['filters'].map(fc => {
          return qb.where(fc.name, fc.method, fc.value);
        })
      }
    }).fetchPage({
      require: false,
      withRelated: ['employee', 'position'],
      pageSize: query['rp.pageRows'] || 25,
      page: query['rp.pageNum'] || 1,
    })
    asg_empData = asg_empData.serialize()

    let locsData = await Locations.fetchAll()
    locsData = locsData.serialize()


    //flatten asg_empData and bring in locs data
    asg_empData = asg_empData.map(a_e => {
      const perdet = _.get(a_e, 'employee.perdet_seq_num')
      const loc_code = _.get(a_e, 'position.pos_location_code')
      const locationData =  _.find(locsData, ['location_code', loc_code])
      let a_e$ = _.omit(a_e, ['employee', 'position'])

      a_e$['sepperdetseqnum'] = perdet
      a_e$['asgs_code'] = _.sample(['AP', 'BR', 'EF', 'CP']);
      a_e$['sepdcitytext'] =  _.get(locationData, 'location_city')
      a_e$['sepdcountrystatetext'] = `${_.get(locationData, 'location_city')}, ${_.get(locationData, 'location_state') || _.get(locationData, 'location_country')}`
      a_e$['sepdseparationdate'] = '2020-02-18'
      return a_e$
    })

    asg_empData = asg_empData.map(a_e => {
      return _.mapKeys(a_e, function(value, key) {
        return sepNameMapping(key, true);
      })
    })

    const setCols = [
      'sepseqnum',
      'sepdasgscode',
      'sepdcitytext',
      'sepdcountrystatetext',
      'sepdseparationdate'
    ];

    const colsToPick = _.union(setCols, filsCols['columns'])

    asg_empData = asg_empData.map(pd => _.pick(pd, colsToPick))

    return asg_empData

  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { 
  get_employee_bureaus_by_query, 
  get_employee_organizations_by_query, 
  get_employee_by_ad_id, 
  get_employee_by_perdet_seq_num, 
  get_employee_by_username, 
  get_agents,
  get_v2_clients,
  get_clients,
  get_assignments, 
  get_classifications, 
  get_agenda_bureaus,
  get_agenda_organizations,
  get_persons,
  get_v3_persons,
  get_v3_persons_agenda_items,
  get_persons, 
  personSkills, 
  personLanguages, 
  get_user,
  add_classification,
  remove_classification,
  v2_get_assignments,
  get_separations,
 }
