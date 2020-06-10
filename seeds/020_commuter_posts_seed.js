// commuterposts.json is a seed file based on actual fsbid response 
// const commuterposts = readJson('./commuterposts.json')
const { readJson } = require('./data/helpers')
const _ = require('lodash');

const locations = readJson('./locations')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE commuterposts CASCADE')
    .then(knex.raw('TRUNCATE locations_commuterposts CASCADE')).then(function () {
      const commuterposts = []
      const locations_commuterposts = []
      const frequency = [
        "Weekends", 
        "Weekends (if no travel restrictions)", 
        "Daily", 
        "Weekly (Daily possible)"
      ]
      const bureaus = ["NEA", "AF", "WHA", "EUR", "EAP", ]
      // Set 26 commuter posts to match fsbid number and start loop at 1 to start cpn_code at 1
      for (let i = 1; i < 27; i++) {
        // Determine random locations for this particular commuter post
        const location_1 = _.sample(locations)
        const location_2 = _.sample(locations)
        // Extract relevant information for seed data
        const loc_1_code = _.get(location_1, "location_code")
        const loc_2_code = _.get(location_2, "location_code")
        const loc_1_city = _.get(location_1, 'location_city')
        const loc_2_city = _.get(location_2, 'location_city')
        // Add random bureau name abbreviation for consistency
        const bureau_name = _.sample(bureaus)
        // Build out the description
        const description = `${bureau_name}-${loc_1_city}/${loc_2_city}`
        // Push this entry into an array to be seeded after loop
        commuterposts.push({
          cpn_code: i,
          cpn_desc: description,
          cpn_freq_desc: _.sample(frequency),
          location_code_1: loc_1_code,
          location_code_2:loc_2_code
        })
        // Seeding joins table with location and cpn_code (which should match up with index)
        const cpn_code =  _.last(commuterposts)['cpn_code'] 
        locations_commuterposts.push({
          location_code: loc_1_code,
          cpn_code: cpn_code
        })
        locations_commuterposts.push({
          location_code: loc_2_code,
          cpn_code: cpn_code
        })
      }
      // Inserts seed entries then insert joins table
      return knex('commuterposts').insert(commuterposts).then(function() {
        return knex('locations_commuterposts').insert(locations_commuterposts)
      })
    });
};