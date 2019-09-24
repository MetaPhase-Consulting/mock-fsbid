const bids = [
  {
    check_ind: false,
    delete_ind: false,
    per_seq_num: 2,
    per_full_name: "EBERLY-HARNICAR,RIOVON-CZORNY NMN",
    cycle_nm_txt: "Now & Winter 2018/2019",
    cs_cd: "A",
    cs_descr_txt: "Active",
    cc_cd: "O",
    cc_descr_txt: "Other",
    cp_id: 151608,
    pos_seq_num: 53960,
    pos_bureau_code: "130000",
    pos_bureau_short_desc: "EAP",
    pos_org_code: "330501",
    pos_org_short_desc: "BEIJING",
    pos_num_text: "10231180",
    ptitle: "Political Officer",
    pos_skill_code: "5505",
    pos_skill_desc: "POLITICAL AFFAIRS",
    pos_grade_code: "02",
    ted: null,
    ubw_core_bid_ind: 'N',
    ubw_core_bid_desc: "No",
    bp_code: "M",
    bp_descr_txt: "Medium",
    ubw_rank_num: null,
    ubw_submit_dt: "2019-02-04T09:44:31",
    hs_code: null,
    ubw_hndshk_offrd_flg: "N",
    ubw_hndshk_offrd_dt: null,
    bs_cd: "A",
    bs_descr_txt: "Active",
    cps_descr_txt: "Open",
    bid_count: "<span data-ct=\"001\">1(0/0)0</span>",
    pos_lang_code: null,
    pos_lang_desc: null,
    acp_hard_to_fill_ind: "N",
    cp_critical_need_ind: "N",
    pct_short_desc_text: " ",
    pct_desc_text: " ",
    ubw_comment: null,
    bid_unavailable_ind: "N",
    jo_pos_ind: "N",
    bid_due_date_passed: "Y",
    capsule_position_desc: "<a title=\"The East Asia and Pacific Hub director plans and implements to engage...\" href=\"#\">60822100</a>",
    famer_link: "<a title=\"Click to view Famer Page\" href=\"#\">fmr</a>",
    bidding_tool: "<a data-pn=\"10231180\" title=\"Click to view Capsule Description and Bidding Tool\" href=\"#\">10231180</a>",
    cycle_bidders: "<a title=\"Click to view Cycle Bidder\" href=\"#\">cb</a>",
    tp_codes: null
  }
]

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