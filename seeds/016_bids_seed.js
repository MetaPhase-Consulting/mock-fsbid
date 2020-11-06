const { findRandom } = require('./data/helpers')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE bids CASCADE')
    .then(function () {

      return knex.select('cp_id').from('availablepositions').then(ap => {

          const bureauPositions = () => knex
              .innerJoin('positions', 'positions.position', 'availablepositions.position')
              .whereIn('bureau', ['120000', '170000', '160000', '260000']);

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
                  bureauPositions().forEach(cpid => {
                    bids.push({
                      perdet_seq_num: emp.perdet_seq_num,
                      cp_id: cpid,
                    })
                  })
                })
                return knex('bids').insert(bids);
              })
          })
    });
};
