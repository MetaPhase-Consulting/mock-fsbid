exports.up = function(knex) {
  return knex.schema
    .alterTable('remarks', function(table) {
      table.datetime('rmrkupdatedate')
      table.datetime('rmrkcreatedate')
      table.integer('rmrkcreateid')
      table.integer('rmrkupdateid')
    });
};
exports.down = function(knex) {
  return knex.schema
    table.dropColumn('rmrkupdatedate')
    table.dropColumn('rmrkcreatedate')
    table.dropColumn('rmrkcreateid')
    table.dropColumn('rmrkupdatedate')
};
