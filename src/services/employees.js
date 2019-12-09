const { Employees } = require('../models')

const get_employee_by_ad_id = async query => await get_employee_by_query({'employees.ad_id': query.ad_id})

const get_employee_by_username = async username => await get_employee_by_query({'employees.username': username})

const get_employee_by_perdet_seq_num = async perdet_seq_num => await get_employee_by_query({'employees.perdet_seq_num': perdet_seq_num})

const get_agents = async (query) => {
  const { rl_cd, perdet_seq_num } = query
  const q = {}
  if (rl_cd) q['roles.code'] = rl_cd
  if (perdet_seq_num) q['employees.perdet_seq_num'] = perdet_seq_num
  const data = await get_employee_by_query(q)
  return data.map(emp => {
    delete emp.perdet_seq_num
    delete emp.username
    delete emp.ad_id
    delete emp.grade_code
    delete emp.skills
    delete emp.manager
    delete emp.manager_id
    const { code: rolecode, description: rl_descr_txt } = emp.role
    delete emp.role
    return { 
      ...emp,
      rolecode,
      rl_descr_txt,
    }
  })
}

const get_clients = async (query) => {
  const { ad_id, perdet_seq_num } = query
  const q = {}
  if (ad_id) q['manager.ad_id'] = ad_id
  if (perdet_seq_num) q['employees.perdet_seq_num'] = perdet_seq_num
  const data = await get_employee_by_query(q)
  return data.map((emp, index) => {
    const [skill1 = {}, skill2 = {}, skill3 = {}] = emp.skills
    const { role, location = {}} = emp
    return {
      rnum: index + 1,
      hru_id: emp.hru_id,
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
      role_code: role.code,
      pos_location_code: location.code
    }
  })
}

const get_employee_by_query = async query => {
  try {
    const data = await Employees.query(qb => {
      qb.join('roles', 'employees.role', 'roles.code')
      qb.leftOuterJoin('employees as manager', 'employees.manager_id', 'manager.perdet_seq_num')
      qb.where(query)
    }).fetchAll({ require: false, withRelated: ['role', 'skills', 'manager']})
    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { get_employee_by_ad_id, get_employee_by_perdet_seq_num, get_employee_by_username, get_agents, get_clients }