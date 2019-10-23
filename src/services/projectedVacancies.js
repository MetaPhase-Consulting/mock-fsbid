
const { readJson, filterList, sortList, paginateList, freeTextFilter, todFilter, languageFilter, overseasFilter } = require('./common')

const projectedVacancies = readJson("../data/projectedVacancies.json")

// Maps filter values to data values
const FILTERS = {
  "fv_request_params.ad_id": { required: true },
  "fv_request_params.page_size": { required: true },
  "fv_request_params.page_index": { required: true },
  "fv_request_params.ordery_by": {},
  "fv_request_params.pos_numbers": { field: "position" },
  "fv_request_params.grades": { field: "pos_grade_code" },
  "fv_request_params.languages": { filter: languageFilter, field: ["lang1", "lang2"] },
  "fv_request_params.bureaus": { field: "bureau_code" },
  "fv_request_params.danger_pays": { field: "bt_danger_pay_num" },
  "fv_request_params.bid_seasons": { field: "bsn_id" },
  "fv_request_params.location_codes": { field: "pos_location_code" },
  "fv_request_params.tod_codes": { filter: todFilter, field: "tod" }, //?? Need sample data for this field
  "fv_request_params.freeText": { filter: freeTextFilter, field: ["pos_title_desc", "pos_skill_desc", "pos_job_category_desc", "ppos_capsule_descr_txt"] },
  "fv_request_params.differential_pays": { field: "bt_differential_rate_num" },
  "fv_request_params.skills": { field: "skill_code" },
  "fv_request_params.seq_nums": { field: "fv_seq_num" },
  "fv_request_params.overseas_ind": { filter: overseasFilter, field: "pos_location_code" }
}

function get_projected_vacancies(query) {
  const limit = query["fv_request_params.page_size"]
  const page_number = query["fv_request_params.page_index"]
  const sort = query["fv_request_params.order_by"]
  
  return { 
    "Data": paginateList(sortList(filterList(projectedVacancies, FILTERS, query), sort), page_number, limit),
    "usl_id": 44999637,
    "return_code": 0
  }
}

function get_projected_vacancies_count(query) {
  return {
    "Data": [
        {
           "count(1)":  get_projected_vacancies(query).Data.length
        }
     ],
    "usl_id":  44999615,
    "return_code":  0
 }
}
module.exports = { get_projected_vacancies, get_projected_vacancies_count }
