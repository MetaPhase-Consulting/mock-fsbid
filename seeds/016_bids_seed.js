const { findRandom } = require('./data/helpers')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE bids CASCADE')
    .then(function () {
      
      return knex.select('cp_id').from('availablepositions').then(ap => {
        return knex
              .from('employees')
              .innerJoin('employees_roles', 'employees.perdet_seq_num', 'employees_roles.perdet_seq_num')
              .where('employees_roles.code', 'fsofficer')
              .select('employees.perdet_seq_num').then(e => {
                const bids = []
                e.forEach(emp => {
                  for (let index = 0; index < 5; index++) {
                    bids.push({
                      perdet_seq_num: emp.perdet_seq_num,
                      cp_id: findRandom(ap)['cp_id'],
                    })
                  }
                })
                return knex('bids').insert(bids);
              })
      })
    });
};
