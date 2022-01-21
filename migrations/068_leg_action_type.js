exports.up = function(knex) {
  return knex.schema
    .createTable('legactiontype', function(table) {
      table.string('latcode').primary()

      table.string('latabbrdesctext')
      table.string('latdesctext')
      table.integer('latordernum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('legactiontype')
};