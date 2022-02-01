exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingitemcategories', function(table) {
      table.string('miccode').primary()
      table.string('micdesctext')

      table.integer('micordernum')
      table.string('micvirtualallowedind')
      table.integer('miccreateid')
      table.date('miccreatedate')
      table.integer('micupdateid')
      table.date('micupdatedate')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingitemcategories')
};