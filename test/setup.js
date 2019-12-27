process.env.NODE_ENV = 'test';
process.env.DB_CLIENT = 'sqlite3'
process.env.DB_FILENAME = ':memory:' 
process.env.DEBUG = false
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