const { readJson } = require('./data/helpers')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE bidstats CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex.select('cp_id').from('availablepositions').then(cpIds => {
        const bidstats = []
        cpIds.forEach(cp_id => {
          
          bidstats.push({
            ...cp_id,
            cp_ttl_bidder_qty: 0,
            cp_at_grd_qty: 0,
            cp_in_cone_qty: 0,
            cp_at_grd_in_cone_qty: 0
          })
        });

        return knex('bidstats').insert(bidstats);
      })
    });
};
