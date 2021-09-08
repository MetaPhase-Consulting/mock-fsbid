const _ = require('lodash')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE panelmeetingitems CASCADE')
    .then(function () {
      return knex.select('pmseqnum').from('panelmeetings')
        .then(pmseqnums => {
          return knex.select('miccode').from('panelmeetingitemcategories')
            .then(miccodes => {
              const panel_meeting_items = [];
              for (let i = 0; i < 1400; i++) {
                let mic = _.sample(miccodes);
                panel_meeting_items.push({
                pmiseqnum: i + 1,

                pmiaddendumind: '', //mostly N, see if there are others.
                pmilabeltext: '', //grab from Bureaus.bureau_short_code
                pmiofficialitemnum: '', //research more

                pmseqnum: _.sample(pmseqnums).pmseqnum, //grab from panel_meetings

                miccode: mic.miccode, //grab from panel_meeting_item_cateory
                micdesctext: mic.micdesctext,
                micordernum: mic.micordernum,

                // aiseqnum: '', should come from agenda_item
              });
              }

              return knex.batchInsert('panelmeetingitems', panel_meeting_items, 500); //good
            });
        });
    });
};
