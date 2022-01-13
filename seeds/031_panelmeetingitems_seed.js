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
              return knex.select('mdtcode').from('panelmeetingdates')
                .then(MDTs => {
                  const panel_meeting_items = [];
                  let pmiseqnum = 0;
                  const aoCdoPerdets = [2, 7, 8, 13];
                  PMs.forEach(pm => {
                      let pmseqnum = pm.pmseqnum;
                      let pmddttm = _.find(MDTs, { 'pmseqnum': pmseqnum })['pmddttm'] || null;
                      let mic = _.sample(MICs);
                      // 15-20 pmi per pmseqnum; 60 for pmiseqnum=60
                      let numOfPMIs = randomIntInclusive(15, 20);
                      numOfPMIs = pmseqnum === 60 ? 60 : numOfPMIs;
                      for(let k = 1; k <= numOfPMIs; k++) {
                        pmiseqnum+=1;
                        let createDate = datefns.subDays(pmddttm, randomIntInclusive(5, 14));
                        let rangeleft = datefns.addMinutes(createDate, 3);
                        let rangeRight = datefns.subDays(pmddttm, 3);
                        let range = datefns.differenceInDays(rangeleft, rangeRight);
                        let updateDate = datefns.subDays(createDate, Math.floor(Math.random() * range));
                        panel_meeting_items.push({
                          pmiseqnum: pmiseqnum,

                          pmseqnum: pmseqnum,
                          miccode: mic.miccode,

                          // important number that gets called out at pre+panel. Unique on the pmseqnum
                          pmiofficialitemnum: k,
                          pmiaddendumind: 'N',
                          pmilabeltext: _.sample([' ', 'AF', 'A']),
                          pmicreateid: _.sample(aoCdoPerdets),
                          // TODO: Until when can create and update Panel Meeting Items and Agendas be edited once attached to a Panel Meeting
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
