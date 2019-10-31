const { 
  Cycles, 
  Grades, 
  Languages, 
  DangerPays, 
  DifferentialRates, 
  TourOfDuties, 
  Bureaus, 
  Codes,
  Seasons
} = require('../models')

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

const get_seasons = getAll(Seasons)
const get_cycles = getAll(Cycles)
const get_grades = getAll(Grades)
const get_languages = getAll(Languages)
const get_dangerpays = getAll(DangerPays)
const get_differentialrates = getAll(DifferentialRates)
const get_tourofduties = getAll(TourOfDuties)
const get_bureaus = getAll(Bureaus)
const get_codes = getAll(Codes)

module.exports = {
  get_seasons,
  get_cycles,
  get_grades,
  get_languages,
  get_dangerpays,
  get_differentialrates,
  get_tourofduties,
  get_bureaus,
  get_codes
}