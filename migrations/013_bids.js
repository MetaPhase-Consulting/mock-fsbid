exports.up = function(knex) {
  return knex.schema
    .createTable('bids', function(table) {
      table.increments('id').primary();
      table.integer('perdet_seq_num');
      table.integer('cp_id');
      table.string('ubw_hndshk_offrd_flg').defaultTo('N');
      table.timestamp('ubw_hndshk_offrd_dt');
      table.timestamp('ubw_create_dt').defaultTo(knex.fn.now());
      table.timestamp('ubw_submit_dt')
      table.string('bs_cd').defaultTo('W');
      table.string('bs_descr_txt').defaultTo('Not Submitted')

      table.foreign('cp_id').references('availablepositions.cp_id')
      table.foreign('perdet_seq_num').references('employees.perdet_seq_num')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('bids');
};