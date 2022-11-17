exports.up = function(knex) {
  return knex.schema
    .createTable('frequentpositions', function(table) {
      table.integer('posseqnum').primary();

      table.string('posorgshortdesc')
      table.string('posnumtext')
      table.string('posgradecode')
      table.string('postitledesc')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('frequentpositions');
};