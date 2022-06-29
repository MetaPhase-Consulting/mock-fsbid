exports.up = function(knex) {
  return knex.schema
    .createTable('travelfunctions', function(table) {
      table.string('tfcd').primary()

      table.string('tfdescr')
      table.string('tfshortnm')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('travelfunctions')
};