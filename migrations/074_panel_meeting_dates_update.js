exports.up = function(knex) {
  return knex.schema
    .dropTable('panelmeetingdates')
    .createTable('panelmeetingdates', function(table) {
      table.increments('id').primary();
      table.string('mdtcode')
      table.integer('pmseqnum')

      table.foreign('mdtcode').references('panelmeetingdatetypes.mdtcode')
      table.foreign('pmseqnum').references('panelmeetings.pmseqnum')
      table.datetime('pmddttm')
    })
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingdates')
};
