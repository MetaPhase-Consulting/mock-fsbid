const _ = require('lodash')
const datefns = require('date-fns');

exports.seed = function(knex) {
  return knex.raw('TRUNCATE TABLE panelmeetingitems CASCADE')
    .then(function () {
      return knex.select('pmseqnum').from('panelmeetings')
        .then(PMs => {
          return knex.select('miccode').from('panelmeetingitemcategories')
            .then(MICs => {
              const panel_meeting_items = [];
              let pmiseqnum = 0;
              const aoCdoPerdets = [2, 7, 8, 13];
              PMs.forEach((pm, i) => {
                  let pmseqnum = pm.pmseqnum;
                  let mic = _.sample(MICs);
                  // 15-20 pmi per pmseqnum; 60 for pmiseqnum=60
                  let numOfPMIs = Math.floor(Math.random() * 6) + 15;
                  numOfPMIs = pmseqnum === 60 ? 60 : numOfPMIs;
                  for(let k = 1; k <= numOfPMIs; k++){
                    pmiseqnum+=1;
                    // grab the pmd_dttm using pmseqnum from panel meeting date table
                    // 2 weeks to 5 days before pmd_dttm
                    let createDate = datefns.subDays(pmd_dttm, Math.floor(Math.random() * 10) + 5);
                    // createDate to 3 days before pmd_dttm
                    let rangeleft = datefns.addMinutes(createDate, 3);
                    let rangeRight = datefns.subDays(pmd_dttm, 3);
                    let range = differenceInDays(rangeleft, rangeRight);
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

                      // pmicreatedate: createDate,
                      pmiupdateid: _.sample(aoCdoPerdets),
                      // pmiupdatedate: updateDate,
                    });
                  }
                };

              return knex.batchInsert('panelmeetingitems', panel_meeting_items, 500);
            });
        });
    });
};
