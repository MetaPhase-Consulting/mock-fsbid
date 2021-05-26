exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE bids CASCADE')
    .then(function () {

      return knex.select('cp_id').from('availablepositions')
        .innerJoin('positions', 'positions.position', 'availablepositions.position')
        .orderBy('pos_title_desc')
        .limit(1000)
        .then(cpids => {
          return knex
            .from('employees')
            .select('employees.perdet_seq_num').then(e => {
              const bids = []
              e.forEach(emp => {
                cpids.forEach(cpid => {
                  const rand = Math.floor(Math.random() * 50) // 2% chance to bid on given position
                  if (rand === 1) {
                    bids.push({
                      perdet_seq_num: emp.perdet_seq_num,
                      cp_id: cpid['cp_id'],
                    })
                  }
                })
              })
              return knex('bids').insert(bids);
            })
        })
    });
};
