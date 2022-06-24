exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetings', function(table) {
      table.integer('pmseqnum').primary()

      table.string('pmscode')
      table.string('pmpmtcode')
      table.foreign('pmscode').references('panelmeetingstatuses.pmscode')
      table.foreign('pmpmtcode').references('panelmeetingtypes.pmpmtcode')

      table.string('pmvirtualind')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetings')
};
