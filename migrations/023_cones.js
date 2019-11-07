exports.up = function(knex) {
    return knex.schema
      .createTable('cones', function(table) {
        table.increments('cone_id').primary();
        table.string('cycle_name');
        table.string('cycle_status_code');
      });
  };
  exports.down = function(knex) {
    return knex.schema
      .dropTable('cones');
  };