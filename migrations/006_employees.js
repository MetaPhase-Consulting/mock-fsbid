exports.up = function(knex) {
  return knex.schema
    .createTable('employees', function(table) {
      table.increments('perdet_seq_num').primary();
      table.string('username');
      table.string('ad_id');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('employees');
};