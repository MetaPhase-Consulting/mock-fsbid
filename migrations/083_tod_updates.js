exports.up = function (knex) {
  return knex.schema
    .alterTable('agendaitemlegs', function (table) {
      table.dropColumn('todcode')
    })
    .alterTable('agendaitemlegs', function (table) {
      table.string('todcode')
      table.foreign('todcode').references('toursofduty.todcode')
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('agendaitemlegs', function (table) {
      table.string('todcode')
      table.foreign('todcode').references('tourofduties.code')
    });
};
