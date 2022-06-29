const datefns = require('date-fns');

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE panelmeetingdates CASCADE')
    .then(function () {
      return knex.select().from('panelmeetings')
        .then(panelmeetings => {
          const panel_meeting_dates = []
          panelmeetings.forEach((panelmeeting, i) => {
            // mock out 52 weeks ahead, separated by 7 days
            const len = (panelmeetings.length - 52 - i) * 7;
            const { pmseqnum, pmscode, pmpmtcode } = panelmeeting;
            const today = Date.now();
            const panelDate = datefns.subDays(today, len);

            let dates = []

            if (pmscode === 'I' || pmscode === 'A') {
              dates = ['MEET', 'CUT', 'ADD']
            } else if (pmscode === 'O') {
              dates = ['MEET', 'CUT', 'ADD', 'OFF']
            } else if (pmscode === 'P') {
              dates = ['MEET', 'CUT', 'ADD', 'OFF', 'OFFA', 'POST']
            } else if (pmscode === 'C') {
              dates = ['MEET', 'CUT', 'ADD', 'OFF', 'OFFA', 'POST', 'POSS', 'COMP']
            }
            
            dates.forEach(datetype => {
              let date = panelDate;
              if (datetype === 'MEET') {
                date = panelDate;
              } else if (datetype === 'CUT') {
                date = datefns.subDays(panelDate, 2);
              } else if (datetype === 'ADD') {
                date = datefns.subDays(panelDate, 1);
              } else if (datetype === 'OFF') {
                date = datefns.subDays(panelDate, 2);
                date = datefns.addSeconds(date, 25);
              } else if (datetype === 'OFFA') {
                date = datefns.subDays(panelDate, 1);
                date = datefns.addMinutes(date, 4);
              } else if (datetype === 'POST') {
                date = datefns.addDays(panelDate, 1);
                date = datefns.subMinutes(date, 180);
              } else if (datetype === 'POSS') {
                date = datefns.addDays(panelDate, 1);
                date = datefns.subMinutes(date, 184);
              } else if (datetype === 'COMP') {
                date = datefns.addDays(panelDate, 1);
                date = datefns.subMinutes(date, 174);
              }
              panel_meeting_dates.push({
                mdtcode: datetype,
                pmseqnum: pmseqnum,
                pmddttm: date,
              })
            })
          })
          return knex.batchInsert('panelmeetingdates', panel_meeting_dates, 500);
        });
    });
};
