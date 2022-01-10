exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingstatuses', function(table) {
      table.string('pmscode').primary()
      table.string('pmsdesctext')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingstatuses')
};
