exports.up = function(knex) {
    return knex.schema
    .alterTable('legactiontypes', function(table) {
        table.dropColumn('latabbredesctext')
        table.string('latabbrdesctext')
    })
};

exports.down = function(knex) {
    return knex.schema
    .alterTable('legactiontypes', function(table) {
        table.dropColumn('latabbrdesctext')
        table.string('latabbredesctext')
    });
};
