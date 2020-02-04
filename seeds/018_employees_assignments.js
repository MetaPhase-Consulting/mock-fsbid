const { findRandom } = require('./data/helpers')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return Promise.all([
    knex.raw('UPDATE employees set currentassignment = NULL'),
    knex.raw('DELETE FROM assignments')
  ]).then(function () {
      return knex.select('pos_seq_num').from('positions').then(positions => {
        return knex.from('employees').select('employees.per_seq_num').then(e => {
          const assignments = []
          e.forEach(emp => {
            const count = findRandom([...Array(5).keys()]) + 1
            const { per_seq_num } = emp
            for (let index = 0; index < count; index++) {
              assignments.push({
                emp_seq_nbr: per_seq_num,
                pos_seq_num: findRandom(positions)['pos_seq_num'],
                eta_date: knex.fn.now(),
                etd_ted_date: knex.fn.now(),
              })
            }
          })
          return knex('assignments').returning(['emp_seq_nbr', 'asg_seq_num']).insert(assignments).then(function(fields) {
            return Promise.all(
              fields.map(field => knex('employees').where('per_seq_num', field.emp_seq_nbr).update({'currentassignment': field.asg_seq_num}))
            )
          })
        })
      })
    });
};