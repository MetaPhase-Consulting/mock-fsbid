exports.up = function(knex) {
  return knex.schema
    .createTable('postindicators', function(table) {
      table.text('bt_column_name')
      table.text('bt_column_desc')
    })
};
exports.down = function(knex) {
  return knex.schema
    dropTable('postindicators')
};
