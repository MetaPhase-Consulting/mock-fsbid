exports.up = function(knex) {
  return knex.schema
    .createTable('bidstats', function(table) {
      table.increments('id').primary();
      table.integer('cp_id');
      table.integer('cp_ttl_bidder_qty').defaultTo(0);
      table.integer('cp_at_grd_qty').defaultTo(0);
      table.integer('cp_in_cone_qty').defaultTo(0);
      table.integer('cp_at_grd_in_cone_qty').defaultTo(0);
       
      table.foreign('cp_id').references('availablepositions.cp_id');
    })
    .alterTable('availablepositions', function(table) {
      table.dropColumn('cp_ttl_bidder_qty');
      table.dropColumn('cp_at_grd_qty');
      table.dropColumn('cp_in_cone_qty');
      table.dropColumn('cp_at_grd_in_cone_qty');
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('bidstats')
    .alterTable('availablepositions', function(table) {
      table.integer('cp_ttl_bidder_qty');
      table.integer('cp_at_grd_qty');
      table.integer('cp_in_cone_qty');
      table.integer('cp_at_grd_in_cone_qty');
    });
};