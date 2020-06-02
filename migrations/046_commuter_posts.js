exports.up = function(knex) {
  return knex.schema
    .createTable('commuterposts', function(table) {
      table.increments('cpn_code').primary()
      table.string('cpn_desc')
      table.string('cpn_freq_desc')
      table.string('location_code_1')
      table.string('location_code_2')

      table.foreign('location_code_1').references('locations.location_code')
      table.foreign('location_code_2').references('locations.location_code')
    })
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('commuterposts')
};
