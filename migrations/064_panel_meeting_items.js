exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingitems', function(table) {
      table.integer('pmiseqnum').primary()

      table.string('pmiaddendumind')
      table.string('pmilabeltext')
      table.string('pmiofficialitemnum')

      table.string('pmseqnum')
      table.string('miccode')
      table.foreign('pmseqnum').references('panelmeetings.pmseqnum')
      table.foreign('miccode').references('panelmeetingitemcategories.miccode')
      // table.foreign('aiseqnum').references('agendaitems.aiseqnum')

    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingitems')
};
