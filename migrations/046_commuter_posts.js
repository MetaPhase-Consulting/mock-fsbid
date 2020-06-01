exports.up = function(knex) {
  return knex.schema
    .createTable('commuterposts', function(table) {
      table.string('cpn_code').primary()
      table.unique('cpn_code')
      table.string('cpn_desc')
      table.string('cpn_freq_desc')
    })
};
exports.down = function(knex) {
  return knex.schema
    dropTable('commuterposts')
};
