exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetings', function(table) {
      table.integer('pmseqnum').primary()

      table.string('pmscode')
      table.string('pmtcode')
      table.foreign('pmscode').references('panelmeetingstatuses.pmscode')
      table.foreign('pmtcode').references('panelmeetingtypes.pmtcode')

      table.string('pmvirtualind')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetings')
};
