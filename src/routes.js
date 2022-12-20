const { PRIVATE_KEY } = require('./constants')
const bidding = require('./services/bids')
const futureVacancies = require('./services/futurevacancies')
const availablePositions = require('./services/availablepositions')
const availableBidders = require('./services/availablebidders')
const employees = require('./services/employees')
const agendas = require('./services/agendas')
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
      isCDO = common.isCDO(req);
    }
    res.status(200).send(await bidding.get_bids(req.query, isCDO));
  });

  app.get("/v2/bids", async function (req, res) {
    try {

      const filsCols = common.convertTemplateFiltersCols(req.query, x => x.map(common.bidNameMapping))
      const bidData = await bidding.v2_get_bids(filsCols, req.query)

      res.status(200).send({
        Data: bidData,
        usl_id: 0,
        return_code: 0
      })
    } catch {
      console.error('An error has occurred.')
    }
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
    if (common.isCDO(req)) { isCDO = true; }
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

  app.get('/v2/assignments', async function(req, res) {
    try {
      const filsCols = common.convertTemplateFiltersCols(req.query, x => x.map(common.asgNameMapping).map(common.asgdNameMapping))
      const asg_pos = await employees.v2_get_assignments(filsCols, req.query)

      res.status(200).send({
        Data: asg_pos,
        usl_id: 0,
        return_code: 0
      })
    } catch {
      console.error('An error has occurred.')
    }
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
  app.get('/v1/references/travel-functions', lookup(lookups.get_travel_functions))
  app.get('/v1/agendas/references/statuses', lookup(lookups.get_agenda_item_statuses))
  app.get('/v1/agendas/references/remark-categories', lookup(lookups.get_remark_categories))
  app.get('/v1/agendas/references/remarks', lookup(lookups.get_remarks))
  app.get('/v1/agendas/references/leg-action-types', lookup(lookups.get_leg_action_types))
  app.get('/v1/panels/references/categories', lookup(lookups.get_panel_categories))
  app.get('/v1/positions/classifications', lookup(lookups.get_frequent_positions))
  app.get('/v1/posts/attributes', async function(req, res) {
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

  app.get("/v1/clients/availablebidders/cdo", async function (req, res) {
    if (!req.headers.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    }
    if (req && req.query) {
      if (!req.query.is_asc) {
        console.error('is_asc query param is required.')
        res.status(500).send({ "Message": "An error has occurred." });
      }
      if (!_.includes(['NAME', 'STATUS', 'SKILL', 'GRADE', 'TED', 'POST', 'CDO', 'UPDATE'], req.query.order_by.toUpperCase())) {
        console.error('order_by query value does not exist.')
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

  app.get('/v1/tm-persons', async function(req, res) {
    let persons;
    // const persons = await employees.get_v3_persons_agenda_items(req.query)
    if (_.get(req.query, '["rp.columns"]', "").indexOf('ROWCOUNT') > -1) {
      persons = [{ rowcount: 1337 }]
    } else {
      /* persons = Array.from(Array(25).keys()).map((p, i) => (
        {
          "tmperaicreateid": 383 + i,
          "tmperaiscode": "A",
          "tmpercdoid": null,
          "tmpercurrentbureaucode": "310000" + i,
          "tmpercurrentbureaudesc": "GTM",
          "tmpercurrentlocationcode": "100000001" + i,
          "tmpercurrentorgcode": "300000" + i,
          "tmpercurrentorgdesc": "GTM/NGO",
          "tmpercurrentted": "2022-08-24T00:00:00",
          "tmperhsbureaucode": null,
          "tmperhsbureaudesc": null,
          "tmperhsind": null,
          "tmperhslocationcode": null,
          "tmperhsorgcode": null,
          "tmperhsorgdesc": "RIGA",
          "tmperpanelmeeting": 2357 + i,
          "tmperpanelmeetingdate": "2020-09-24T13:55:00",
          "tmperperdetseqnum": 389894 + i,
          "tmperperfullname": "O'PALICK-MONOIK,HELIMA-KITRA NMN",
          "tmperperscode": "A",
          "tmperpertexternalid": "107168" + i,
          "tmperseparationdate": null,
          "rnum": i
        }
      )); */
      persons = await employees.get_v3_persons_agenda_items({ "request_params.page_size": 25, "request_params.page_index": 1 })
    }

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

  app.get('/v1/agendas', async function(req, res) { // singleton
    try {
      const { query } = req; // aiseqnum|eq|226661|
      const filter = _.get(query, "['rp.filter']", '').split('|')
      const column = filter[0];
      const value= filter[2]
      const per = column === "aiperdetseqnum" ? value : null;
      let ais = await agendas.getAgendaItems(null, per)
      if (column && value) {
        ais = ais.filter(f => `${f[column]}` === value);
      }
      res.status(200).send({
        Data: ais,
        usl_id: 0,
        return_code: 0
      })

    } catch {
      console.error('Error grabbing Agenda Items')
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.get('/v1/tm-persons/reference/current-organizations', async function(req, res) {
    try {
      const Data = await employees.get_agenda_organizations({ isCurrent: true });
      console.log(Data)
      res.status(200).send({
        Data,
        usl_id: 0,
        return_code: 0
      })

    } catch {
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.get('/v1/tm-persons/reference/handshake-organizations', async function(req, res) {
    try {
      const Data = await employees.get_agenda_organizations({ isCurrent: false });
      console.log(Data)
      res.status(200).send({
        Data,
        usl_id: 0,
        return_code: 0
      })

    } catch {
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.get('/v1/tm-persons/reference/current-bureaus', async function(req, res) {
    try {
      const Data = await employees.get_agenda_bureaus({ isCurrent: true });
      console.log(Data)
      res.status(200).send({
        Data,
        usl_id: 0,
        return_code: 0
      })

    } catch {
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.get('/v1/tm-persons/reference/handshake-bureaus', async function(req, res) {
    try {
      const Data = await employees.get_agenda_bureaus({ isCurrent: false });
      console.log(Data)
      res.status(200).send({
        Data,
        usl_id: 0,
        return_code: 0
      })

    } catch {
      res.status(200).send({ Data: null, return_code: -1 })
    }
  })

  app.get('/v1/panels/references/dates', async function(req, res) {
    try {
    const filsCols = common.convertTemplateFiltersCols(req.query, x => x.map(common.panelNameMapping))
    let pmdt = await agendas.getPanelDates(filsCols, req.query)

    res.status(200).send({
      Data: pmdt,
      usl_id: 0,
      return_code: 0
    })
    } catch {
      console.error('An error has occurred')
    }
  })

  app.get('/v2/separations', async function(req, res) {
    try {
      const filsCols = common.convertTemplateFiltersCols(req.query, x => x.map(common.sepNameMapping))
      const sep = await employees.get_separations(filsCols, req.query)

      res.status(200).send({
        Data: sep,
        usl_id: 0,
        return_code: 0
      })
    } catch {
      console.error('An error has occurred.')
    }
  })

  app.get('/v2/positions', async function(req, res) {
    try {
      res.status(200).send(await positions.get_position_by_pos_num(req.query))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  })
  
  app.get('/v1/panels/:id/agendas', async function(req, res) {
    // console.log(req);
    const fake = [
      {
        "aiseqnum": 199034,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:EL Directed;2nd Tour;Creator(s):Campbell, Angela M;Modifier(s):CampbellAM;CDO: Kula, Toni L; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 268177,
        "aiasgdrevisionnum": 3,
        "aiperdetseqnum": 503968,
        "aipmiseqnum": 199427,
        "aiitemcreatorid": 27392,
        "aiupdateid": 27392,
        "aisdesctext": "Not Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 199427,
            "pmimiccode": "R",
            "pmiupdateid": 20438,
            "pmiupdatedate": "2022-07-08T14:01:24",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Review"
          }
        ],
        "person": [
          {
            "perpiifirstname": "MENYU-DELYEE",
            "perpiilastname": "LICAH-MARENOECEE",
            "perpiiseqnum": 572806,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 503968,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 22182,
            "asgdasgseqnum": 268177,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2018-01-09T00:00:00",
            "asgdetdteddate": "2020-01-09T00:00:00",
            "asgdtoddesctext": "2 YRS/TRANSFER",
            "position": [
              {
                "posseqnum": 22182,
                "posorgshortdesc": "EX/MR/IDSD",
                "posnumtext": "S5471401",
                "posgradecode": "06",
                "postitledesc": "SOCIAL MARKETING ASST",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "asgposseqnum": 22182,
            "asgdasgseqnum": 268177,
            "asgdrevisionnum": 3,
            "asgdasgscode": "EF",
            "asgdetadate": "2018-01-01T00:00:00",
            "asgdetdteddate": "2020-05-01T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 22182,
                "posorgshortdesc": "EX/MR/IDSD",
                "posnumtext": "S5471401",
                "posgradecode": "06",
                "postitledesc": "SOCIAL MARKETING ASST",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 199034,
            "airrmrkseqnum": 47,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 47,
                "rmrkrccode": "B",
                "rmrkordernum": 1,
                "rmrkshortdesctext": "EL Direct",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "EL Directed",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 199034,
            "airrmrkseqnum": 82,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 82,
                "rmrkrccode": "B",
                "rmrkordernum": 2,
                "rmrkshortdesctext": "2nd Tour",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "2nd Tour",
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [
          {
            "hruempseqnbr": 152211,
            "hruneuid": null,
            "hruid": 27392,
            "neuid": null,
            "neulastnm": null,
            "neufirstnm": null,
            "neumiddlenm": null,
            "empUser": [
              {
                "perpiifirstname": "SOLLINEE",
                "perpiilastname": "OUNDJIANEE",
                "perpiiseqnum": 152211,
                "perpiimiddlename": "NMN",
                "perpiisuffixname": " ",
                "perdetseqnum": 425249,
                "persdesc": "Active"
              }
            ]
          }
        ],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 199034,
            "aillatcode": "R",
            "ailtfcd": null,
            "ailcpid": null,
            "ailperdetseqnum": 503968,
            "ailseqnum": 300173,
            "ailposseqnum": 22182,
            "ailtodcode": "X",
            "ailtodmonthsnum": 31,
            "ailtodothertext": "31M",
            "ailetadate": "2018-01-01T00:00:00",
            "ailetdtedsepdate": "2020-08-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 268177,
            "ailasgdrevisionnum": 3,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 27392,
            "ailupdatedate": "2019-10-02T10:04:54",
            "latabbrdesctext": "Extend",
            "latdesctext": "Extend",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 22182,
                "asgdasgseqnum": 268177,
                "asgdrevisionnum": 3,
                "asgdasgscode": "EF",
                "asgdetadate": "2018-01-01T00:00:00",
                "asgdetdteddate": "2020-05-01T00:00:00",
                "asgdtoddesctext": "OTHER",
                "position": [
                  {
                    "posseqnum": 22182,
                    "posorgshortdesc": "EX/MR/IDSD",
                    "posnumtext": "S5471401",
                    "posgradecode": "06",
                    "postitledesc": "SOCIAL MARKETING ASST",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 22182,
                "posorgshortdesc": "EX/MR/IDSD",
                "posnumtext": "S5471401",
                "posgradecode": "06",
                "postitledesc": "SOCIAL MARKETING ASST",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ]
      },
      {
        "aiseqnum": 206573,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:EL Directed;CA AEFM;Travel on Sponsor's Orders;Creator(s):Holtz, Andrew Blayne;Modifier(s):HoltzAB;CDO: Breding, Christopher I; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 276061,
        "aiasgdrevisionnum": 2,
        "aiperdetseqnum": 414414,
        "aipmiseqnum": 206966,
        "aiitemcreatorid": 42807,
        "aiupdateid": 42807,
        "aisdesctext": "Not Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 206966,
            "pmimiccode": "R",
            "pmiupdateid": 20438,
            "pmiupdatedate": "2022-07-08T14:01:24",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Review"
          }
        ],
        "person": [
          {
            "perpiifirstname": "DAENEEE",
            "perpiilastname": "RICKSEE",
            "perpiiseqnum": 84700,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 414414,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 146770,
            "asgdasgseqnum": 276061,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2018-04-05T00:00:00",
            "asgdetdteddate": "2020-09-05T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 146770,
                "posorgshortdesc": "NEW DELHI",
                "posnumtext": "30017024",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "asgposseqnum": 146770,
            "asgdasgseqnum": 276061,
            "asgdrevisionnum": 3,
            "asgdasgscode": "EF",
            "asgdetadate": "2018-04-01T00:00:00",
            "asgdetdteddate": "2020-06-01T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 146770,
                "posorgshortdesc": "NEW DELHI",
                "posnumtext": "30017024",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 206573,
            "airrmrkseqnum": 47,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 47,
                "rmrkrccode": "B",
                "rmrkordernum": 1,
                "rmrkshortdesctext": "EL Direct",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "EL Directed",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 206573,
            "airrmrkseqnum": 222,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 222,
                "rmrkrccode": "P",
                "rmrkordernum": 5,
                "rmrkshortdesctext": "CA AEFM",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "CA AEFM",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 206573,
            "airrmrkseqnum": 230,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 230,
                "rmrkrccode": "M",
                "rmrkordernum": 99,
                "rmrkshortdesctext": "Other",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": null,
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 206573,
            "aillatcode": "S",
            "ailtfcd": null,
            "ailcpid": null,
            "ailperdetseqnum": 414414,
            "ailseqnum": 311110,
            "ailposseqnum": 146770,
            "ailtodcode": "X",
            "ailtodmonthsnum": 25,
            "ailtodothertext": "25M",
            "ailetadate": "2018-04-01T00:00:00",
            "ailetdtedsepdate": "2020-05-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 276061,
            "ailasgdrevisionnum": 2,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 42807,
            "ailupdatedate": "2020-03-17T11:30:37",
            "latabbrdesctext": "Curtail",
            "latdesctext": "Curtail",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 146770,
                "asgdasgseqnum": 276061,
                "asgdrevisionnum": 2,
                "asgdasgscode": "EF",
                "asgdetadate": "2018-04-05T00:00:00",
                "asgdetdteddate": "2020-09-05T00:00:00",
                "asgdtoddesctext": "OTHER",
                "position": [
                  {
                    "posseqnum": 146770,
                    "posorgshortdesc": "NEW DELHI",
                    "posnumtext": "30017024",
                    "posgradecode": "04",
                    "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 146770,
                "posorgshortdesc": "NEW DELHI",
                "posnumtext": "30017024",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ]
      },
      {
        "aiseqnum": 219059,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:EL Directed;205th A-100 Class;Creator(s):Show, Jason M;Modifier(s):ShowJM;CDO: Powers-Heaven, Jessica N; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 302160,
        "aiasgdrevisionnum": 2,
        "aiperdetseqnum": 582752,
        "aipmiseqnum": 219452,
        "aiitemcreatorid": 38798,
        "aiupdateid": 38798,
        "aisdesctext": "Not Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 219452,
            "pmimiccode": "X",
            "pmiupdateid": 20438,
            "pmiupdatedate": "2022-07-08T14:01:24",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Express"
          }
        ],
        "person": [
          {
            "perpiifirstname": "KHRYSTYNAEE",
            "perpiilastname": "KELLOUNEE",
            "perpiiseqnum": 721935,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 582752,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 5235,
            "asgdasgseqnum": 302160,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2021-01-01T00:00:00",
            "asgdetdteddate": null,
            "asgdtoddesctext": "INDEFINITE",
            "position": [
              {
                "posseqnum": 5235,
                "posorgshortdesc": "GTM/JOC",
                "posnumtext": "S0000063",
                "posgradecode": "00",
                "postitledesc": "INTELL SUPP OFF",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "asgposseqnum": 5235,
            "asgdasgseqnum": 302160,
            "asgdrevisionnum": 3,
            "asgdasgscode": "EF",
            "asgdetadate": "2021-01-01T00:00:00",
            "asgdetdteddate": "2022-03-01T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 5235,
                "posorgshortdesc": "GTM/JOC",
                "posnumtext": "S0000063",
                "posgradecode": "00",
                "postitledesc": "INTELL SUPP OFF",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 219059,
            "airrmrkseqnum": 47,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 47,
                "rmrkrccode": "B",
                "rmrkordernum": 1,
                "rmrkshortdesctext": "EL Direct",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "EL Directed",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 219059,
            "airrmrkseqnum": 231,
            "remarkInserts": [
              {
                "airiinsertiontext": "205th",
                "airiaiseqnum": 219059,
                "airirmrkseqnum": 231,
                "aiririseqnum": 89,
                "airicreateid": 38798,
                "airicreatedate": "2021-02-26T12:27:53",
                "airiupdateid": 38798,
                "airiupdatedate": "2021-02-26T12:27:53"
              }
            ],
            "remarkRefData": [
              {
                "rmrkseqnum": 231,
                "rmrkrccode": "B",
                "rmrkordernum": 2,
                "rmrkshortdesctext": "A-100Class",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "{#} A-100 Class",
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [
          {
            "hruempseqnbr": 318808,
            "hruneuid": null,
            "hruid": 38798,
            "neuid": null,
            "neulastnm": null,
            "neufirstnm": null,
            "neumiddlenm": null,
            "empUser": [
              {
                "perpiifirstname": "THII JAYEE",
                "perpiilastname": "BERGADO-MERIKEE",
                "perpiiseqnum": 318808,
                "perpiimiddlename": "NMN",
                "perpiisuffixname": " ",
                "perdetseqnum": 433645,
                "persdesc": "Active"
              }
            ]
          }
        ],
        "updaters": [],
        "agendaLegs": []
      },
      {
        "aiseqnum": 230036,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:Via leave;Training for senior leadership responsibilities at the National War College, NDU, Ft. McNair, Washington, DC;Creator(s):Sultan, Baber Nmn;Modifier(s):PumaEA;CDO: Puma, Emilia A; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 293506,
        "aiasgdrevisionnum": 3,
        "aiperdetseqnum": 415115,
        "aipmiseqnum": 230429,
        "aiitemcreatorid": 3857,
        "aiupdateid": 7454,
        "aisdesctext": "Not Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 230429,
            "pmimiccode": "R",
            "pmiupdateid": 20438,
            "pmiupdatedate": "2022-07-08T14:01:24",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Review"
          }
        ],
        "person": [
          {
            "perpiifirstname": "UJALAEE",
            "perpiilastname": "SUBAR-JICIEE",
            "perpiiseqnum": 76090,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 415115,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 101007,
            "asgdasgseqnum": 293506,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2020-09-24T00:00:00",
            "asgdetdteddate": "2022-09-24T00:00:00",
            "asgdtoddesctext": "2 YRS (1 R & R)",
            "position": [
              {
                "posseqnum": 101007,
                "posorgshortdesc": "MEXICO CITY",
                "posnumtext": "10581007",
                "posgradecode": "02",
                "postitledesc": "DEPUTY WHITE HOUSE LIAISON",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "asgposseqnum": 101007,
            "asgdasgseqnum": 293506,
            "asgdrevisionnum": 3,
            "asgdasgscode": "EF",
            "asgdetadate": "2020-09-01T00:00:00",
            "asgdetdteddate": "2022-07-01T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 101007,
                "posorgshortdesc": "MEXICO CITY",
                "posnumtext": "10581007",
                "posgradecode": "02",
                "postitledesc": "DEPUTY WHITE HOUSE LIAISON",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 230036,
            "airrmrkseqnum": 138,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 138,
                "rmrkrccode": "T",
                "rmrkordernum": 13,
                "rmrkshortdesctext": "Via leave",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "Via leave",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 230036,
            "airrmrkseqnum": 230,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 230,
                "rmrkrccode": "M",
                "rmrkordernum": 99,
                "rmrkshortdesctext": "Other",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": null,
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [
          {
            "hruempseqnbr": 7566,
            "hruneuid": null,
            "hruid": 3857,
            "neuid": null,
            "neulastnm": null,
            "neufirstnm": null,
            "neumiddlenm": null,
            "empUser": [
              {
                "perpiifirstname": "CHINNAMOEE",
                "perpiilastname": "BIGTUS-MASHFIQEEEE",
                "perpiiseqnum": 7566,
                "perpiimiddlename": "NMN",
                "perpiisuffixname": " ",
                "perdetseqnum": 408253,
                "persdesc": "Active"
              }
            ]
          }
        ],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 230036,
            "aillatcode": "G",
            "ailtfcd": "8152",
            "ailcpid": null,
            "ailperdetseqnum": 415115,
            "ailseqnum": 345473,
            "ailposseqnum": 10267,
            "ailtodcode": "X",
            "ailtodmonthsnum": 10,
            "ailtodothertext": "10M",
            "ailetadate": "2022-08-01T00:00:00",
            "ailetdtedsepdate": "2023-06-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 306135,
            "ailasgdrevisionnum": 1,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 7454,
            "ailupdatedate": "2022-01-14T09:58:25",
            "latabbrdesctext": "Chg ETA",
            "latdesctext": "Change ETA",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 10267,
                "asgdasgseqnum": 306135,
                "asgdrevisionnum": 1,
                "asgdasgscode": "AP",
                "asgdetadate": "2022-08-01T00:00:00",
                "asgdetdteddate": "2023-06-01T00:00:00",
                "asgdtoddesctext": "OTHER",
                "position": [
                  {
                    "posseqnum": 10267,
                    "posorgshortdesc": "FSI/NDU",
                    "posnumtext": "S0000816",
                    "posgradecode": "01",
                    "postitledesc": "INTELL SUPP OFF",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 10267,
                "posorgshortdesc": "FSI/NDU",
                "posnumtext": "S0000816",
                "posgradecode": "01",
                "postitledesc": "INTELL SUPP OFF",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "ailaiseqnum": 230036,
            "aillatcode": "V",
            "ailtfcd": null,
            "ailcpid": null,
            "ailperdetseqnum": 415115,
            "ailseqnum": 345471,
            "ailposseqnum": 101007,
            "ailtodcode": "X",
            "ailtodmonthsnum": 20,
            "ailtodothertext": "20M",
            "ailetadate": "2020-09-01T00:00:00",
            "ailetdtedsepdate": "2022-05-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 293506,
            "ailasgdrevisionnum": 3,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 3857,
            "ailupdatedate": "2022-01-11T10:47:29",
            "latabbrdesctext": "Adjust",
            "latdesctext": "Adjustment",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 101007,
                "asgdasgseqnum": 293506,
                "asgdrevisionnum": 1,
                "asgdasgscode": "AP",
                "asgdetadate": "2020-08-01T00:00:00",
                "asgdetdteddate": "2022-08-01T00:00:00",
                "asgdtoddesctext": "2 YRS (1 R & R)",
                "position": [
                  {
                    "posseqnum": 101007,
                    "posorgshortdesc": "MEXICO CITY",
                    "posnumtext": "10581007",
                    "posgradecode": "02",
                    "postitledesc": "DEPUTY WHITE HOUSE LIAISON",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              },
              {
                "asgposseqnum": 101007,
                "asgdasgseqnum": 293506,
                "asgdrevisionnum": 3,
                "asgdasgscode": "EF",
                "asgdetadate": "2020-09-01T00:00:00",
                "asgdetdteddate": "2022-07-01T00:00:00",
                "asgdtoddesctext": "OTHER",
                "position": [
                  {
                    "posseqnum": 101007,
                    "posorgshortdesc": "MEXICO CITY",
                    "posnumtext": "10581007",
                    "posgradecode": "02",
                    "postitledesc": "DEPUTY WHITE HOUSE LIAISON",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 101007,
                "posorgshortdesc": "MEXICO CITY",
                "posnumtext": "10581007",
                "posgradecode": "02",
                "postitledesc": "DEPUTY WHITE HOUSE LIAISON",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ]
      },
      {
        "aiseqnum": 234296,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:EL Directed;CA LNA;DG Approved NTE extension; 4/7/2022;Creator(s):Show, Jason M;Modifier(s):ShowJM;CDO: Eisele, Erik V E; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 292436,
        "aiasgdrevisionnum": 6,
        "aiperdetseqnum": 546285,
        "aipmiseqnum": 234689,
        "aiitemcreatorid": 38798,
        "aiupdateid": 38798,
        "aisdesctext": "Not Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 234689,
            "pmimiccode": "R",
            "pmiupdateid": 20438,
            "pmiupdatedate": "2022-07-08T14:01:24",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Review"
          }
        ],
        "person": [
          {
            "perpiifirstname": "LICONDA-JEUEE",
            "perpiilastname": "KNELLER-TORBYEE",
            "perpiiseqnum": 622031,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 546285,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 46178,
            "asgdasgseqnum": 292436,
            "asgdrevisionnum": 2,
            "asgdasgscode": "AP",
            "asgdetadate": "2020-10-01T00:00:00",
            "asgdetdteddate": "2023-01-01T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 46178,
                "posorgshortdesc": "SHANGHAI",
                "posnumtext": "30041167",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "asgposseqnum": 46178,
            "asgdasgseqnum": 292436,
            "asgdrevisionnum": 3,
            "asgdasgscode": "EF",
            "asgdetadate": "2020-11-12T00:00:00",
            "asgdetdteddate": "2023-02-12T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 46178,
                "posorgshortdesc": "SHANGHAI",
                "posnumtext": "30041167",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "asgposseqnum": 46178,
            "asgdasgseqnum": 292436,
            "asgdrevisionnum": 6,
            "asgdasgscode": "EF",
            "asgdetadate": "2020-11-01T00:00:00",
            "asgdetdteddate": "2023-02-01T00:00:00",
            "asgdtoddesctext": "OTHER",
            "position": [
              {
                "posseqnum": 46178,
                "posorgshortdesc": "SHANGHAI",
                "posnumtext": "30041167",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 234296,
            "airrmrkseqnum": 47,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 47,
                "rmrkrccode": "B",
                "rmrkordernum": 1,
                "rmrkshortdesctext": "EL Direct",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "EL Directed",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 234296,
            "airrmrkseqnum": 186,
            "remarkInserts": [
              {
                "airiinsertiontext": "NTE extension; 4/7/2022",
                "airiaiseqnum": 234296,
                "airirmrkseqnum": 186,
                "aiririseqnum": 64,
                "airicreateid": 11662,
                "airicreatedate": "2022-05-03T14:13:01",
                "airiupdateid": 11662,
                "airiupdatedate": "2022-05-03T14:13:01"
              }
            ],
            "remarkRefData": [
              {
                "rmrkseqnum": 186,
                "rmrkrccode": "M",
                "rmrkordernum": 5,
                "rmrkshortdesctext": "DG Approved",
                "rmrkmutuallyexclusiveind": "Y",
                "rmrktext": "DG Approved {action} {date}",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 234296,
            "airrmrkseqnum": 195,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 195,
                "rmrkrccode": "P",
                "rmrkordernum": 5,
                "rmrkshortdesctext": "CA LNA",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "CA LNA",
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [
          {
            "hruempseqnbr": 318808,
            "hruneuid": null,
            "hruid": 38798,
            "neuid": null,
            "neulastnm": null,
            "neufirstnm": null,
            "neumiddlenm": null,
            "empUser": [
              {
                "perpiifirstname": "THII JAYEE",
                "perpiilastname": "BERGADO-MERIKEE",
                "perpiiseqnum": 318808,
                "perpiimiddlename": "NMN",
                "perpiisuffixname": " ",
                "perdetseqnum": 433645,
                "persdesc": "Active"
              }
            ]
          }
        ],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 234296,
            "aillatcode": "R",
            "ailtfcd": null,
            "ailcpid": null,
            "ailperdetseqnum": 546285,
            "ailseqnum": 351804,
            "ailposseqnum": 46178,
            "ailtodcode": "X",
            "ailtodmonthsnum": 39,
            "ailtodothertext": "39M2RR",
            "ailetadate": "2020-11-01T00:00:00",
            "ailetdtedsepdate": "2024-02-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 292436,
            "ailasgdrevisionnum": 6,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 11662,
            "ailupdatedate": "2022-05-03T14:13:01",
            "latabbrdesctext": "Extend",
            "latdesctext": "Extend",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 46178,
                "asgdasgseqnum": 292436,
                "asgdrevisionnum": 6,
                "asgdasgscode": "EF",
                "asgdetadate": "2020-11-01T00:00:00",
                "asgdetdteddate": "2023-02-01T00:00:00",
                "asgdtoddesctext": "OTHER",
                "position": [
                  {
                    "posseqnum": 46178,
                    "posorgshortdesc": "SHANGHAI",
                    "posnumtext": "30041167",
                    "posgradecode": "04",
                    "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 46178,
                "posorgshortdesc": "SHANGHAI",
                "posnumtext": "30041167",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ]
      },
      {
        "aiseqnum": 236066,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:EL Directed;Creator(s):Binion, Amber F;Modifier(s):ShowJM;CDO: Reyes, Christopher T; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 308724,
        "aiasgdrevisionnum": 2,
        "aiperdetseqnum": 596477,
        "aipmiseqnum": 236459,
        "aiitemcreatorid": 60648,
        "aiupdateid": 38798,
        "aisdesctext": "Not Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 236459,
            "pmimiccode": "R",
            "pmiupdateid": 20438,
            "pmiupdatedate": "2022-07-08T14:01:24",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Review"
          }
        ],
        "person": [
          {
            "perpiifirstname": "GAROLDEE",
            "perpiilastname": "CHEUNGICEE",
            "perpiiseqnum": 162456,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 596477,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 5239,
            "asgdasgseqnum": 308724,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2022-01-18T00:00:00",
            "asgdetdteddate": null,
            "asgdtoddesctext": "INDEFINITE",
            "position": [
              {
                "posseqnum": 5239,
                "posorgshortdesc": "GTM/JOC",
                "posnumtext": "S0000067",
                "posgradecode": "00",
                "postitledesc": "INTELL SUPP OFF",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 236066,
            "airrmrkseqnum": 47,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 47,
                "rmrkrccode": "B",
                "rmrkordernum": 1,
                "rmrkshortdesctext": "EL Direct",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "EL Directed",
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [
          {
            "hruempseqnbr": 572806,
            "hruneuid": null,
            "hruid": 60648,
            "neuid": null,
            "neulastnm": null,
            "neufirstnm": null,
            "neumiddlenm": null,
            "empUser": [
              {
                "perpiifirstname": "MENYU-DELYEE",
                "perpiilastname": "LICAH-MARENOECEE",
                "perpiiseqnum": 572806,
                "perpiimiddlename": "NMN",
                "perpiisuffixname": " ",
                "perdetseqnum": 503968,
                "persdesc": "Active"
              }
            ]
          }
        ],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 236066,
            "aillatcode": "T",
            "ailtfcd": null,
            "ailcpid": null,
            "ailperdetseqnum": 596477,
            "ailseqnum": 354424,
            "ailposseqnum": 93386,
            "ailtodcode": "E",
            "ailtodmonthsnum": null,
            "ailtodothertext": null,
            "ailetadate": "2022-10-01T00:00:00",
            "ailetdtedsepdate": "2024-10-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 310866,
            "ailasgdrevisionnum": 1,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 20438,
            "ailupdatedate": "2022-07-05T14:06:45",
            "latabbrdesctext": "Break",
            "latdesctext": "Break",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 93386,
                "asgdasgseqnum": 310866,
                "asgdrevisionnum": 1,
                "asgdasgscode": "AP",
                "asgdetadate": "2022-10-01T00:00:00",
                "asgdetdteddate": "2024-10-01T00:00:00",
                "asgdtoddesctext": "2 YRS/TRANSFER",
                "position": [
                  {
                    "posseqnum": 93386,
                    "posorgshortdesc": "TIJUANA",
                    "posnumtext": "30007896",
                    "posgradecode": "04",
                    "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 93386,
                "posorgshortdesc": "TIJUANA",
                "posnumtext": "30007896",
                "posgradecode": "04",
                "postitledesc": "OH SR. CARE & TREATMENT SPEC (",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ]
      },
      {
        "aiseqnum": 234491,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:Extension in Stretch;Senior Cede Granted on 04/14/2021;Timely;Creator(s):Rodriguez, Karen Miller;Modifier(s):RodriguezKM;CDO: Lloyd, Thomas H; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 303423,
        "aiasgdrevisionnum": 2,
        "aiperdetseqnum": 418675,
        "aipmiseqnum": 234884,
        "aiitemcreatorid": 4554,
        "aiupdateid": 4554,
        "aisdesctext": "Not Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 234884,
            "pmimiccode": "R",
            "pmiupdateid": 20438,
            "pmiupdatedate": "2022-07-08T14:01:24",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Review"
          }
        ],
        "person": [
          {
            "perpiifirstname": "ADEDOYINEE",
            "perpiilastname": "CARDWELLEE",
            "perpiiseqnum": 75667,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 418675,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 137940,
            "asgdasgseqnum": 303423,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2021-08-02T00:00:00",
            "asgdetdteddate": "2023-08-02T00:00:00",
            "asgdtoddesctext": "2 YRS/TRANSFER",
            "position": [
              {
                "posseqnum": 137940,
                "posorgshortdesc": "M/SS",
                "posnumtext": "D1675600",
                "posgradecode": "OC",
                "postitledesc": "CONFLICT ADVISOR",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 234491,
            "airrmrkseqnum": 14,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 14,
                "rmrkrccode": "S",
                "rmrkordernum": 8,
                "rmrkshortdesctext": "Extend Stretch",
                "rmrkmutuallyexclusiveind": "Y",
                "rmrktext": "Extension in Stretch",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 234491,
            "airrmrkseqnum": 48,
            "remarkInserts": [
              {
                "airiinsertiontext": "04/14/2021",
                "airiaiseqnum": 234491,
                "airirmrkseqnum": 48,
                "aiririseqnum": 12,
                "airicreateid": 20438,
                "airicreatedate": "2022-05-10T14:06:18",
                "airiupdateid": 20438,
                "airiupdatedate": "2022-05-10T14:06:18"
              }
            ],
            "remarkRefData": [
              {
                "rmrkseqnum": 48,
                "rmrkrccode": "P",
                "rmrkordernum": 11,
                "rmrkshortdesctext": "Senior cede",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "Senior Cede Granted on {date}",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 234491,
            "airrmrkseqnum": 67,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 67,
                "rmrkrccode": "E",
                "rmrkordernum": 4,
                "rmrkshortdesctext": "timely",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "Timely",
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 234491,
            "aillatcode": "R",
            "ailtfcd": null,
            "ailcpid": null,
            "ailperdetseqnum": 418675,
            "ailseqnum": 352097,
            "ailposseqnum": 137940,
            "ailtodcode": "J",
            "ailtodmonthsnum": null,
            "ailtodothertext": null,
            "ailetadate": "2021-08-01T00:00:00",
            "ailetdtedsepdate": "2024-08-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 303423,
            "ailasgdrevisionnum": 2,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 20438,
            "ailupdatedate": "2022-05-10T14:06:17",
            "latabbrdesctext": "Extend",
            "latdesctext": "Extend",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 137940,
                "asgdasgseqnum": 303423,
                "asgdrevisionnum": 2,
                "asgdasgscode": "EF",
                "asgdetadate": "2021-08-02T00:00:00",
                "asgdetdteddate": "2023-08-02T00:00:00",
                "asgdtoddesctext": "2 YRS/TRANSFER",
                "position": [
                  {
                    "posseqnum": 137940,
                    "posorgshortdesc": "M/SS",
                    "posnumtext": "D1675600",
                    "posgradecode": "OC",
                    "postitledesc": "CONFLICT ADVISOR",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 137940,
                "posorgshortdesc": "M/SS",
                "posnumtext": "D1675600",
                "posgradecode": "OC",
                "postitledesc": "CONFLICT ADVISOR",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ]
      },
      {
        "aiseqnum": 236248,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:Tandem:  No issues;No Repayment Issues;Creator(s):Williams, Kendl E;Modifier(s):WilliamsKE;CDO: Bell, Susan Tebeau; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 311108,
        "aiasgdrevisionnum": 2,
        "aiperdetseqnum": 388797,
        "aipmiseqnum": 236641,
        "aiitemcreatorid": 2603,
        "aiupdateid": 2603,
        "aisdesctext": "Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 236641,
            "pmimiccode": "S",
            "pmiupdateid": 2603,
            "pmiupdatedate": "2022-07-08T13:31:48",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Separations"
          }
        ],
        "person": [
          {
            "perpiifirstname": "MASEBA-ARMAEE",
            "perpiilastname": "FEEMAN-STROMPFEE",
            "perpiiseqnum": 19299,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 388797,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 8144,
            "asgdasgseqnum": 311108,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2022-03-01T00:00:00",
            "asgdetdteddate": null,
            "asgdtoddesctext": "INDEFINITE",
            "position": [
              {
                "posseqnum": 8144,
                "posorgshortdesc": "EUR",
                "posnumtext": "S8888117",
                "posgradecode": "00",
                "postitledesc": "SUPV INTELLIGENCE OPERATIONS S",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 236248,
            "airrmrkseqnum": 22,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 22,
                "rmrkrccode": "R",
                "rmrkordernum": 3,
                "rmrkshortdesctext": "No Repayment",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "No Repayment Issues",
                "rmrkactiveind": "Y"
              }
            ]
          },
          {
            "airaiseqnum": 236248,
            "airrmrkseqnum": 28,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 28,
                "rmrkrccode": "I",
                "rmrkordernum": 4,
                "rmrkshortdesctext": "No Tandem issues",
                "rmrkmutuallyexclusiveind": "Y",
                "rmrktext": "Tandem:  No issues",
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [
          {
            "hruempseqnbr": 28357,
            "hruneuid": null,
            "hruid": 2603,
            "neuid": null,
            "neulastnm": null,
            "neufirstnm": null,
            "neumiddlenm": null,
            "empUser": [
              {
                "perpiifirstname": "TEMPLE-NANFEIEE",
                "perpiilastname": "SHEEHY-DIULINGEE",
                "perpiiseqnum": 28357,
                "perpiimiddlename": "NMN",
                "perpiisuffixname": " ",
                "perdetseqnum": 399433,
                "persdesc": "Active"
              }
            ]
          }
        ],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 236248,
            "aillatcode": "N",
            "ailtfcd": "8154",
            "ailcpid": null,
            "ailperdetseqnum": 388797,
            "ailseqnum": 354691,
            "ailposseqnum": null,
            "ailtodcode": null,
            "ailtodmonthsnum": null,
            "ailtodothertext": null,
            "ailetadate": null,
            "ailetdtedsepdate": "2022-08-31T00:00:00",
            "aildsccd": "110010001",
            "ailcitytext": "WASHINGTON",
            "ailcountrystatetext": "DISTRICT OF COLUMBIA",
            "ailusind": null,
            "ailasgseqnum": null,
            "ailasgdrevisionnum": null,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 2603,
            "ailupdatedate": "2022-07-08T13:31:26",
            "latabbrdesctext": "Retire",
            "latdesctext": "Retirement",
            "agendaLegAssignment": [],
            "agendaLegPosition": []
          }
        ]
      },
      {
        "aiseqnum": 236285,
        "aicorrectiontext": null,
        "aicombinedremarktext": "Remarks:EL Directed;Creator(s):Binion, Amber F;Modifier(s):BinionAF;CDO: Chin, Jennifer G; ;",
        "aicombinedtodothertext": null,
        "aitodcode": null,
        "aitoddesctext": null,
        "aiasgseqnum": 298907,
        "aiasgdrevisionnum": 3,
        "aiperdetseqnum": 505154,
        "aipmiseqnum": 236678,
        "aiitemcreatorid": 60648,
        "aiupdateid": 60648,
        "aisdesctext": "Ready",
        "Panel": [
          {
            "pmseqnum": 2639,
            "pmpmscode": "I",
            "pmiseqnum": 236678,
            "pmimiccode": "R",
            "pmiupdateid": 60648,
            "pmiupdatedate": "2022-07-14T11:17:17",
            "pmsdesctext": "Initiated",
            "pmdmdtcode": "MEET",
            "pmddttm": "2022-07-19T13:55:00",
            "micdesctext": "Review"
          }
        ],
        "person": [
          {
            "perpiifirstname": "EBDARIHMENEE",
            "perpiilastname": "HARFMANNEE",
            "perpiiseqnum": 606003,
            "perpiimiddlename": "NMN",
            "perpiisuffixname": " ",
            "perdetseqnum": 505154,
            "persdesc": "Active"
          }
        ],
        "agendaAssignment": [
          {
            "asgposseqnum": 64447,
            "asgdasgseqnum": 298907,
            "asgdrevisionnum": 2,
            "asgdasgscode": "EF",
            "asgdetadate": "2021-08-21T00:00:00",
            "asgdetdteddate": "2023-08-21T00:00:00",
            "asgdtoddesctext": "2 YRS (1 R & R)",
            "position": [
              {
                "posseqnum": 64447,
                "posorgshortdesc": "MUMBAI",
                "posnumtext": "59084001",
                "posgradecode": "03",
                "postitledesc": "Program Manager/ Emp Relations",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          },
          {
            "asgposseqnum": 64447,
            "asgdasgseqnum": 298907,
            "asgdrevisionnum": 3,
            "asgdasgscode": "EF",
            "asgdetadate": "2021-08-01T00:00:00",
            "asgdetdteddate": "2022-08-01T00:00:00",
            "asgdtoddesctext": "1 YEAR",
            "position": [
              {
                "posseqnum": 64447,
                "posorgshortdesc": "MUMBAI",
                "posnumtext": "59084001",
                "posgradecode": "03",
                "postitledesc": "Program Manager/ Emp Relations",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ],
        "remarks": [
          {
            "airaiseqnum": 236285,
            "airrmrkseqnum": 47,
            "remarkInserts": [],
            "remarkRefData": [
              {
                "rmrkseqnum": 47,
                "rmrkrccode": "B",
                "rmrkordernum": 1,
                "rmrkshortdesctext": "EL Direct",
                "rmrkmutuallyexclusiveind": "N",
                "rmrktext": "EL Directed",
                "rmrkactiveind": "Y"
              }
            ]
          }
        ],
        "creators": [
          {
            "hruempseqnbr": 572806,
            "hruneuid": null,
            "hruid": 60648,
            "neuid": null,
            "neulastnm": null,
            "neufirstnm": null,
            "neumiddlenm": null,
            "empUser": [
              {
                "perpiifirstname": "MENYU-DELYEE",
                "perpiilastname": "LICAH-MARENOECEE",
                "perpiiseqnum": 572806,
                "perpiimiddlename": "NMN",
                "perpiisuffixname": " ",
                "perdetseqnum": 503968,
                "persdesc": "Active"
              }
            ]
          }
        ],
        "updaters": [],
        "agendaLegs": [
          {
            "ailaiseqnum": 236285,
            "aillatcode": "T",
            "ailtfcd": "8154",
            "ailcpid": null,
            "ailperdetseqnum": 505154,
            "ailseqnum": 354742,
            "ailposseqnum": null,
            "ailtodcode": null,
            "ailtodmonthsnum": null,
            "ailtodothertext": null,
            "ailetadate": null,
            "ailetdtedsepdate": "2022-08-20T00:00:00",
            "aildsccd": null,
            "ailcitytext": "MT PLEASANT",
            "ailcountrystatetext": " SOUTH CAROLINA",
            "ailusind": null,
            "ailasgseqnum": null,
            "ailasgdrevisionnum": null,
            "ailsepseqnum": 165502,
            "ailsepdrevisionnum": 1,
            "ailupdateid": 60648,
            "ailupdatedate": "2022-07-11T13:58:54",
            "latabbrdesctext": "Break",
            "latdesctext": "Break",
            "agendaLegAssignment": [],
            "agendaLegPosition": []
          },
          {
            "ailaiseqnum": 236285,
            "aillatcode": "R",
            "ailtfcd": null,
            "ailcpid": null,
            "ailperdetseqnum": 505154,
            "ailseqnum": 354744,
            "ailposseqnum": 64447,
            "ailtodcode": "D",
            "ailtodmonthsnum": null,
            "ailtodothertext": null,
            "ailetadate": "2021-08-01T00:00:00",
            "ailetdtedsepdate": "2023-08-01T00:00:00",
            "aildsccd": null,
            "ailcitytext": null,
            "ailcountrystatetext": null,
            "ailusind": null,
            "ailasgseqnum": 298907,
            "ailasgdrevisionnum": 3,
            "ailsepseqnum": null,
            "ailsepdrevisionnum": null,
            "ailupdateid": 60648,
            "ailupdatedate": "2022-07-14T11:17:17",
            "latabbrdesctext": "Extend",
            "latdesctext": "Extend",
            "agendaLegAssignment": [
              {
                "asgposseqnum": 64447,
                "asgdasgseqnum": 298907,
                "asgdrevisionnum": 3,
                "asgdasgscode": "EF",
                "asgdetadate": "2021-08-01T00:00:00",
                "asgdetdteddate": "2022-08-01T00:00:00",
                "asgdtoddesctext": "1 YEAR",
                "position": [
                  {
                    "posseqnum": 64447,
                    "posorgshortdesc": "MUMBAI",
                    "posnumtext": "59084001",
                    "posgradecode": "03",
                    "postitledesc": "Program Manager/ Emp Relations",
                    "poslanguage1code": null,
                    "poslanguage1desc": null,
                    "posspeakproficiency1code": null,
                    "posreadproficiency1code": null,
                    "poslanguage2code": null,
                    "poslanguage2desc": null,
                    "posspeakproficiency2code": null,
                    "posreadproficiency2code": null
                  }
                ]
              }
            ],
            "agendaLegPosition": [
              {
                "posseqnum": 64447,
                "posorgshortdesc": "MUMBAI",
                "posnumtext": "59084001",
                "posgradecode": "03",
                "postitledesc": "Program Manager/ Emp Relations",
                "poslanguage1code": null,
                "poslanguage1desc": null,
                "posspeakproficiency1code": null,
                "posreadproficiency1code": null,
                "poslanguage2code": null,
                "poslanguage2desc": null,
                "posspeakproficiency2code": null,
                "posreadproficiency2code": null
              }
            ]
          }
        ]
      }
    ];
    const fake2 = [
      {
        "aiseqnum": 199034,
        "aicorrectiontext": "",
        "aicombinedremarktext": "Remarks:EL Directed;2nd Tour;Creator(s):Campbell, Angela M;Modifier(s):CampbellAM;CDO: Kula, Toni L; ;",
        "aicombinedtodothertext": "",
        "aitodcode": "",
        "aitoddesctext": "",
        "aiasgseqnum": 268177,
        "aiasgdrevisionnum": 3,
        "aiperdetseqnum": 503968,
        "aipmiseqnum": 199427,
        "aiitemcreatorid": 27392,
        "aiupdateid": 27392,
        "aisdesctext": "Not Ready",
      }
    ]
    console.log(req.params.id)
    res.status(200).send({
      Data: fake2,
      usl_id: 0,
      return_code: 0
    })
  })
};

module.exports = appRouter;
