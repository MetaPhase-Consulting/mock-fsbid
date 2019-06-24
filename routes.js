const bidding = require('./bids')
const projectedVacancies = require('./projectedVacancies')
const bidSeasons = require('./bidSeasons')

var appRouter = function (app) {
  app.get("/", function(req, res) {
    res.status(200).send("Welcome to our restful API");
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

  app.get('/bidSeasons', function(req, res) {
    res.status(200).send(bidSeasons.get_bid_seasons(req.query));
  });
};

module.exports = appRouter;
