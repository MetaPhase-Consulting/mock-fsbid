exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingdates', function(table) {
      table.string('mdtcode')
      table.integer('pmseqnum')

      table.foreign('mdtcode').references('panelmeetingdatetypes.mdtcode')
      table.foreign('pmseqnum').references('panelmeetings.pmseqnum')
      table.datetime('pmddttm')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingdates')
};
