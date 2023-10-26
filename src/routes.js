const { readJson, randomIntInclusive } = require('../seeds/data/helpers')

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
const publishablePositions = readJson('./publishable_positions.json')
const publishablePositionFilters = readJson('./publishable_positions_filters.json')
const publishablePositionEdit = readJson('./publishable_positions_filters.json')
const searchPostAccessList = readJson('./search_post_access_list.json')
const searchPostAccessFilters = readJson('./search_post_access_filters.json')
const listBidSeasons = readJson('./manage_bid_seasons.json')
const backOfficeReturnCodes = readJson('./backoffice_return_codes.json')
const jobCategories = readJson('./job_categories.json')
const jobCategorySkills = readJson('./job_category_skills.json')
const jobCategoryEdit = readJson('./job_category_edit.json')

const jwt = require('jsonwebtoken');
const _ = require('lodash');

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

  app.get('/v1/Employees/:id/EmployeeProfileReportByCDO', async function (req, res) {
    common.getEmployeeProfile(req, res,false);
  });

  app.get('/v1/Employees/:id/PrintEmployeeProfileReport', async function (req, res) {
    common.getEmployeeProfile(req, res,true);
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
  app.get('/v1/references/tours-of-duty', lookup(lookups.get_toursofduty))
  app.get('/v1/fsbid/bureaus', lookup(lookups.get_bureaus))
  app.get('/v1/references/skills', lookup(lookups.get_codes))
  app.get('/v1/references/Locations', lookup(lookups.get_locations))
  app.get('/v1/references/travel-functions', lookup(lookups.get_travel_functions))
  app.get('/v1/agendas/references/statuses', lookup(lookups.get_agenda_item_statuses))
  app.get('/v1/agendas/references/remark-categories', lookup(lookups.get_remark_categories))
  app.get('/v1/agendas/references/remarks', lookup(lookups.get_remarks))
  app.get('/v1/agendas/references/leg-action-types', lookup(lookups.get_leg_action_types))
  app.get('/v1/panels/references/categories', lookup(lookups.get_panel_categories))
  app.get('/v1/panels/references/statuses', lookup(lookups.get_panel_statuses))
  app.get('/v1/panels/references/types', lookup(lookups.get_panel_types))
  app.get('/v1/positions/classifications', lookup(lookups.get_frequent_positions))
  app.get('/v1/posts/attributes', async function(req, res) {
    // TODO - add all post attributes tables by query param
    const data = await postattributes.get_postattributes(req.query)
    res.status(200).send(data)
  })

  app.get('/v1/references/gsa-locations', async function(req, res) {
    const locations = await lookups.getGSALocations(req.query)

    res.status(200).send({
      Data: locations,
      usl_id: 0,
      return_code: 0
    })
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

  app.get("/v1/clients/availablebidders/:bureauORcdo", async function (req, res) {
    const isBureau = req.params?.bureauORcdo === 'bureau';
    const isCDO = req.params?.bureauORcdo === 'cdo';

    if (!req.headers?.jwtauthorization) {
      res.status(200).send({ Data: null, usl_id: 4000004, return_code: -1 })
    } else if (!isBureau && !isCDO) {
      console.log('invalid EP.');
      res.status(500).send({ "Message": "An error has occurred." });
    } else if (!req.query?.is_asc) {
      console.log('is_asc query param is required.');
      res.status(500).send({ "Message": "An error has occurred." });
    } else if (!isBureau && !_.includes(['NAME', 'STATUS', 'SKILL', 'GRADE', 'TED', 'POST', 'CDO', 'UPDATE'], req.query?.order_by?.toUpperCase())) {
      console.log('order_by query value does not exist.');
      res.status(500).send({ "Message": "An error has occurred." });
    } else {
      const bidders = await availableBidders.get_available_bidders(isBureau);
      res.status(200).send({
        Data: bidders,
        usl_id: 0,
        return_code: 0
      })
    }
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
      const filsCols = common.convertTemplateFiltersCols(req.query, x => x.map(common.agendaNameMapping))
      let ais = await agendas.getAgendaItems(filsCols)

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

  app.get('/v1/vice-positions', async function(req, res) {
    try {
      res.status(200).send(await positions.get_vice_position_by_pos_seq_num(req.query))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  })
  
  app.get('/v1/publishablePositions/capsule', async function(req, res) {
    try {
      res.status(200).send(await positions.get_publishable_position_capsule(req.query))
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  }) 
  
   app.patch('/v1/publishablePositions/capsule', async function(req, res) {
    const { query } = req
    if (!(query.pos_seq_num && query.capsule_descr_txt && query.update_id && query.update_date)) {
      res.status(200).send({ Data: null, usl_id: 4000003, return_code: -2 })
    };
    return res.status(200).send(await positions.update_capsule_description(query))
  });
       
  app.get('/v1/panels', async function(req, res) {
    try {
      const filsCols = common.convertTemplateFiltersCols(req.query, x => x.map(common.panelNameMapping))
      let panels = await agendas.getPanels(filsCols, req.query);

      res.status(200).send({
        Data: panels,
        usl_id: 0,
        return_code: 0
      })
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  })

  app.get('/v1/panels/:pmseqnum/agendas', async function(req, res) {
    try {
      let reqQ = {...req.query};
      if(req.params.pmseqnum) {
        if(reqQ['rp.filter']){
          if(Array.isArray(reqQ['rp.filter'])) {
            reqQ['rp.filter'].push(`pmseqnum|EQ|${req.params.pmseqnum}|`);
          } else {
            reqQ['rp.filter'] = [reqQ['rp.filter'], `pmseqnum|EQ|${req.params.pmseqnum}|`];
          }
        }
        else {
          reqQ['rp.filter'] = `pmseqnum|EQ|${req.params.pmseqnum}|`;
        }
      }

      const filsCols = common.convertTemplateFiltersCols(reqQ)
      let panelAIs = await agendas.getAgendaItems(filsCols);

      res.status(200).send({
          Data: panelAIs,
          usl_id: 0,
          return_code: 0
      })
    } catch (errMsg) {
      console.error(errMsg)
      res.status(500).send({ "Message": "An error has occurred." });
    }
  })

  // For BackOffice lookup
  const procNameDictionary = {
    "qry_modPublishPos": publishablePositions,
    "qry_lstfsbidSearch": publishablePositionFilters,
    "act_modCapsulePos": publishablePositionEdit,
    "prc_lst_org_access": searchPostAccessList, // list search post access page
    "prc_lst_bureau_org_tree": searchPostAccessFilters, // get search post access filters
    "prc_mod_org_access": backOfficeReturnCodes.prc_mod_org_access, // search post access - remove access
    "prc_add_org_access": backOfficeReturnCodes.prc_add_org_access, // manage post access - grant access
    "prc_lst_bid_seasons": listBidSeasons, // list bid seasons
    "prc_iud_bid_season": backOfficeReturnCodes.prc_iud_bid_season, // create/update bid season
    "qry_lstJobCats": jobCategories,
    "qry_getJobCat": jobCategorySkills,
    "act_modJobCat": jobCategoryEdit,
  };

  app.post('/v1/backoffice/BackOfficeCRUD', async function(req, res) {
    const jsonLookup = procNameDictionary[req?.query?.procName];
    res.status(200).send(jsonLookup.success);

    // if (jsonLookup) {
    //   // randomly fail - add criteria for failing
    //   randomIntInclusive(0, 1) ? res.status(200).send(jsonLookup.success) :
    //   res.status(200).send(jsonLookup.fail);
    // } else {
    //   res.status(500).send(
    //     `ORA-06550: line 1, column 29:\nPLS-00302: component 'procName' must be declared\nORA-06550: line 1, column 7:\nPL/SQL: Statement ignored - `
    //   )
    // }

  })
};

module.exports = appRouter;
