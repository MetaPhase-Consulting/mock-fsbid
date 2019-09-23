
const { sortList, paginateList, freeTextFilter, todFilter, languageFilter, overseasFilter } = require('./common')

const projectedVacancies = [
  {
    "fv_seq_num": 89367,
    "pos_title_desc": "CHIEF OF STAFF",
    "pos_location_code": "110010001",
    "post_org_country_state": "WASHINGTON, DISTRICT OF COLUMBIA",
    "ted": "2020-08-02T00:00:00",
    "fv_override_ted_date": null,
    "bsn_id": 12,
    "bureau_code": "016000",
    "bsn_descr_text": "Summer 2020",
    "pos_skill_desc":  "MANAGEMENT OFFICER",
    "pos_job_category_desc":  "Management",
    "pos_grade_code": "OC",
    "bureau_desc": "(MED) BUREAU OF MEDICAL SERVICES",
    "lang1": null,
    "lang2": null,
    "tod": null,
    "bt_differential_rate_num": null,
    "bt_danger_pay_num": null,
    "incumbent": "Siegner",
    "position": "D0994900",
    "ppos_capsule_descr_txt": "ON SPEC.  The Bureau of Admnistration (A) is the back bone of all  dafdafafdadfadfadsfadfadfjfauoiukjigqur ijf iajfdpoiaudf afdoijafdiuwpei poiu foiafdjfd oau0jj;kj",
    "rnum": 1
  },
  {
    "fv_seq_num": 89368,
    "pos_title_desc": "Another Position",
    "pos_location_code": "110010001",
    "post_org_country_state": "WASHINGTON, DISTRICT OF COLUMBIA",
    "ted": "2020-08-02T00:00:00",
    "fv_override_ted_date": null,
    "bsn_id": 12,
    "bureau_code": "OC",
    "bsn_descr_text": "Summer 2020",
    "pos_skill_desc":  "MANAGEMENT OFFICER",
    "pos_job_category_desc":  "Management",
    "pos_grade_code": "06",
    "bureau_desc": "(A)BUREAU OF ADMINISTRATION",
    "lang1": "French(FR) 1/1",
    "lang2": "Spanish(QB) 3/3",
    "tod": null,
    "bt_differential_rate_num": null,
    "bt_danger_pay_num": null,
    "incumbent": "Siegner",
    "position": "D0994901",
    "ppos_capsule_descr_txt": "ON SPEC.  This is the description for the other position",
    "rnum": 2
  },
  {
    "fv_seq_num": 89369,
    "pos_title_desc": "Even Another Position",
    "pos_location_code": "110010001",
    "post_org_country_state": "WASHINGTON, DISTRICT OF COLUMBIA",
    "ted": "2020-10-02T00:00:00",
    "fv_override_ted_date": null,
    "bsn_id": 13,
    "bureau_code": "130000",
    "bsn_descr_text": "Winter 2020",
    "pos_skill_desc":  "MANAGEMENT OFFICER",
    "pos_job_category_desc":  "Management",
    "pos_grade_code": "02",
    "bureau_desc": "(EAP) BUREAU EAST ASIAN AND PACIFIC AFFAIRS",
    "lang1": "Spanish(QB) 3/3",
    "lang2": null,
    "tod": "2 YRS (2 R & R)",
    "bt_differential_rate_num": 20,
    "bt_danger_pay_num": 35,
    "incumbent": "Siegner",
    "position": "D0994902",
    "ppos_capsule_descr_txt": "ON SPEC.  This is the description for the even other position",
    "rnum": 3
  },
]

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
  const limit = query["fv_request_params.page_size"] || 25
  const page_number = query["fv_request_params.page_index"] || 1
  const sort = query["fv_request_params.order_by"]
  let positions = projectedVacancies.filter(item => {
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
