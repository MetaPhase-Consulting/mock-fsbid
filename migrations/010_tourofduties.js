exports.up = function(knex) {
  return knex.schema
    .createTable('tourofduties', function(table) {
      table.string('todcode').primary();
      table.string('toddesctext');
      table.string('todshortdesc');
      table.integer('todmonthsnum');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('tourofduties');
};