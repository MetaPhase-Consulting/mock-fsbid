exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingitemcategories', function(table) {
      table.string('miccode').primary()
      table.string('micdesctext')
      table.string('micvirtualallowedind')
      table.integer('micordernum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingitemcategories')
};