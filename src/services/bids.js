const { readJson } = require('./common')

const bids = readJson('../data/bids.json')

const { get_available_position_by_id } = require('./availablePositions')

function get_bid(cp_id, perdet_seq_num) {
  console.log(`Trying to get bid for cp_id=${cp_id} and perdet_seq_num=${perdet_seq_num}`)
  return bids.find(b => b.cp_id == cp_id && b.perdet_seq_num == perdet_seq_num)
}

function get_bids(query) {
  const { perdet_seq_num } = query
  return bids.filter(bid => bid.perdet_seq_num == perdet_seq_num);
}

function add_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  const ap = get_available_position_by_id(cp_id)
  if (!ap) {
    throw Error(`No ap with cp_id = ${cp_id} was found`)
  }
  // Cannot bid on the same position more than once
  if (!get_bid(cp_id, perdet_seq_num)) {
    let [city, state] = ap.post_org_country_state.split(',')
    const bid = {
      "perdet_seq_num": perdet_seq_num,
      "cycle_nm_txt": ap.cycle_nm_txt,
      "cp_id": cp_id,
      "ptitle": ap.pos_title_desc,
      "pos_skill_code": ap.pos_skill_code,
      "pos_skill_desc": ap.pos_skill_desc,
      "pos_grade_code": ap.pos_grade_code,
      "ubw_hndshk_offrd_flg": "N",
      "ubw_hndshk_offrd_dt": "",
      "ubw_create_dt": new Date().toISOString(),
      "ubw_submit_dt": "",
      "bs_cd": "W",
      "bs_descr_txt": "Not Submitted",
      "cp_ttl_bidder_qty": 0,
      "cp_at_grd_qty": 0,
      "cp_in_cone_qty": 0,
      "cp_at_grd_in_cone_qty": 0,
      "location_city": city,
      "location_state": state,
      "location_country": "USA"
    }
    console.log(`Adding bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
    bids.push(bid)
  }
  return { Data: null, usl_id: 45066084, return_code: 0 }
}

function submit_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  // Get the bid
  for (var i = bids.length - 1; i >= 0; --i) {
    const bid = bids[i]
    if (bid.cp_id == cp_id && bid.perdet_seq_num == perdet_seq_num) {
      console.log(`Submitting bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
      // Update the status
      bid.bs_cd = "A"
      bid.bs_descr_txt =  "Active"
      bid.ubw_submit_dt = new Date().toISOString()
      bids[i] = bid
    }
  }

  return { Data: null, usl_id: 45066084, return_code: 0 } 
}

function remove_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  // The error code, returned if no bid could be found
  let return_code = -1
  for (var i = bids.length - 1; i >= 0; --i) {
    const bid = bids[i]
    if (bid.cp_id == cp_id && bid.perdet_seq_num == perdet_seq_num) {
      return_code = 0
      console.log(`Removing bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
      bids.splice(i,1);
    }
  }
  
  // Even if the bid doesn't exist, it succeeds
  return { Data: null, usl_id: 45066084, return_code }

}

module.exports = { get_bids, add_bid, submit_bid, remove_bid }