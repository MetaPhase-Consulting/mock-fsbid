const {
  Cycles,
  Grades,
  Languages,
  DangerPays,
  DifferentialRates,
  TourOfDuties,
  ToursOfDuty,
  Bureaus,
  Codes,
  Seasons,
  Locations,
  PostIndicators,
  UnaccompaniedStatuses,
  CommuterPosts,
  AgendaItemStatuses,
  Organizations,
  PanelMeetingItemCategories,
  PanelMeetingStatuses,
  PanelMeetingTypes,
  RemarkCategories,
  Remarks,
  LegActionTypes,
  TravelFunctions,
  FrequentPositions,
} = require('../models')

const _ = require('lodash')

// Call getAll on the provided model
const getAll = model => async () => {
  try {
    const data = await model.fetchAll()
    return { "Data": data.serialize(), return_code: 0 }
  } catch (Error) {
    console.error(Error)
    return null
  }
}

// We have extra columns on locations for unaccompanied status functionality
// We need to omit this data since it doesn't reflect FSBid response accurately
// Do not remove us_code from table since it's used to create relationship 
// between post/locations & positions for unaccompanied statuses elsewhere
const getLocations = Locations => async () => {
  try {
    const data = await Locations.fetchAll()
    const results = data.serialize().map(d => (
      _.omit(d, ['us_code'])
    ))
    return { "Data": results, return_code: 0 }
  } catch (Error) {
    console.error(Error)
    return null
  }
}
const getGSALocations = Locations => async () => {
  try {
    const data = await Locations.fetchAll()
    const results = data.serialize().map(d => {
      return {
        "locgvtgeoloccd": d.location_code,
        "loceffdt": "",
        "loceffstatus": "A",
        "locgvtstcntrydescr": d.location_state,
        "loccity": d.location_city,
        "locstate": d.location_state?.slice(0, 2).toUpperCase(),
        "loccounty": " ",
        "loccountry": d.location_country,
        "locgvtmsa": " ",
        "locgvtcmsa": " ",
        "locgvtleopayarea": "0",
        "locgvtlocalityarea": " ",
      }
    })
    return { "Data": results, return_code: 0 }
  } catch (Error) {
    console.error(Error)
    return null
  }
}
const getCommuterPosts = CommuterPosts => async () => {
  try {
    const data = await CommuterPosts.fetchAll()
    const results = data.serialize().map(d => (
      _.omit(d, ['location_code_1', 'location_code_2'])
    ))
    return { "Data": results, return_code: 0 }
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const getSome = (model, pickProps, mapObj = null) => async () => {
  try {
    const data = await model.fetchAll()
    const results = data.serialize().map(d => {
      let x = _.pick(d, pickProps);
      if(mapObj) {
        Object.keys(mapObj).forEach(k => {
          if(x[k]){
            x[mapObj[k]] = x[k];
            delete x[k];
          }
        })
      }
      return x;
    });

    return { "Data": results, return_code: 0 }
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const getRemarks = Remarks => async () => {
  try {
    const remarks = await Remarks.fetchAll({
      withRelated: ['RemarkInserts'],
    })

    return { "Data": remarks, return_code: 0 }
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const getFrequentPositions = FrequentPositions => async () => {
  try {
    const data = await FrequentPositions.fetchAll({
      withRelated: ['position', 'position.org', 'position.lang1', 'position.lang2'],
    })
    const results = data.serialize().map(d => {
      return {
        poscposseqnum: d.posseqnum,
          position: [
            {
              posseqnum: d.position.pos_seq_num,
              posorgshortdesc: d.position.org.short_desc,
              posnumtext: d.position.position,
              posgradecode: d.position.pos_grade_code,
              postitledesc: d.position.pos_title_desc,
              poslanguage1code: d.position.lang1.language_code,
              poslanguage1desc: d.position.lang1.language_long_desc,
              posspeakproficiency1code: '3',
              posreadproficiency1code: '2',
              poslanguage2code: d.position.lang2.language_code,
              poslanguage2desc: d.position.lang2.language_long_desc,
              posspeakproficiency2code: '3',
              posreadproficiency2code: '4',
            }
          ]
      }
    })
    return { "Data": results, return_code: 0 }
  } catch (Error) {
    console.error(Error)
    return null
  }
}

const get_seasons = getAll(Seasons)
const get_cycles = getAll(Cycles)
const get_grades = getAll(Grades)
const get_languages = getAll(Languages)
const get_dangerpays = getAll(DangerPays)
const get_differentialrates = getAll(DifferentialRates)
const get_tourofduties = getAll(TourOfDuties)
const get_toursofduty = getAll(ToursOfDuty)
const get_bureaus = getAll(Bureaus)
const get_codes = getAll(Codes)
const get_locations = getLocations(Locations)
const get_GSA_locations = getGSALocations(Locations)
const get_postindicators = getAll(PostIndicators)
const get_unaccompaniedstatuses = getAll(UnaccompaniedStatuses)
const get_commuterposts = getCommuterPosts(CommuterPosts)
const get_agenda_item_statuses = getAll(AgendaItemStatuses)
const get_organizations = getAll(Organizations)
const get_panel_categories = getSome(PanelMeetingItemCategories, ['miccode', 'micdesctext'])
const get_panel_statuses = getSome(PanelMeetingStatuses, ['pmscode', 'pmsdesctext'])
const get_panel_types = getSome(PanelMeetingTypes, ['pmpmtcode', 'pmtdesctext'], {pmpmtcode: 'pmtcode'})
const get_remark_categories = getAll(RemarkCategories)
const get_remarks = getRemarks(Remarks)
const get_leg_action_types = getAll(LegActionTypes)
const get_travel_functions = getAll(TravelFunctions)
const get_frequent_positions = getFrequentPositions(FrequentPositions)

module.exports = {
  get_seasons,
  get_cycles,
  get_grades,
  get_languages,
  get_dangerpays,
  get_differentialrates,
  get_tourofduties,
  get_toursofduty,
  get_bureaus,
  get_codes,
  get_locations,
  get_GSA_locations,
  get_postindicators,
  get_unaccompaniedstatuses,
  get_commuterposts,
  get_agenda_item_statuses,
  get_organizations,
  get_panel_categories,
  get_panel_statuses,
  get_panel_types,
  get_remark_categories,
  get_remarks,
  get_leg_action_types,
  get_travel_functions,
  get_frequent_positions,
}
