const { readJson } = require('./common')

const bidSeasons = readJson('../data/bidSeasons.json')

function get_bid_seasons(query) {
  return { "Data": query.bsn_future_vacancy_ind ? bidSeasons.filter(bidSeason => bidSeason.bsn_future_vacancy_ind === query.future_vacancy_ind) : bidSeasons }
}

module.exports = { get_bid_seasons }