const { PRIVATE_KEY } = require('./constants')
const bidding = require('./services/bids')
const futureVacancies = require('./services/futurevacancies')
const availablePositions = require('./services/availablepositions')
const employees = require('./services/employees')
const postattributes = require('./services/postattributes')
const lookups = require('./services/lookups')

const jwt = require('jsonwebtoken');
const _ = require('lodash');
const PDFDocument = require('pdfkit');
const getStream = require('get-stream')

var appRouter = function (app) {
  app.get("/", function(req, res) {
    res.status(200).send("Welcome to our restful API!");
  });

  app.get("/Authorize", async function (req, res) {
    const { sAppCircuitID } = req.query
    if (!sAppCircuitID) {
      res.status(401).send("You must provide a sAppCircuitID value")
      return
    }
    const username = req.get('tmusrname')
    const [employee] = await employees.get_employee_by_username(username)
    if (!employee) {
      res.status(403).send(`No user with username ${username} was found`)
      return
    }
    // Token payload
    const payload = {
      role: employee.roles.map(r => r.code),
      unique_name: employee.ad_id,
      display_name: username,
      email: `${username}@state.gov`,
      sub: employee.perdet_seq_num,
      system: "32",
      iss: "HR/EX/SDD",
    }
    res.status(200).send(jwt.sign(
      payload,
      PRIVATE_KEY,
      {
        expiresIn: 900000,
        notBefore: 100,
        audience: req.headers.host,
        jwtid: 'test-12345',
      }));
  });

  app.get('/HR/Employees/:id/EmployeeProfileReportByCDO', async function (req, res) {
    async function pdf() {
      const doc = new PDFDocument()
      doc.text(`Here is a client profile PDF for ${req.params.id}. Enjoy!`)
      doc.end()
      return await getStream.buffer(doc)
    }
    const pdfBuffer = await pdf()
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
    });
    const download = Buffer.from(pdfBuffer);
    res.end(download)
  });

  app.get("/bids/cycleposition", async function (req, res) {
    let isCDO = false;
    if (!req.headers.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    }
    res.status(200).send(await bidding.get_bids_by_cp(req.query));
  });

  app.get("/bids", async function (req, res) {
    let isCDO = false;
    if (!req.headers.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    } else {
      const decoded = jwt.decode(req.headers.jwtauthorization, {complete: true});
      const found = _.get(decoded, 'payload.role', []).some(r => ['CDO', 'CDO3'].includes(r));
      isCDO = found;
    }
    res.status(200).send(await bidding.get_bids(req.query, isCDO));
  });

  app.post('/bids', async function(req, res) {
    try {
      res.status(200).send(await bidding.add_bid(req.query))
    } catch (err) {
      console.error('Error occurred creating bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });

  app.put('/bids', async function(req, res) {
    try {
      res.status(200).send(await bidding.submit_bid(req.query))
    } catch (err) {
      console.error('Error occurred submitting bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });

  app.patch('/bids/handshake', async function(req, res) {
    if (!req.query.perdet_seq_num || !req.query.cp_id) {
      res.status(200).send({ Data: null, usl_id: 4000003, return_code: -2 })
    };
    try {
      if (req.query.perdet_seq_num && req.query.cp_id) {
        if (req.query.hs_cd === "HS") {
          res.status(200).send(await bidding.register_bid(req.query))
        } else if (!req.query.hs_cd) {
          res.status(200).send(await bidding.unregister_bid(req.query))
        } else {
          res.status(200).send({ Data: null, usl_id: 4000013, return_code: -2 })
        }
      } else {
        res.status(200).send({ Data: null, usl_id: 4000033, return_code: -2 })
      }
    } catch (err) {
      console.error('Error registering/unregistering handshake')
      console.error(`${err}`)
      res.status(200).send({ Data: null, usl_id: 4000002, return_code: -2 })
    }
  });

  app.delete('/bids', async function(req, res) {
    res.status(200).send(await bidding.remove_bid(req.query))
  });

  app.put('/bids/offerHandshake', async function(req, res) {
    try {
      res.status(200).send(await bidding.offer_handshake(req.query))
    } catch (err) {
      console.error('Error occurred offering handshake on bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.put('/bids/panel', async function(req, res) {
    try {
      res.status(200).send(await bidding.panel_bid(req.query))
    } catch (err) {
      console.error('Error occurred paneling bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.put('/bids/assign', async function(req, res) {
    try {
      res.status(200).send(await bidding.assign_bid(req.query))
    } catch (err) {
      console.error('Error occurred assigning bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.get('/futureVacancies', async function(req, res) {
    res.status(200).send(await futureVacancies.get_future_vacancies(req.query))
  });

  app.get('/futureVacanciesCount', async function(req, res) {
    res.status(200).send(await futureVacancies.get_future_vacancies_count(req.query))
  });

  app.get('/availablePositions', async function(req, res) {
    try {
      res.status(200).send(await availablePositions.get_available_positions(req.query))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  });

  app.get('/availablePositionsCount', async function(req, res) {
    res.status(200).send(await availablePositions.get_available_positions_count(req.query))
  });

  app.get('/positions/available/tandem', async function(req, res) {
    res.status(200).send(await availablePositions.get_available_positions_tandem(req.query))
  });

  app.get('/positions/futureVacancies/tandem', async function(req, res) {
    res.status(200).send(await futureVacancies.get_future_vacancies_tandem(req.query))
  });

  app.get('/Employees/userInfo', async function(req, res) {
    const employee = await employees.get_employee_by_ad_id(req.query)
    let employee$ = employee;
    if (Array.isArray(employee$)) {
      employee$ = employee$[0];
    }
    if (!employee$ || !employee$.perdet_seq_num) {
      res.status(404).send(`No employee with ad_id = ${req.query.ad_id} was found`)
      return
    }
    res.status(200).send({
      Data: [
        {
          perdet_seq_num: `${employee$.perdet_seq_num}`
        }
      ]
    })
  })

  app.get('/bureauPermissions', async function(req, res) {
    try {
      const decoded = jwt.decode(req.headers.jwtauthorization, {complete: true});
      const found = _.get(decoded, 'payload.unique_name', '');
      const data = await employees.get_employee_bureaus_by_query({ ad_id: found });
      res.status(200).send({
        Data: data,
        usl_id: 0,
        return_code: 0
      })
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  });

  app.get('/Assignments', async function(req, res) {
    const data = await employees.get_assignments(req.query)
    res.status(200).send({
      Data: data,
      usl_id: 0,
      return_code: 0
    })
  })

  // Common look up function
  const lookup = fn => async (req, res) => res.status(200).send(await fn())

  app.get('/bidSeasons', lookup(lookups.get_seasons))
  app.get('/cycles', lookup(lookups.get_cycles))
  app.get('/grades', lookup(lookups.get_grades))
  app.get('/languages', lookup(lookups.get_languages))
  app.get('/dangerpays', lookup(lookups.get_dangerpays))
  app.get('/differentialrates', lookup(lookups.get_differentialrates))
  app.get('/tourofduties', lookup(lookups.get_tourofduties))
  app.get('/bureaus', lookup(lookups.get_bureaus))
  app.get('/skillCodes', lookup(lookups.get_codes))
  app.get('/Locations', lookup(lookups.get_locations))

  app.get('/references/postAttributes', async function(req, res) {
    // TODO - add all post attributes tables by query param
    const data = await postattributes.get_postattributes(req.query)
    res.status(200).send(data)
  })

  app.get('/Agents', async function(req, res) {
    const agents = await employees.get_agents(req.query)

    res.status(200).send({
      Data: agents,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/CDOClients', async function(req, res) {
    const clients = await employees.get_clients(req.query)

    res.status(200).send({
      Data: clients,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/bidderTrackingPrograms', async function(req, res) {
    const classifications = await employees.get_classifications(req.query)

    res.status(200).send({
      Data: classifications,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/Persons', async function(req,res) {
    const persons = await employees.get_persons(req.query)

    res.status(200).send({
      Data: persons,
      usl_id: 0,
      return_code: 0
    })
  })
};

module.exports = appRouter;
