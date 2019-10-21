exports.up = function(knex) {
  return knex.schema
    .createTable('employees', function(table) {
      table.increments('id').primary();
      table.string('username');
      table.string('ad_id');
      table.string('perdet_seq_num');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('employees');
};