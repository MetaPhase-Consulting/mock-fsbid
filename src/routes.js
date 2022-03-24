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
  app.get('/v1/agendas/references/statuses', lookup(lookups.get_agenda_item_statuses))
  app.get('/v1/panels/references/categories', lookup(lookups.get_panel_categories))
  app.get('/v1/agendas/references/remark-categories', lookup(lookups.get_agenda_item_remark_categories))
  app.get('/v1/agendas/references/remarks', lookup(lookups.get_agenda_item_remarks_ref))
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

  app.get('/v1/agendaItems/:id', async function(req, res, next) {
    if (!req.params.id) {
      next();
    }
    let ai = await agendas.getAgendaItems(req.params.id)

    res.status(200).send({
      Data: ai,
      usl_id: 0,
      return_code: 0
    })
  })

  app.get('/v1/agendaItems', async function(req, res) { // singleton
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
};

module.exports = appRouter;
