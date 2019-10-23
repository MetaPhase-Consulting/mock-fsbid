const { readJson, filterList, sortList, paginateList, freeTextFilter, todFilter, languageFilter, overseasFilter } = require('./common')

const availablePositions = readJson('../data/availablePositions.json')

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
  "request_params.assign_cycles": { field: "cycle_id" },
  "request_params.location_codes": { field: "pos_location_code" },
  "request_params.tod_codes": { filter: todFilter, field: "tod" }, //?? Need sample data for this field
  "request_params.freeText": { filter: freeTextFilter, field: ["pos_title_desc", "pos_skill_desc", "pos_job_category_desc", "ppos_capsule_descr_txt"] },
  "request_params.differential_pays": { field: "bt_differential_rate_num" },
  "request_params.skills": { field: "skill_code" },
  "request_params.cp_ids": { field: "cp_id" },
  "request_params.overseas_ind": { filter: overseasFilter, field: "pos_location_code" }
}

function get_available_positions(query) {
  const limit = query["request_params.page_size"]
  const page_number = query["request_params.page_index"]
  const sort = query["request_params.order_by"]

  return { 
    "Data": paginateList(sortList(filterList(availablePositions, FILTERS, query), sort), page_number, limit),
    "usl_id": 44999637,
    "return_code": 0
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

const get_available_position_by_id = id => availablePositions.find(ap => ap.cp_id == id)

module.exports = { get_available_positions, get_available_positions_count, get_available_position_by_id }
