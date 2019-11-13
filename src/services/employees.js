const { Employees } = require('../models')

const get_employee_by_ad_id = async query => await get_employee_by_query({'ad_id': query.ad_id})

const get_employee_by_username = async username => await get_employee_by_query({'username': username})

const get_employee_by_perdet_seq_num = async perdet_seq_num => await get_employee_by_query({'perdet_seq_num': perdet_seq_num})

const get_agents = async (query) => {
  const { rl_cd, perdet_seq_num } = query
  const q = {}
  if (rl_cd) q['roles.code'] = rl_cd
  if (perdet_seq_num) q.perdet_seq_num = perdet_seq_num
  const data = await get_employee_by_query(q)
  return data.map(emp => {
    delete emp.perdet_seq_num
    delete emp.username
    delete emp.ad_id
    const { code: rolecode, description: rl_descr_txt } = emp.role
    delete emp.role
    return { 
      ...emp,
      rolecode,
      rl_descr_txt,
    }
  })
}

const get_employee_by_query = async query => {
  try {
    const data = await Employees.query(qb => {
      qb.join('roles', 'employees.role', 'roles.code')
      qb.where(query)
    }).fetchAll({ require: false, withRelated: ['role']})
    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { get_employee_by_ad_id, get_employee_by_perdet_seq_num, get_employee_by_username, get_agents }