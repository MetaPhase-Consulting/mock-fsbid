exports.up = function(knex) {
  return knex.schema
    .createTable('differentialrates', function(table) {
      table.integer('pay_percent_num').primary();
      table.string('pay_percentage_text');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('differentialrates');
};