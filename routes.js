const bidding = require('./bids')

var appRouter = function (app) {
  app.get("/", function(req, res) {
    res.status(200).send("Welcome to our restful API");
  });

  app.get("/bids", function (req, res) {
    res.status(200).send(bidding.get_bids(req.query));
  });

  app.post('/bids', function(req, res) {
    res.status(201).send(bidding.add_bid(req.body)) 
  });

  app.delete('/bids', function(req, res) {
    res.status(201).send(bidding.remove_bid(req.query))
  });
};

module.exports = appRouter;
