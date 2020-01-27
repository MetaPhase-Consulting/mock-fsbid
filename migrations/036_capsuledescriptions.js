exports.up = function(knex) {
  return knex.schema
    .createTable('capsuledescriptions', function(table) {
      table.increments('id').primary();
      table.integer('pos_seq_num');
      table.text('description');
      table.timestamp('last_modified').default(knex.fn.now())

      table.unique('pos_seq_num')

      table.foreign('pos_seq_num').references('positions.pos_seq_num')
    })
    .alterTable('positions', function(table) {

      table.dropColumn('ppos_capsule_descr_txt');
      table.dropColumn('ppos_capsule_modify_dt')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.string('ppos_capsule_descr_txt');
      table.timestamp('ppos_capsule_modify_dt')

    }).dropTable('capsuledescriptions')
};