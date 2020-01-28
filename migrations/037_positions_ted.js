exports.up = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.timestamp('ted').alter()
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.string('ted').alter()
    })
};