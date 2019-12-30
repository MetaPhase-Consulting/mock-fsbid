let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index.js');

chai.should();
chai.use(chaiHttp);

global.chai = chai
global.server = server
  