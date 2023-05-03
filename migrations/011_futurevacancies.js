exports.up = function(knex) {
  return knex.schema
    .createTable('futurevacancies', function(table) {
      table.increments('fv_seq_num').primary();
      table.string('pos_title_desc');
      table.string('pos_location_code');
      table.string('post_org_country_state');
      table.timestamp('ted');
      table.timestamp('fv_override_ted_date');
      table.integer('bsn_id');
      table.string('bureau_code');
      table.string('bsn_descr_text');
      table.string('pos_skill_desc');
      table.string('pos_job_category_desc');
      table.string('pos_grade_code');
      table.string('bureau_desc');
      table.string('lang1');
      table.string('lang2');
      table.string('tod');
      table.integer('bt_differential_rate_num');
      table.integer('bt_danger_pay_num');
      table.string('incumbent');
      table.string('position');
      table.string('ppos_capsule_descr_txt');

      table.foreign('tod').references('tourofduties.todcode')
      table.foreign('lang1').references('languages.language_code')
      table.foreign('lang2').references('languages.language_code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('futurevacancies');
};