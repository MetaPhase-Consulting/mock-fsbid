require("dotenv-safe").config();

var express = require("express");
var bodyParser = require("body-parser");
var morganBody = require("morgan-body");
var cors = require('cors')
var routes = require("./routes.js");

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

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(validateRequest);

morganBody(app);

routes(app);

var server = app.listen(process.env.PORT, function() {
  console.log("app running on port.", server.address().port);
});
