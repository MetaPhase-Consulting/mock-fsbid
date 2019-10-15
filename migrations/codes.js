exports.up = function(knex) {
  return knex.schema
    .createTable('codes', function(table) {
      table.increments('jc_id').primary();
      table.string('jc_nm_txt');
      table.string('skl_code');
      table.string('skill_descr')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('codes');
};