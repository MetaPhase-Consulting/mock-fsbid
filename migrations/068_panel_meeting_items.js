exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingitems', function(table) {
      table.integer('pmiseqnum').primary()

      table.integer('pmseqnum')
      table.string('miccode')
      table.foreign('pmseqnum').references('panelmeetings.pmseqnum')
      table.foreign('miccode').references('panelmeetingitemcategories.miccode')

      table.integer('pmiofficialitemnum')
      table.string('pmiaddendumind')
      table.string('pmilabeltext')
      table.integer('pmicreateid')
      table.date('pmicreatedate')
      table.integer('pmiupdateid')
      table.date('pmiupdatedate')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingitems')
};
