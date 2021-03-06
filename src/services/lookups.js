const {
  Cycles,
  Grades,
  Languages,
  DangerPays,
  DifferentialRates,
  TourOfDuties,
  Bureaus,
  Codes,
  Seasons,
  Locations,
  PostIndicators,
  UnaccompaniedStatuses,
  CommuterPosts
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

const get_seasons = getAll(Seasons)
const get_cycles = getAll(Cycles)
const get_grades = getAll(Grades)
const get_languages = getAll(Languages)
const get_dangerpays = getAll(DangerPays)
const get_differentialrates = getAll(DifferentialRates)
const get_tourofduties = getAll(TourOfDuties)
const get_bureaus = getAll(Bureaus)
const get_codes = getAll(Codes)
const get_locations = getLocations(Locations)
const get_postindicators = getAll(PostIndicators)
const get_unaccompaniedstatuses = getAll(UnaccompaniedStatuses)
const get_commuterposts = getCommuterPosts(CommuterPosts)

module.exports = {
  get_seasons,
  get_cycles,
  get_grades,
  get_languages,
  get_dangerpays,
  get_differentialrates,
  get_tourofduties,
  get_bureaus,
  get_codes,
  get_locations,
  get_postindicators,
  get_unaccompaniedstatuses,
  get_commuterposts
}
