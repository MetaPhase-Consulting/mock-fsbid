const omit = require('lodash/omit');
const { Locations } = require('../models')
const common = require('./common')

const formatData = data => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    return data.map(d => {
      const obj = {
        ...d,
        location_code: d.code,
        location_city: d.city,
        location_state: d.state,
        location_country: d.country,
      }
      return omit(obj, ['code', 'city', 'state', 'country']);
    })
  }
}

async function get_locations() {
  const data = await Locations.fetchAll()

  return {
    "Data": formatData(data.serialize()),
    "usl_id": 44999637,
    "return_code": 0
  }
}

module.exports = { get_locations }
