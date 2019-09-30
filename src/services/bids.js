const { readJson } = require('./common')

const bids = readJson('../data/bids.json')

const { get_available_position_by_id } = require('./availablePositions')

function get_bid(cp_id, perdet_seq_num) {
  console.log(`Trying to get bid for cp_id=${cp_id} and perdet_seq_num=${perdet_seq_num}`)
  return bids.find(b => b.cp_id == cp_id && b.per_seq_num == perdet_seq_num)
}

function get_bids(query) {
  const { perdet_seq_num } = query
  return bids.filter(bid => bid.per_seq_num == perdet_seq_num);
}

function add_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  const ap = get_available_position_by_id(cp_id)
  if (!ap) {
    throw Error(`No ap with cp_id = ${cp_id} was found`)
  }
  // Cannot bid on the same position more than once
  if (!get_bid(cp_id, perdet_seq_num)) {
    const bid = {
      "check_ind": false,
      "delete_ind": false,
      "per_seq_num": parseInt(perdet_seq_num),
      "per_full_name": "EBERLY-HARNICAR,RIOVON-CZORNY NMN",
      "cycle_nm_txt": `${ap.cycle_nm_txt}`,
      "cs_cd": "A",
      "cs_descr_txt": "Active",
      "cc_cd": "O",
      "cc_descr_txt": "Other",
      "cp_id": ap.cp_id,
      "pos_seq_num": 53960,
      "pos_bureau_code": `${ap.bureau_code}`,
      "pos_bureau_short_desc": `${ap.pos_bureau_short_desc}`,
      "pos_org_code": "330501",
      "pos_org_short_desc": `${ap.post_org_country_state}`,
      "pos_num_text": `${ap.position}`,
      "ptitle": `${ap.pos_title_desc}`,
      "pos_skill_code": `${ap.pos_skill_code}`,
      "pos_skill_desc": `${ap.pos_skill_desc}`,
      "pos_grade_code": `${ap.pos_grade_code}`,
      "ted": `${ap.ted}`,
      "ubw_core_bid_ind": "N",
      "ubw_core_bid_desc": "No",
      "bp_code": "M",
      "bp_descr_txt": "Medium",
      "ubw_rank_num": null,
      "ubw_submit_dt": "2019-02-04T09:44:31",
      "hs_code": null,
      "ubw_hndshk_offrd_flg": "N",
      "ubw_hndshk_offrd_dt": null,
      "bs_cd": "W",
      "bs_descr_txt": "Not Submitted",
      "cps_descr_txt": "Open",
      "bid_count": "<span data-ct=\"001\">1(0/0)0</span>",
      "pos_lang_code": null,
      "pos_lang_desc": null,
      "acp_hard_to_fill_ind": "N",
      "cp_critical_need_ind": "N",
      "pct_short_desc_text": " ",
      "pct_desc_text": " ",
      "ubw_comment": null,
      "bid_unavailable_ind": "N",
      "jo_pos_ind": "N",
      "bid_due_date_passed": "Y",
      "capsule_position_desc": `<a title=\"${ap.pos_bureau_short_desc}\" href=\"#\">${ap.pos_bureau_short_desc}</a>`,
      "famer_link": "<a title=\"Click to view Famer Page\" href=\"#\">fmr</a>",
      "bidding_tool": "<a data-pn=\"10231180\" title=\"Click to view Capsule Description and Bidding Tool\" href=\"#\">10231180</a>",
      "cycle_bidders": "<a title=\"Click to view Cycle Bidder\" href=\"#\">cb</a>",
      "tp_codes": null
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
    if (bid.cp_id == cp_id && bid.per_seq_num == perdet_seq_num) {
      console.log(`Submitting bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
      // Update the status
      bid.cs_cd = "A"
      bid.cs_descr_txt =  "Active"
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
    if (bid.cp_id == cp_id && bid.per_seq_num == perdet_seq_num) {
      return_code = 0
      console.log(`Removing bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
      bids.splice(i,1);
    }
  }
  
  // Even if the bid doesn't exist, it succeeds
  return { Data: null, usl_id: 45066084, return_code }

}

module.exports = { get_bids, add_bid, submit_bid, remove_bid }