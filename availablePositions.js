const { sortList, paginateList, freeTextFilter, todFilter, languageFilter, overseasFilter } = require('./common')

const availablePositions = [
  {
    cp_id: 1,
    cp_status: 'OP',
    pos_title_desc: "CHIEF OF STAFF",
    pos_location_code: "110010001",
    post_org_country_state: 'WASHINGTON, DISTRICT OF COLUMBIA',
    ted: "2020-07-02T00:00:00",
    cp_ted_ovrrd_dt: "2019-06-01T00:00:00",
    cycle_id: 164,
    cycle_status: "A",
    bureau_code: "200000",
    cycle_nm_txt: 'Summer 2019',
    pos_skill_desc: 'MANAGEMENT OFFICER',
    pos_job_category_desc: 'Management',
    pos_grade_code: "OC",
    lang1: null,
    lang2: null,
    tod: null,
    bt_differential_rate_num: null,
    bt_danger_pay_num: null, 
    incumbent: 'Test',
    position: 'D0994900',
    ppos_capsule_descr_txt: 'ON SPEC. The Bureau of Administration (A) is the backbone of all Department management operations.',
    cp_ttl_bidder_qty: null,
    cp_at_grd_qty: null,
    cp_in_cone_qty: null,
    cp_at_grd_in_cone_qty: null,
    cp_post_dt: "2018-10-15T15:39:33",
    pos_bureau_short_desc: "A",
    pos_skill_code: "2010"
  },
  {
    cp_id: 2,
    cp_status: 'OP',
    pos_title_desc: "CHIEF OF STAFF",
    pos_location_code: "110010001",
    post_org_country_state: 'WASHINGTON, DISTRICT OF COLUMBIA',
    ted: "2020-07-02T00:00:00",
    cp_ted_ovrrd_dt: "2019-06-01T00:00:00",
    cycle_id: 164,
    cycle_status: "A",
    bureau_code: "200000",
    cycle_nm_txt: 'Summer 2019',
    pos_skill_desc: 'MANAGEMENT OFFICER',
    pos_job_category_desc: 'Management',
    pos_grade_code: "OC",
    lang1: null,
    lang2: null,
    tod: null,
    bt_differential_rate_num: null,
    bt_danger_pay_num: null, 
    incumbent: 'Test',
    position: 'D0994900',
    ppos_capsule_descr_txt: 'ON SPEC. The Bureau of Administration (A) is the backbone of all Department management operations.',
    cp_ttl_bidder_qty: null,
    cp_at_grd_qty: null,
    cp_in_cone_qty: null,
    cp_at_grd_in_cone_qty: null,
    cp_post_dt: "2018-10-15T15:39:33",
    pos_bureau_short_desc: "A",
    pos_skill_code: "2010"
  },
  {
    cp_id: 3,
    cp_status: 'OP',
    pos_title_desc: "ADMINISTRATOR",
    pos_location_code: "110010001",
    post_org_country_state: 'WASHINGTON, DISTRICT OF COLUMBIA',
    ted: "2020-07-02T00:00:00",
    cp_ted_ovrrd_dt: "2019-06-01T00:00:00",
    cycle_id: 164,
    cycle_status: "A",
    bureau_code: "200000",
    cycle_nm_txt: 'Summer 2019',
    pos_skill_desc: 'MANAGEMENT OFFICER',
    pos_job_category_desc: 'Management',
    pos_grade_code: "01",
    lang1: null,
    lang2: null,
    tod: null,
    bt_differential_rate_num: null,
    bt_danger_pay_num: null, 
    incumbent: 'Test',
    position: 'D0994900',
    ppos_capsule_descr_txt: 'ON SPEC. The Bureau of Administration (A) is the backbone of all Department management operations.',
    cp_ttl_bidder_qty: null,
    cp_at_grd_qty: null,
    cp_in_cone_qty: null,
    cp_at_grd_in_cone_qty: null,
    cp_post_dt: "2018-10-15T15:39:33",
    pos_bureau_short_desc: "A",
    pos_skill_code: "2010"
  }
]

// Maps filter values to data values
const FILTERS = {
  "request_params.ad_id": { required: true },
  "request_params.page_size": { required: true },
  "request_params.page_index": { required: true },
  "request_params.ordery_by": {},
  "request_params.pos_numbers": { field: "position" },
  "request_params.skills": { field: "" },
  "request_params.grades": { field: "pos_grade_code" },
  "request_params.languages": { filter: languageFilter, field: ["lang1", "lang2"] },
  "request_params.bureaus": { field: "bureau_code" },
  "request_params.danger_pays": { field: "bt_danger_pay_num" },
  "request_params.bid_seasons": { field: "bsn_id" },
  "request_params.location_codes": { field: "pos_location_code" },
  "request_params.tod_codes": { filter: todFilter, field: "tod" }, //?? Need sample data for this field
  "request_params.freeText": { filter: freeTextFilter, field: ["pos_title_desc", "pos_skill_desc", "pos_job_category_desc", "ppos_capsule_descr_txt"] },
  "request_params.differential_pays": { field: "bt_differential_rate_num" },
  "request_params.skills": { field: "skill_code" },
  "request_params.cp_ids": { field: "cp_id" },
  "fv_request_params.overseas_ind": { filter: overseasFilter, field: "pos_location_code" }
}

function get_available_positions(query) {
  const limit = query["request_params.page_size"] || 25
  const page_number = query["request_params.page_index"] || 1
  const sort = query["request_params.order_by"]
  let positions = availablePositions.filter(item => {
    for (let key in query) {
      const fields = FILTERS[key] ? FILTERS[key].field : null
      let found = false
      // Ignore fields not in filter list (like pagination)
      if (fields) {
        const field = Array.isArray(fields) ? fields : [fields]
        for (let index = 0; index < field.length; index++) {
          const element = field[index];
          const filters = Array.isArray(query[key]) ? query[key] : query[key].split(',')
          console.log(`Search on ${element} with filters ${filters}`)
          // Check to see if there is a filter function
          const customFilter = FILTERS[key].filter
          if (customFilter) {
            found = found || customFilter(filters, element, item)
          } else {
            if (item[element] !== undefined && filters.includes(`${item[element]}`)) {
              found = found || true;
            }
          }
        }
        return found
      }
    }
    return true;
  })

  return { 
    "Data": paginateList(sortList(positions, sort), page_number, limit),
    "usl_id": 44999637,
    "return_code:": 0
  }
}

function get_available_positions_count(query) {
  return {
    "Data": [
        {
           "count(1)":  get_available_positions(query).Data.length
        }
     ],
    "usl_id":  44999615,
    "return_code":  0
 }
}
module.exports = { get_available_positions, get_available_positions_count }
