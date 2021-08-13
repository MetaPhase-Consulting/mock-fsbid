exports.up = function(knex) {
  return knex.schema
    .createTable('panelmeetingdatetypes', function(table) {
      table.string('mdtcode').primary()
      table.string('mdtdesctext')
      table.string('mdtincludetimeind')
      table.string('mdtuserinputind')
      table.integer('mdtordernum')
    });
};
exports.down = function(knex) {
  return knex.schema
    .dropTable('panelmeetingdatetypes')
};
