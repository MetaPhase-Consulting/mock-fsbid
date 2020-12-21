exports.up = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.integer('jc_id_2');

      table.foreign('jc_id_2').references('codes.jc_id')

    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {

      table.dropColumn('jc_id_2');
    });
};
