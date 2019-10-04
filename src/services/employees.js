const { readJson } = require('./common')

const employees = readJson('../data/employees.json')

const get_employee_by_ad_id = query => get_employee_by_field('ad_id', query.ad_id)

const get_employee_by_username = username => get_employee_by_field('username', username)

const get_employee_by_perdet_seq_num = perdet_seq_num => get_employee_by_field('perdet_seq_num', perdet_seq_num)

const get_employee_by_field = (field, value) => employees.find(e => e[field] === value)

module.exports = { get_employee_by_ad_id, get_employee_by_perdet_seq_num, employees, get_employee_by_username }