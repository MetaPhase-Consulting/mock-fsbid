exports.up = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.string('office_phone')
      table.string('office_address')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.dropColumn('office_phone')
      table.dropColumn('office_address')
  });
};