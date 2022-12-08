exports.up = function (knex) {
  return knex.schema
    .alterTable('frequentpositions', function (table) {
      table.dropColumn('posorgshortdesc')
      table.dropColumn('posnumtext')
      table.dropColumn('posgradecode')
      table.dropColumn('postitledesc')
      table.foreign('posseqnum').references('pos_seq_num').inTable('positions')
    })
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('frequentpositions', function (table) {
      table.string('posorgshortdesc')
      table.string('posnumtext')
      table.string('posgradecode')
      table.string('postitledesc')
      table.dropForeign(posseqnum)
    });
};
