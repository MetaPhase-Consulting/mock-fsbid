exports.up = function(knex) {
  return knex.schema
    .alterTable('employees_classifications', function(table) {
      table.integer('te_id').notNullable().alter();
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('employees_classifications', function(table) {
      table.integer('te_id').nullable().alter();
    });
};