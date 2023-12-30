exports.up = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.boolean('deto_rwa')
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.dropColumn('deto_rwa')
    });
};
