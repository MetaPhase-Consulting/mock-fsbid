exports.up = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.timestamp('ppos_capsule_modify_dt')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.dropColumn('ppos_capsule_modify_dt')
  });
};