exports.up = function (knex) {
  return knex.schema
    .alterTable('frequentpositions', function (table) {
      table.dropColumn('posseqnum')
      table.dropColumn('posorgshortdesc')
      table.dropColumn('posnumtext')
      table.dropColumn('posgradecode')
      table.dropColumn('postitledesc')
    })
    .alterTable('frequentpositions', function (table) {
      table.integer('posseqnum').primary();
      table.foreign('posseqnum').references('pos_seq_num').inTable('positions')
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('frequentpositions', function (table) {
      table.string('posorgshortdesc')
      table.string('posnumtext')
      table.string('posgradecode')
      table.string('postitledesc')
      table.dropForeign('posseqnum')
    });
};
