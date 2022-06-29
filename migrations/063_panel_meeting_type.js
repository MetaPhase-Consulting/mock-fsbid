exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingtypes', function(table) {
      table.string('pmpmtcode').primary()
      table.string('pmtdesctext')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingtypes')
};
