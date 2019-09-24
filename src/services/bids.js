const { readJson } = require('./common')

const bids = readJson('../data/bids.json')

function get_bids(query) {
  const { perdet_seq_num } = query
  return bids.filter(bid => bid.perdet_seq_num == perdet_seq_num);
}

function add_bid(data) {
  const { cp_id, perdet_seq_num, status } = data
  return get_bids({perdet_seq_num})
}

function remove_bid(query) {
  const { perdet_seq_num, cp_id } = query
  for (var i = bids.length - 1; i >= 0; --i) {
    if (bids[i].perdet_seq_num == perdet_seq_num && bids[i].cp_id == cp_id) {
        bids.splice(i,1);
    }
  }
  return get_bids({perdet_seq_num})
}

module.exports = { get_bids, add_bid, remove_bid }