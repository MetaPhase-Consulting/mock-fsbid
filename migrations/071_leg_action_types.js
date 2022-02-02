exports.up = function(knex) {
  return knex.schema
    .createTable('legactiontypes', function(table) {
      table.string('latcode').primary()

      table.string('latabbredesctext')
      table.string('latdesctext')
      table.integer('latordernum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('legactiontypes')
};