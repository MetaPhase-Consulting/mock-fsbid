exports.up = function(knex) {
  return knex.schema
    .createTable('remarksinsertiontext', function(table) {
      table.integer('riseqnum').primary()
      table.integer('rirmrkseqnum')

      table.foreign('rirmrkseqnum').references('remarks.rmrkseqnum')

      table.string('riinsertiontext')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('remarksinsertiontext');
};
