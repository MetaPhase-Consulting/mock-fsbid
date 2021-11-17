const _ = require('lodash');

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
                        handshake_allowed_ind: 'Y',
                      }
                    }
                    bids.push(bid)
                  }
                })
              })
              let bidstats = []
              bidstats = bids.filter(f => f.bs_cd === 'A')
              bidstats = _.countBy(bidstats.map(m => m.cp_id));
              const bidstats$ = _.keys(bidstats).map(k => {
                const cp_ttl_bidder_qty = bidstats[k];
                // generate some randomness that still makes sense numerically
                const cp_at_grd_qty = Math.floor(cp_ttl_bidder_qty / ((Math.random() * 3) + 1))
                const cp_in_cone_qty = Math.floor(cp_ttl_bidder_qty / ((Math.random() * 3) + 1))
                const cp_at_grd_in_cone_qty = Math.floor(cp_ttl_bidder_qty / ((Math.random() * 4) + 3))
                return {
                  cp_id: k,
                  cp_ttl_bidder_qty,
                  cp_at_grd_qty,
                  cp_in_cone_qty,
                  cp_at_grd_in_cone_qty,
                }
              })
              // delete bid stats of ones we're about to generate
              knex('bidstats').whereIn('cp_id', bidstats$.map(m => m.cp_id)).del()
                .then(() => {
                  // run in batches of 1000 to prevent 08P01 error
                  knex.batchInsert('bids', bids, 1000)
                  return knex.batchInsert('bidstats', bidstats$, 1000)
                })
            })
        })
    });
};
