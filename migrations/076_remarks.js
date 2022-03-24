exports.up = function(knex) {
  return knex.schema
    .createTable('remarks', function(table) {
      table.integer('rmrkseqnum').primary()
      table.string('rmrkrccode')
      table.integer('rmrkordernum')
      table.string('rmrkshortdesctext')
      table.string('rmrkmutuallyexclusiveind')
      table.string('rmrktext')
      table.string('rmrkactiveind')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('remarks');
};
