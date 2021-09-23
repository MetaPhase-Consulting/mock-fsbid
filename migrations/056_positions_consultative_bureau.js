exports.up = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.string('consultative_bureau')
      table.foreign('consultative_bureau').references('bureaus.bur')
    });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('positions', function(table) {
      table.dropColumn('consultative_bureau')
  });
};
