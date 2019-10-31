exports.up = function(knex) {
  return knex.schema
    .createTable('seasons', function(table) {
      table.increments('bsn_id').primary();
      table.string('bsn_descr_text');
      table.integer('snt_seq_num');
      table.date('bsn_start_date')
      table.date('bsn_end_date')
      table.string('bsn_create_id')
      table.date('bsn_create_date')
      table.string('bsn_update_id')
      table.date('bsn_update_date')
      table.date('bsn_panel_cutoff_date')
      table.string('bsn_future_vacancy_ind')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('seasons');
};