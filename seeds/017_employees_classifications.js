const { findRandom } = require('./data/helpers')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE employees_classifications')
    .then(function () {
      
      return knex.select('te_id').from('classifications').then(classification => {
        return knex
              .from('employees')
              .select('employees.perdet_seq_num').then(e => {
                const emp_class = []
                e.forEach(emp => {
                  const count = findRandom([...Array(5).keys()])
                  for (let index = 0; index < count; index++) {
                    emp_class.push({
                      perdet_seq_num: emp.perdet_seq_num,
                      te_id: findRandom(classification)['te_id'],
                    })
                  }
                })
                return knex('employees_classifications').insert(emp_class);
              })
      })
    });
};