require("dotenv-safe").config();

var express = require("express");
var bodyParser = require("body-parser");
var morganBody = require("morgan-body");
var routes = require("./routes.js");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

morganBody(app);

routes(app);

var server = app.listen(process.env.PORT, function() {
  console.log("app running on port.", server.address().port);
});
