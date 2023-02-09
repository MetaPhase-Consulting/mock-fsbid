const _ = require('lodash')
const datefns = require('date-fns');
const { randomIntInclusive } = require('./data/helpers')

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE panelmeetingitems CASCADE')
    .then(function () {
      return knex.select('pmseqnum').from('panelmeetings')
        .then(PMs => {
          return knex.select('miccode').from('panelmeetingitemcategories')
            .then(MICs => {
              return knex.select().from('panelmeetingdates')
                .then(MDTs => {
                  const panel_meeting_items = [];
                  let pmiseqnum = 0;
                  const aoCdoPerdets = [2, 7, 8, 13];
                  PMs.forEach(pm => {
                    const { pmseqnum } = pm;
                    const numPMIsLookup = {
                      60: 60,
                      200: 200,
                      300: 300,
                      'default': randomIntInclusive(15, 20),
                    };
                    const pmddttm = _.find(MDTs, { 'pmseqnum': pmseqnum, 'mdtcode': 'MEET' })['pmddttm']
                    const numOfPMIs = _.get(numPMIsLookup, pmseqnum) || numPMIsLookup['default'];
                    for(let k = 1; k <= numOfPMIs; k++) {
                      pmiseqnum+=1;
                      let mic = _.sample(MICs);
                      let createDate = datefns.subDays(pmddttm, randomIntInclusive(5, 14));
                      let rangeleft = datefns.addMinutes(createDate, 3);
                      let rangeRight = datefns.subDays(pmddttm, 3);
                      let range = datefns.differenceInDays(rangeleft, rangeRight);
                      let updateDate = datefns.subDays(createDate, Math.floor(Math.random() * range));
                      panel_meeting_items.push({
                        pmiseqnum: pmiseqnum,
                        pmseqnum: pmseqnum,
                        miccode: mic.miccode,
                        pmiofficialitemnum: k,
                        pmiaddendumind: 'N',
                        pmilabeltext: _.sample([' ', 'AF', 'A']),
                        pmicreateid: _.sample(aoCdoPerdets),
                        pmicreatedate: createDate,
                        pmiupdateid: _.sample(aoCdoPerdets),
                        pmiupdatedate: updateDate,
                      });
                    }
                  });
                  return knex.batchInsert('panelmeetingitems', panel_meeting_items, 500);
              });
            });
        });
    });
};
