exports.up = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.string('bt_consumable_allowance_flg')
      table.string('bt_service_needs_diff_flg')
      table.string('bt_most_difficult_to_staff_flg')
      table.string('bt_inside_efm_employment_flg')
      table.string('bt_outside_efm_employment_flg')
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('availablepositions', function(table) {
      table.dropColumn('bt_consumable_allowance_flg')
      table.dropColumn('bt_service_needs_diff_flg')
      table.dropColumn('bt_most_difficult_to_staff_flg')
      table.dropColumn('bt_inside_efm_employment_flg')
      table.dropColumn('bt_outside_efm_employment_flg')
  });
};
