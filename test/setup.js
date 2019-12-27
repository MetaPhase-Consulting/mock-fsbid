const knex = require('../src/bookshelf.js').knex;

before(async function() {
  try {
    await knex.migrate.latest();
    await knex.seed.run({directory: './seeds'});
  } catch(e) {
    console.log(e)
    return
  }
});