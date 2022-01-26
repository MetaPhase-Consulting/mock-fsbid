const { PRIVATE_KEY } = require('./constants')
const bidding = require('./services/bids')
const futureVacancies = require('./services/futurevacancies')
const availablePositions = require('./services/availablepositions')
const availableBidders = require('./services/availablebidders')
const employees = require('./services/employees')
const positions = require('./services/positions')
const postattributes = require('./services/postattributes')
const lookups = require('./services/lookups')
const common = require('./services/common')

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
      const text = `Here is a client profile PDF for ${req.params.id}. Enjoy!
      
      `
      doc.text(new Array(100).fill(null).map(() => text).join(''))
      doc.end()
      return await getStream.buffer(doc)
    }
    const pdfBuffer = await pdf()
    const sleep = (t) =>  ({ then: (r) => setTimeout(r, t) })
    await sleep(3000)
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
    });
    const download = Buffer.from(pdfBuffer);
    res.end(download)
  });

  app.get("/v1/cyclePositions/bidders", async function (req, res) {
    let isCDO = false;
    if (!req.headers.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    }
    res.status(200).send(await bidding.get_bids_by_cp(req.query, true));
  });

  app.get("/v1/bids", async function (req, res) {
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

  app.post('/v1/bids', async function(req, res) {
    try {
      res.status(200).send(await bidding.add_bid(req.query))
    } catch (err) {
      console.error('Error occurred creating bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });

  app.put('/v1/bids', async function(req, res) {
    let isCDO = false;
    const decoded = jwt.decode(req.headers.jwtauthorization, {complete: true});
    const roles = _.get(decoded, 'payload.role', []);
    if (_.includes(roles, 'CDO') || _.includes(roles, 'CDO3')) { isCDO = true; }
    try {
      res.status(200).send(await bidding.submit_bid(req.query, isCDO))
    } catch (err) {
      console.error('Error occurred submitting bid')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });

  app.patch('/v1/bids/handshake', async function(req, res) {
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

  app.delete('/v1/bids', async function(req, res) {
    res.status(200).send(await bidding.remove_bid(req.query))
  });

  app.get('/v1/futureVacancies', async function(req, res) {
    res.status(200).send(await futureVacancies.get_future_vacancies(req.query))
  });

  app.post('/v2/futureVacancies', async function(req, res) {
    const body$ = common.convertPostBodyToGetQuery(req.body)
    res.status(200).send(await futureVacancies.get_future_vacancies(body$))
  });

  app.get('/v1/futureVacancies/count', async function(req, res) {
    res.status(200).send(await futureVacancies.get_future_vacancies_count(req.query))
  });

  app.post('/v2/futureVacancies/count', async function(req, res) {
    const body$ = common.convertPostBodyToGetQuery(req.body)
    res.status(200).send(await futureVacancies.get_future_vacancies_count(body$))
  });

  app.get('/v1/cyclePositions/available', async function(req, res) {
    try {
      res.status(200).send(await availablePositions.get_available_positions(req.query))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  });

  app.post('/v2/cyclePositions/available', async function(req, res) {
    try {
      const body$ = common.convertPostBodyToGetQuery(req.body)
      res.status(200).send(await availablePositions.get_available_positions(body$))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  });

  app.get('/v1/cyclePositions/availableCount', async function(req, res) {
    res.status(200).send(await availablePositions.get_available_positions_count(req.query))
  });

  app.post('/v2/cyclePositions/availableCount', async function(req, res) {
    const body$ = common.convertPostBodyToGetQuery(req.body)
    res.status(200).send(await availablePositions.get_available_positions_count(body$))
  });

  app.get('/v1/cyclePositions/availableTandem', async function(req, res) {
    res.status(200).send(await availablePositions.get_available_positions_tandem(req.query))
  });

  app.get('/v1/futureVacancies/tandem', async function(req, res) {
    res.status(200).send(await futureVacancies.get_future_vacancies_tandem(req.query))
  });

  app.post('/v2/cyclepositions/availableTandem', async function(req, res) {
    const body$ = common.convertPostBodyToGetQuery(req.body)
    res.status(200).send(await availablePositions.get_available_positions_tandem(body$))
  });

  app.post('/v2/futureVacancies/tandem', async function(req, res) {
    const body$ = common.convertPostBodyToGetQuery(req.body)
    res.status(200).send(await futureVacancies.get_future_vacancies_tandem(body$))
  });

  app.get('/v1/Employees/userInfo', async function(req, res) {
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

  app.get('/v1/fsbid/bureauPermissions', async function(req, res) {
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

  app.get('/v1/Organizations/Permissions', async function(req, res) {
    try {
      const decoded = jwt.decode(req.headers.jwtauthorization, {complete: true});
      const found = _.get(decoded, 'payload.unique_name', '');
      const data = await employees.get_employee_organizations_by_query({ ad_id: found });
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

  app.get('/v1/Assignments', async function(req, res) {
    const data = await employees.get_assignments(req.query)
    res.status(200).send({
      Data: data,
      usl_id: 0,
      return_code: 0
    })
  })

  // Common look up function
  const lookup = fn => async (req, res) => res.status(200).send(await fn())

  app.get('/v1/fsbid/bidSeasons', lookup(lookups.get_seasons))
  app.get('/v1/cycles', lookup(lookups.get_cycles))
  app.get('/v1/references/grades', lookup(lookups.get_grades))
  app.get('/v1/references/languages', lookup(lookups.get_languages))
  app.get('/v1/posts/dangerpays', lookup(lookups.get_dangerpays))
  app.get('/v1/posts/differentialrates', lookup(lookups.get_differentialrates))
  app.get('/v1/posts/tourofduties', lookup(lookups.get_tourofduties))
  app.get('/v1/fsbid/bureaus', lookup(lookups.get_bureaus))
  app.get('/v1/references/skills', lookup(lookups.get_codes))
  app.get('/v1/references/Locations', lookup(lookups.get_locations))
  app.get('/v1/agendaItemStatuses', lookup(lookups.get_agenda_item_statuses))

  app.get('/v1/fsbid/posts/attributes', async function(req, res) {
    // TODO - add all post attributes tables by query param
    const data = await postattributes.get_postattributes(req.query)
    res.status(200).send(data)
  })

  app.get('/v1/clients/Agents', async function(req, res) {
    const agents = await employees.get_agents(req.query)

    res.status(200).send({
      Data: agents,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/v1/fsbid/CDOClients', async function(req, res) {
    const clients = await employees.get_clients(req.query)

    res.status(200).send({
      Data: clients,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/v2/clients', async function(req, res) {
    const clients = await employees.get_v2_clients(req.query)

    res.status(200).send({
      Data: clients,
      usl_id: 0,
      return_code: 0
    })
  })

  // Need to update redundant routes once we are done with available bidders
  app.get("/v1/cdo/availablebidders", async function (req, res) {
    if (!req.headers.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    }
    res.status(200).send(await availableBidders.get_available_bidders());
  });

  app.get("/v1/clients/availablebidders/cdo", async function (req, res) {
    if (!req.headers.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    }
    if (req && req.query) {
      if (!req.query.is_asc) {
        console.error('is_asc query param is required.')
        res.status(500).send({ "Message": "An error has occurred." });
      }
    }
    const bidders = await availableBidders.get_available_bidders(false);
    res.status(200).send({
      Data: bidders,
      usl_id: 0,
      return_code: 0
    })
  });
  
  app.get("/v1/clients/availablebidders/bureau", async function (req, res) {
    if (!req.headers.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    }
    if (req && req.query) {
      if (!req.query.is_asc) {
        console.error('is_asc query param is required.')
        res.status(500).send({ "Message": "An error has occurred." });
      }
    }
    const bidders = await availableBidders.get_available_bidders(true);
    res.status(200).send({
      Data: bidders,
      usl_id: 0,
      return_code: 0
    })
  });

  app.get('/v1/Persons', async function(req,res) {
    const persons = await employees.get_persons(req.query)

    res.status(200).send({
      Data: persons,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/v3/Persons', async function(req,res) {
    const persons = await employees.get_v3_persons(req.query)

    res.status(200).send({
      Data: persons,
      UslId: 0,
      ReturnCode: 0
    })
  })

  app.get('/v3/Persons/agendaItems', async function(req,res) {
    const persons = await employees.get_v3_persons_agenda_items(req.query)

    res.status(200).send({
      Data: persons,
      UslId: 0,
      ReturnCode: 0
    })
  })

  app.get('/v1/cyclePositions', async function(req, res) {
    try {
      res.status(200).send(await availablePositions.get_available_positions(req.query, true))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  })

  app.get('/v1/Positions', async function(req, res) {
    try {
      res.status(200).send(await positions.get_position_by_id(req.query))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  })

  app.post('/v2/cyclePositions', async function(req, res) {
    try {
      const body$ = common.convertPostBodyToGetQuery(req.body)
      res.status(200).send(await availablePositions.get_available_positions(body$, true))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  });

  app.get('/v2/SECREF/user', async function(req, res) {
    const user = await employees.get_user(req.query)
    try {
      res.status(200).send({
      Data: user,
      usl_id: 0,
      return_code: 0
    })
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  })

  app.get('/v1/fsbid/bidderTrackingPrograms', async function(req, res) {
    const classifications = await employees.get_classifications(req.query)
    res.status(200).send({
      Data: classifications,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/v1/TrackingPrograms', async function(req, res) {
    const classifications = await employees.get_classifications(req.query)
    res.status(200).send({
      Data: classifications,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/v1/TrackingPrograms/Bidders', async function(req, res) {
    const classifications = await employees.get_classifications(req.query)
    res.status(200).send({
      Data: classifications,
      usl_id: 0,
      return_code: 0
    })
  })

  app.post('/v1/TrackingPrograms/Bidders', async function(req, res) {
    try {
      classifications = await employees.add_classification(req.query)
      res.status(200).send({
        Data: classifications,
        usl_id: 0,
        return_code: 0
      })
    } catch (err) {
      console.error('Error occurred adding classification')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });

  app.delete('/v1/TrackingPrograms/Bidders', async function(req, res) {
    try {
      classifications = await employees.remove_classification(req.query)
      res.status(200).send({
        Data: classifications,
        usl_id: 0,
        return_code: 0
      })
    } catch (err) {
      console.error('Error occurred removing classification')
      console.error(`${err}`)
      res.status(200).send({ Data: null, return_code: -1 })
    }
  });




    const status = [
      'Withdrawn',
      'Disapproved',
      'Approved',
      'Deferred',
      'Deferred - Proposed Position',
      'Ready',
      'Held',
      'Not Ready',
      'Out of Order',
      'PIP',
      'Move to ML/ID',
    ]
    const ai = {
      "aiseqnum": 1,
      "aicorrectiontext": null,
      "aicombinedremarktext": "Remarks:Critical Need Position;High Differential Post;Reassignment at post;SND Post;Continues SND eligibility;Creator(s):Townpost, Jenny Nmn;Modifier(s):WoodwardWA;CDO: Rehman, Tarek S; ;",
      "aicombinedtodothertext": "2Y/HL/2Y",
      "aitodcode": "X",
      "aitoddesctext": "OTHER",
      "aiasgseqnum": 274115,
      "aiasgdrevisionnum": 4,
      "aiperdetseqnum": 408869,
      "aipmiseqnum": 227054,
      "aiitemcreatorid": 3857,
      "aiupdateid": 57497,
      "aisdesctext": "Ready",

      "Panel": [{
        "pmddttm": "2021-11-04T13:55:00",
      }],

      // Needed
      "update_date": "2020-09-09T00:00:00-04:00",

      // Need actual names like below:
      // "aiupdateid": 'Woodward, Wendy',
      // "aiitemcreatorid": 'Woodward, Wendy',

      "agendaAssignment": [{
        "asgposseqnum": 84903,
        "asgdasgseqnum": 274115,
        "asgdrevisionnum": 4,
        "asgdasgscode": "EF",
        "asgdetadate": "2019-05-01T00:00:00",
        "asgdetdteddate": "2023-05-01T00:00:00",
        "asgdtoddesctext": "2 YRS/HLRT/2 YRS",
        "position": [{
          "posseqnum": 84903,
          "posorgshortdesc": "MATAMOROS",
          "posnumtext": "30741960",
          "posgradecode": "03",
          "postitledesc": "DIGITAL MEDIA ADMINISTRATOR",
          "rnum": 1,
        }],
      }],

      "remarks": [
        {
          "airaiseqnum": 157,
          "airrmrkseqnum": 1,
          "airremarktext": "EL directed;via functional & language training"
        }
      ],

      "agendaLegs": [
        {
          "ailaiseqnum": 1,
          "aillatcode": "S",
          "postitledesc": "SPECIAL AGENT",
          "posseqnum": "84903",
          "posorgshortdesc": "PARIS",
          "ailetadate": "2018-01-01T00:00:00",
          "ailetdtedsepdate": "2020-01-01T00:00:00",
          "ailtodothertext": "2YRR",
          "posgradecode": "02",
          "latabbrdesctext": "Reassign",
          "ailtfcd": "8150",
          "position": {
            "posseqnum": 84903,
            "posorgshortdesc": "MATAMOROS",
            "posnumtext": "S70000011",
            "posgradecode": "03",
            "postitledesc": "DIGITAL MEDIA ADMINISTRATOR",
            "rnum": 1,
          },
          "agendaLegAssignment": [
            {
              "asgposseqnum": 24026,
              "asgdasgseqnum": 131740,
              "asgdrevisionnum": 1,
              "asgdasgscode": "EF",
              "asgdetadate": "2002-11-01T00:00:00",
              "asgdetdteddate": "2004-11-01T00:00:00",
              "asgdtoddesctext": "2 YRS/TRANSFER",
              "position": [
                {
                  "posseqnum": 24026,
                  "posorgshortdesc": "DS/CR/CFI",
                  "posnumtext": "S7323821",
                  "posgradecode": "03",
                  "postitledesc": "SUPERVISORY FIRE PROTECTION EN"
                }
              ]
            }
          ],
          "agendaLegPosition": [
            {
              "posseqnum": 24026,
              "posorgshortdesc": "DS/CR/CFI",
              "posnumtext": "S7323821",
              "posgradecode": "03",
              "postitledesc": "SUPERVISORY FIRE PROTECTION EN"
            }
          ]
        },
        {
          "ailaiseqnum": 2,
          "aillatcode": "S",
          "postitledesc": "TRAINING",
          "posseqnum": "84903",
          "posorgshortdesc": "Washington, D.C.",
          "ailetadate": "2020-01-01T00:00:00",
          "ailetdtedsepdate": "2020-07-01T00:00:00",
          "ailtodothertext": "6 MO",
          "posgradecode": "02",
          "latabbrdesctext": "Reassign",
          "ailtfcd": "8150", // will eventually be something like "Post to USHL",
          "position": {
            "posseqnum": 84903,
            "posorgshortdesc": "MATAMOROS",
            "posnumtext": "S70000011",
            "posgradecode": "03",
            "postitledesc": "DIGITAL MEDIA ADMINISTRATOR",
            "rnum": 1,
          },
          "agendaLegAssignment": [
            {
              "asgposseqnum": 24026,
              "asgdasgseqnum": 131740,
              "asgdrevisionnum": 1,
              "asgdasgscode": "EF",
              "asgdetadate": "2002-11-01T00:00:00",
              "asgdetdteddate": "2004-11-01T00:00:00",
              "asgdtoddesctext": "2 YRS/TRANSFER",
              "position": [
                {
                  "posseqnum": 24026,
                  "posorgshortdesc": "DS/CR/CFI",
                  "posnumtext": "S7323821",
                  "posgradecode": "03",
                  "postitledesc": "SUPERVISORY FIRE PROTECTION EN"
                }
              ]
            }
          ],
          "agendaLegPosition": [
            {
              "posseqnum": 24026,
              "posorgshortdesc": "DS/CR/CFI",
              "posnumtext": "S7323821",
              "posgradecode": "03",
              "postitledesc": "SUPERVISORY FIRE PROTECTION EN"
            }
          ]
        },
        {
          "ailaiseqnum": 3,
          "aillatcode": "S",
          "postitledesc": "SPECIAL AGENT",
          "posseqnum": "84903",
          "posorgshortdesc": "BELGRADE",
          "ailetadate": "2020-07-01T00:00:00",
          "ailetdtedsepdate": "2022-07-01T00:00:00",
          "ailtodothertext": "2YRR",
          "posgradecode": "02",
          "latabbrdesctext": "Reassign",
          "ailtfcd": null,
          "position": {
            "posseqnum": 84903,
            "posorgshortdesc": "MATAMOROS",
            "posnumtext": "S70000011",
            "posgradecode": "03",
            "postitledesc": "DIGITAL MEDIA ADMINISTRATOR",
            "rnum": 1,
          },
          "agendaLegAssignment": [
            {
              "asgposseqnum": 24026,
              "asgdasgseqnum": 131740,
              "asgdrevisionnum": 1,
              "asgdasgscode": "EF",
              "asgdetadate": "2002-11-01T00:00:00",
              "asgdetdteddate": "2004-11-01T00:00:00",
              "asgdtoddesctext": "2 YRS/TRANSFER",
              "position": [
                {
                  "posseqnum": 24026,
                  "posorgshortdesc": "DS/CR/CFI",
                  "posnumtext": "S7323821",
                  "posgradecode": "03",
                  "postitledesc": "SUPERVISORY FIRE PROTECTION EN"
                }
              ]
            }
          ],
          "agendaLegPosition": [
            {
              "posseqnum": 24026,
              "posorgshortdesc": "DS/CR/CFI",
              "posnumtext": "S7323821",
              "posgradecode": "03",
              "postitledesc": "SUPERVISORY FIRE PROTECTION EN"
            }
          ]
        }
      ]
    };
    const ais = (new Array(50).fill(1)).map((m, i) => ({
      ...ai,
      agendaLegs: ai.agendaLegs.slice(0, _.sample([2.3,4])),
      aiseqnum: i + 1,
      aisdesctext: _.sample(status),
      aiperdetseqnum: i % 2 === 0 ? 4 : 6, // perdets of Jenny, Tarek
    }))

  app.get('/v1/agendaItems/:id', async function(req, res, next) {
    if (!req.params.id) {
      next();
    }
    const ai$ = ais.filter(f => `${f.aiseqnum}` === req.params.id)
    res.status(200).send({
      Data: ai$,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/v1/agendaItems', async function(req, res) { // singleton
    const { query } = req; // aiseqnum|eq|226661|
    const filter = _.get(query, "['rp.filter']", '').split('|')
    const column = filter[0];
    const value= filter[2]
    let ais$ = ais;
    if (column && value) {
      ais$ = ais$.filter(f => `${f[column]}` === value);
    }
    ais$ = ais$.map(m => ({ aiseqnum: m.aiseqnum })) // only return aiseqnum
    res.status(200).send({
      Data: ais$,
      usl_id: 0,
      return_code: 0
    })
  })
};

module.exports = appRouter;
