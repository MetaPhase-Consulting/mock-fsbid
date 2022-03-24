exports.up = function(knex) {
  return knex.schema
    .createTable('remark_categories', function(table) {
      table.string('rccode').primary()
      table.string('rcdesctext')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('remark_categories');
};
