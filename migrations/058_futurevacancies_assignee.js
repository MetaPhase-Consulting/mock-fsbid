exports.up = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.string('assignee')
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.dropColumn('assignee')
  });
};
