exports.up = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.dropColumn('pos_skill_desc');
      table.dropColumn('pos_skill_code');
      table.integer('jc_id');

      table.foreign('jc_id').references('codes.jc_id')

    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.string('pos_skill_desc')
      table.string('pos_skill_code')
      
      table.dropColumn('jc_id');
    });
};