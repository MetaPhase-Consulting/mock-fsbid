exports.up = function(knex) {
  return knex.schema
    .createTable('positions', function(table) {
      table.increments('pos_seq_num').primary();
      table.string('pos_title_desc');
      table.string('pos_location_code');
      table.string('ted');
      table.string('lang1');
      table.string('lang2');
      table.string('tod');
      table.string('pos_skill_desc');
      table.string('pos_job_category_desc');
      table.string('pos_grade_code');
      table.integer('bt_differential_rate_num');
      table.integer('bt_danger_pay_num');
      table.string('incumbent')
      table.string('position');
      table.string('ppos_capsule_descr_txt');
      table.timestamp('ppos_capsule_modify_dt')
      table.string("pos_skill_code")
      table.string('bureau')
      table.string('org_code')

      table.unique('position')

      table.foreign('pos_location_code').references('locations.location_code')
      table.foreign('org_code').references('organizations.code')
      table.foreign('tod').references('tourofduties.code')
      table.foreign('lang1').references('languages.language_code')
      table.foreign('lang2').references('languages.language_code')
      table.foreign('bureau').references('bureaus.bur')
    })
    .alterTable('availablepositions', function(table) {

      table.dropForeign('pos_location_code')
      table.dropForeign('org_code')
      table.dropForeign('tod')
      table.dropForeign('lang1')
      table.dropForeign('lang2')
      table.dropForeign('bureau')

      table.dropColumn('pos_seq_num')
      table.dropColumn('pos_title_desc')
      table.dropColumn('pos_location_code')
      table.dropColumn('lang1')
      table.dropColumn('lang2')
      table.dropColumn('tod')
      table.dropColumn('ted')
      table.dropColumn('pos_skill_desc')
      table.dropColumn('pos_job_category_desc');
      table.dropColumn('pos_grade_code')
      table.dropColumn('bt_differential_rate_num')
      table.dropColumn('bt_danger_pay_num');
      table.dropColumn('incumbent')
      table.dropColumn('ppos_capsule_descr_txt');
      table.dropColumn('ppos_capsule_modify_dt')
      table.dropColumn("pos_skill_code")
      table.dropColumn('bureau_code')
      table.dropColumn('org_code')
      table.dropColumn('bureau')

      table.foreign('position').references('positions.position')
    })
    .alterTable('futurevacancies', function(table) {
      table.dropForeign('pos_location_code')
      table.dropForeign('org_code')
      table.dropForeign('tod')
      table.dropForeign('lang1')
      table.dropForeign('lang2')
      table.dropForeign('bureau')
      
      table.dropColumn('pos_title_desc')
      table.dropColumn('pos_location_code')
      table.dropColumn('ted')
      table.dropColumn('bureau_code')
      table.dropColumn('pos_skill_desc')
      table.dropColumn('pos_job_category_desc');
      table.dropColumn('pos_grade_code')
      table.dropColumn('lang1')
      table.dropColumn('lang2')
      table.dropColumn('tod')
      table.dropColumn('bt_differential_rate_num')
      table.dropColumn('bt_danger_pay_num');
      table.dropColumn('incumbent')
      table.dropColumn('ppos_capsule_descr_txt');
      table.dropColumn('ppos_capsule_modify_dt')
      table.dropColumn('org_code')
      table.dropColumn("pos_skill_code")
      table.dropColumn('bureau')

      table.foreign('position').references('positions.position')
    });
};
exports.down = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.dropForeign('position')

      table.string('pos_title_desc');
      table.string('pos_location_code');
      table.string('ted');
      table.string('lang1');
      table.string('lang2');
      table.string('tod');
      table.string('pos_skill_desc');
      table.string('pos_job_category_desc');
      table.string('pos_grade_code');
      table.integer('bt_differential_rate_num');
      table.integer('bt_danger_pay_num');
      table.string('incumbent')
      table.string('ppos_capsule_descr_txt');
      table.timestamp('ppos_capsule_modify_dt')
      table.string("pos_skill_code")
      table.string('bureau')
      table.string('org_code')
      table.string('pos_seq_num')

      table.foreign('pos_location_code').references('locations.location_code')
      table.foreign('org_code').references('organizations.code')
      table.foreign('tod').references('tourofduties.code')
      table.foreign('lang1').references('languages.language_code')
      table.foreign('lang2').references('languages.language_code')
      table.foreign('bureau').references('bureaus.bur')

    }).alterTable('futurevacancies', function(table) {
      table.dropForeign('position')

      table.string('pos_title_desc');
      table.string('pos_location_code');
      table.string('ted');
      table.string('lang1');
      table.string('lang2');
      table.string('tod');
      table.string('pos_skill_desc');
      table.string('pos_job_category_desc');
      table.string('pos_grade_code');
      table.integer('bt_differential_rate_num');
      table.integer('bt_danger_pay_num');
      table.string('incumbent')
      table.string('ppos_capsule_descr_txt');
      table.timestamp('ppos_capsule_modify_dt')
      table.string("pos_skill_code")
      table.string('bureau')
      table.string('org_code')
    table.string('pos_seq_num')


      table.foreign('pos_location_code').references('locations.location_code')
      table.foreign('org_code').references('organizations.code')
      table.foreign('tod').references('tourofduties.code')
      table.foreign('lang1').references('languages.language_code')
      table.foreign('lang2').references('languages.language_code')
      table.foreign('bureau').references('bureaus.bur')
    }).dropTable('positions')
};