exports.up = function (knex) {
  return knex.schema
    .alterTable('panelmeetingitems', function (table) {
      table.string('pmtcode')
    })
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('panelmeetingitems', function (table) {
      table.dropColumn('pmtcode')
    });
};
