exports.up = function(knex) {
  return knex.schema
    .createTable('toursofduty', function(table) {
      table.string('todcode').primary();
      table.string('toddesctext');
      table.string('todshortdesc');
      table.integer('todmonthsnum');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('toursofduty');
};
