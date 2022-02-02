exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingtypes', function(table) {
      table.string('pmtcode').primary()
      table.string('pmtdesctext')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingtypes')
};
