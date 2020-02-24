let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../index.js');

chai.should();
chai.use(chaiHttp);

global.chai = chai
global.server = server

global.flattenObject = (obj, prefix = '') =>
  Object.keys(obj).reduce((acc, k) => {
    const pre = prefix.length ? prefix + '.' : '';
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) Object.assign(acc, flattenObject(obj[k], pre + k));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});
  