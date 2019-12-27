exports.up = function(knex) {
  return knex.schema
    .createTable('availablepositions', function(table) {
      table.increments('cp_id').primary();
      table.string('cp_status');
      table.string('pos_title_desc');
      table.string('pos_location_code');
      table.string('post_org_country_state')
      table.timestamp('ted');
      table.timestamp('cp_ted_ovrrd_dt');
      table.string('bureau_code');
      table.string('lang1');
      table.string('lang2');
      table.string('tod');
      table.integer('cycle_id')
      table.string('pos_skill_desc');
      table.string('pos_job_category_desc');
      table.string('pos_grade_code');
      table.integer('bt_differential_rate_num');
      table.integer('bt_danger_pay_num');
      table.string('incumbent');
      table.string('position');
      table.string('ppos_capsule_descr_txt');
      table.integer('cp_ttl_bidder_qty');
      table.integer('cp_at_grd_qty');
      table.integer('cp_in_cone_qty');
      table.integer('cp_at_grd_in_cone_qty');
      table.timestamp("cp_post_dt");
      table.string("pos_bureau_short_desc");
      table.string("pos_skill_code");

      table.foreign('cycle_id').references('cycles.cycle_id')
      table.foreign('tod').references('tourofduties.code')
      table.foreign('lang1').references('languages.language_code')
      table.foreign('lang2').references('languages.language_code')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('availablepositions');
};