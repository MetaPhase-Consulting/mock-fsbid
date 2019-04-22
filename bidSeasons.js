const bidSeasons = [
  {
    "bsn_id": 12,
    "bsn_descr_text": "Summer 2020",
    "snt_seq_num": 1,
    "bsn_start_date": "2020/05/01",
    "bsn_end_date": "2020/10/31",
    "bsn_create_id": 1223,
    "bsn_create_date": "2018/10/31",
    "bsn_update_id": 1223,
    "bsn_update_date": "2019/01/31",
    "bsn_panel_cutoff_date": "2019/07/31",
    "bsn_future_vacancy_ind": "Y",
  },
  {
    "bsn_id": 13,
    "bsn_descr_text": "Winter 2020",
    "snt_seq_num": 1,
    "bsn_start_date": "2020/11/01",
    "bsn_end_date": "2020/02/28",
    "bsn_create_id": 1223,
    "bsn_create_date": "2019/10/31",
    "bsn_update_id": 1223,
    "bsn_update_date": "2019/01/31",
    "bsn_panel_cutoff_date": "2019/12/31",
    "bsn_future_vacancy_ind": "Y",
  },
  {
    "bsn_id": 14,
    "bsn_descr_text": "Summer 2021",
    "snt_seq_num": 1,
    "bsn_start_date": "2021/05/01",
    "bsn_end_date": "2021/10/31",
    "bsn_create_id": 1223,
    "bsn_create_date": "2019/10/31",
    "bsn_update_id": 1223,
    "bsn_update_date": "2020/01/31",
    "bsn_panel_cutoff_date": "2020/07/31",
    "bsn_future_vacancy_ind": "N",
  },
]


function get_bid_seasons(query) {
  return query.bsn_future_vacancy_ind ? bidSeasons.filter(bidSeason => bidSeason.bsn_future_vacancy_ind === query.bsn_future_vacancy_ind) : bidSeasons
}

module.exports = { get_bid_seasons }