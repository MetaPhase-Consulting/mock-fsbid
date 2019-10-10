const { PRIVATE_KEY } = require('./constants')
const bidding = require('./services/bids')
const projectedVacancies = require('./services/projectedVacancies')
const bidSeasons = require('./services/bidSeasons')
const availablePositions = require('./services/availablePositions')
const employees = require('./services/employees')
const lookups = require('./services/lookups')

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
    const username = req.get('tm_usrname')
    const employee = employees.get_employee_by_username(username)
    if (!employee) {
      res.status(403).send(`No user with userId ${username} was found`)
      return
    }
    res.status(200).send(jwt.sign({ unique_name: employee.ad_id }, PRIVATE_KEY));
  });

  app.get("/bids", function (req, res) {
    res.status(200).send(bidding.get_bids(req.query));
  });

  app.post('/bids', function(req, res) {
    try {
      res.status(200).send(bidding.add_bid(req.query))
    } catch (err) {
      console.error('Error occurred creating bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });

  app.put('/bids', function(req, res) {
    try {
      res.status(200).send(bidding.submit_bid(req.query))
    } catch (err) {
      console.error('Error occurred submitting bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });

  app.delete('/bids', function(req, res) {
    res.status(200).send(bidding.remove_bid(req.query))
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

  app.get('/Employees/userInfo', function(req, res) {
    const employee = employees.get_employee_by_ad_id(req.query)
    if (!employee) {
      res.status(404).send(`No employee with ad_id = ${req.query.ad_id} was found`)
      return
    }
    res.status(200).send({
      Data: [
        {
          perdet_seq_num: `${employee.perdet_seq_num}`
        }
      ]
    })
  })

  app.get('/cycles', function(req, res) {
    res.status(200).send(lookups.get_cycles())
  })

  app.get('/grades', function(req, res) {
    res.status(200).send(lookups.get_grades())
  })

  app.get('/languages', function(req, res) {
    res.status(200).send(lookups.get_languages())
  })

  app.get('/dangerpays', function(req, res) {
    res.status(200).send(lookups.get_dangerpays())
  })

  app.get('/differentialrates', function(req, res) {
    res.status(200).send(lookups.get_differentialrates())
  })

  app.get('/tourofduties', function(req, res) {
    res.status(200).send(lookups.get_tourofduties())
  })

  app.get('/bureaus', function(req, res) {
    res.status(200).send(lookups.get_bureaus())
  })

  app.get('/codes', function(req, res) {
    res.status(200).send(lookups.get_codes())
  })

};

module.exports = appRouter;
