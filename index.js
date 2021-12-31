require("dotenv-safe").config({ allowEmptyValues: true });

var express = require("express");
var bodyParser = require("body-parser");
var morganBody = require("morgan-body");
var cors = require('cors')
var routes = require("./src/routes.js");
require('./src/bookshelf.js')

var app = express();

const validateRequest = function (req, res, next) {
  if (req.path === '/' || req.path === '/Authorize') {
    next()
  } else {
    if (req.headers.jwtauthorization) {
      next()
    } else {
      res.status(401).send('JWTAuthorization header are required')
    }
  };
};

const limitRequestLength = function (req, res, next) {
  if (req.originalUrl.length <= 2500) {
    next()
  } else {
    res.status(500).send('Request URL too long')
  };
};

var corsOptions = {
  origin: function (origin, callback) {
    // dynamic origin (returns the origin used)
    callback(null, [origin])
  },
  credentials: true,
}

app.use(cors(corsOptions))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validateRequest);
app.use(limitRequestLength);

if (process.env.NODE_ENV === 'development') {
  morganBody(app);
}

routes(app);

var server = app.listen(process.env.PORT, function() {
  console.log("app running on port.", server.address().port);
});

module.exports = server // For Testing
