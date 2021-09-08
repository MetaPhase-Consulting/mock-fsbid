const { readJson } = require('./data/helpers')

const agendaitemstatuses = readJson('./agendaitemstatuses.json')

exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex.raw('TRUNCATE TABLE agendaitemstatuses CASCADE')
    .then(function () {
      // Inserts seed entries
      return knex('agendaitemstatuses').insert(agendaitemstatuses);
    });
};
