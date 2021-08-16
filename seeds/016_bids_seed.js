exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE bids CASCADE')
    .then(function () {

      return knex.select('cp_id').from('availablepositions')
        .innerJoin('positions', 'positions.position', 'availablepositions.position')
        .orderBy('pos_title_desc')
        .limit(1500)
        .then(cpids => {
          return knex
            .from('employees')
            .select('employees.perdet_seq_num').then(e => {
              const bids = []
              e.forEach(emp => {
                cpids.forEach(cpid => {
                  const rand = Math.floor(Math.random() * 50) // 2% chance to bid on given position
                  const randSubmit = Math.floor(Math.random() * 2) // 50% chance to submit the bid
                  const randCdoBid = Math.floor(Math.random() * 4) // 25% chance it was a CDO bid
                  if (rand === 1) {
                    let bid = {
                      perdet_seq_num: emp.perdet_seq_num,
                      cp_id: cpid['cp_id'],
                    }
                    if (randSubmit === 1) {
                      bid = {
                        ...bid,
                        bs_cd: 'A',
                        ubw_submit_dt: '2021-08-11 15:16:39.139731+00',
                        cdo_bid: randCdoBid === 1 ? 'Y' : 'N',
                      }
                    }
                    bids.push(bid)
                  }
                })
              })
              // run in batches of 1000 to prevent 08P01 error
              return knex.batchInsert('bids', bids, 1000)
            })
        })
    });
};
