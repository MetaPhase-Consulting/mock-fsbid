require("dotenv-safe").config();

var express = require("express");
var bodyParser = require("body-parser");
var morganBody = require("morgan-body");
var cors = require('cors')
var routes = require("./routes.js");

var app = express();

const tokenValidator = function (req, res, next) {
  if (req.path === '/' || req.path === '/token') {
    next()
  } else {
    const { authorization } = req.headers
    if (authorization) {
      const tokenParts = authorization.split(" ")
      if (tokenParts[1] && tokenParts[0].indexOf("Bearer") >= 0) {
        next()
        return
      }
    }
    res.status(401).send('Get a token')
  }
};

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(tokenValidator);

morganBody(app);

routes(app);

var server = app.listen(process.env.PORT, function() {
  console.log("app running on port.", server.address().port);
});
