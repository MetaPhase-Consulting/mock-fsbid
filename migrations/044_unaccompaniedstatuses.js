exports.up = function(knex) {
  return knex.schema
    .createTable('unaccompaniedstatuses', function(table) {
      table.integer('us_code')
      table.unique('us_code')
      table.string('us_desc_text')
    })
};
exports.down = function(knex) {
  return knex.schema
    dropTable('unaccompaniedstatuses')
};
