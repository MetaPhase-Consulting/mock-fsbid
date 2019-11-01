exports.up = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.string('pos_skill_code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('futurevacancies', function(table) {
      table.dropColumn('pos_skill_code')
  });
};