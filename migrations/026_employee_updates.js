exports.up = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.string('email')
      table.string('fullname')

      table.foreign('role').references('roles.code')

    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees', function(table) {
      table.dropForeign('role')
      table.dropColumn('email')
      table.dropColumn('fullname')
  });
};