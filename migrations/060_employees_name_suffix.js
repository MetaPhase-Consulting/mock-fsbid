exports.up = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.string('suffix_name');
    })
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.dropColumn('suffix_name');
    })
};