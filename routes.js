const { PRIVATE_KEY } = require('./constants')
const bidding = require('./bids')
const projectedVacancies = require('./projectedVacancies')
const bidSeasons = require('./bidSeasons')
const availablePositions = require('./availablePositions')
const jwt = require('jsonwebtoken');

var appRouter = function (app) {
  app.get("/", function(req, res) {
    res.status(200).send("Welcome to our restful API");
  });

  app.get("/Authorize", function (req, res) {
    const { sAppCircuitID } = req.query
    if (!sAppCircuitID) {
      res.status(401).send("You must provide a sAppCircuitID value")
      return
    }
    res.status(200).send(jwt.sign({ sAppCircuitID: sAppCircuitID }, PRIVATE_KEY));
  });

  app.get("/bids", function (req, res) {
    res.status(200).send(bidding.get_bids(req.query));
  });

  app.post('/bids', function(req, res) {
    try {
      res.status(201).send(bidding.add_bid(req.body))
    } catch (err) {
      res.status(422).send(err)
    }
  });

  app.delete('/bids', function(req, res) {
    res.status(201).send(bidding.remove_bid(req.query))
  });

  app.get('/futureVacancies', function(req, res) {
    res.status(200).send(projectedVacancies.get_projected_vacancies(req.query))
  });

  app.get('/futureVacanciesCount', function(req, res) {
    res.status(200).send(projectedVacancies.get_projected_vacancies_count(req.query))
  });

  app.get('/availablePositions', function(req, res) {
    res.status(200).send(availablePositions.get_available_positions(req.query))
  });

  app.get('/availablePositionsCount', function(req, res) {
    res.status(200).send(availablePositions.get_available_positions_count(req.query))
  });

  app.get('/bidSeasons', function(req, res) {
    res.status(200).send(bidSeasons.get_bid_seasons(req.query));
  });
};

module.exports = appRouter;
