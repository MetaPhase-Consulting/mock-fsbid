
const employees = [
  { emp_seq_num: 2, ad_id: "washdc\\admin", perdet_seq_num: 2 },
  { emp_seq_num: 4, ad_id: "washdc\\townpostj", perdet_seq_num: 4 },
  { emp_seq_num: 7, ad_id: "washdc\\shadtrachl", perdet_seq_num: 7 },
  { emp_seq_num: 6, ad_id: "washdc\\rehmant", perdet_seq_num: 6 },
  { ad_id: "washdc\\woodwardw", perdet_seq_num: 8 },
]

const get_employee_by_ad_id = query => get_employee_by_field('ad_id', query.ad_id)

const get_employee_by_perdet_seq_num = perdet_seq_num => get_employee_by_field('perdet_seq_num', perdet_seq_num)

const get_employee_by_field = (field, value) => employees.find(e => e[field] === value)

module.exports = { get_employee_by_ad_id, get_employee_by_perdet_seq_num, employees }