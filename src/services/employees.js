const { Employees } = require('../models')

const get_employee_by_ad_id = query => get_employee_by_field('ad_id', query.ad_id)

const get_employee_by_username = username => get_employee_by_field('username', username)

const get_employee_by_perdet_seq_num = perdet_seq_num => get_employee_by_field('perdet_seq_num', perdet_seq_num)

const get_employee_by_field = async (field, value) => {
  try {
    const data = await Employees.where(field, value).fetch({ withRelated: ['role']})
    return data.serialize()
  } catch (Error) {
    console.error(Error)
    return null
  }
}

module.exports = { get_employee_by_ad_id, get_employee_by_perdet_seq_num, get_employee_by_username }