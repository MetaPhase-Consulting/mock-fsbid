const projectedVacancies = [
  {
    "fv_seq_number": 89367,
    "post_title_desc": "CHIEF OF STAFF:",
    "pos_location_code": "110010001",
    "post_org_country_state": "WASHINGTON, DISTRICT OF COLUMBIA",
    "ted": "2020-08-02T00:00:00",
    "fv_override_ted_date": null,
    "bsn_id": 21,
    "bureau_code": "OC",
    "bsn_descr_text": "Summer 2020",
    "pos_skill_desc":  "MANAGEMENT OFFICER",
    "pos_job_category_desc":  "Management",
    "pos_crade_code": "OC",
    "bureau_desc": "(A)BUREAU OF ADMINISTRATION",
    "lang1": null,
    "lang2": null,
    "tod": null,
    "bt_differential_rate_num": null,
    "bt_danger_pay_num": null,
    "incumbent": "Siegner:",
    "position": "D0994900",
    "ppos_capsule_descr_txt": "ON SPEC.  The Bureau of Admnistration (A) is the back bone of all  dafdafafdadfadfadsfadfadfjfauoiukjigqur ijf iajfdpoiaudf afdoijafdiuwpei poiu foiafdjfd oau0jj;kj",
    "rnum": 1
  },
]

// Maps filter values to data values
const FILTERS = {
  "fv_request_params.ad_id": { required: true },
  "fv_request_params.page_size": { required: true },
  "fv_request_params.page_index": { required: true },
  "fv_request_params.ordery_by": {},
  "fv_request_params.pos_numbers": { field: "position" },
  "fv_request_params.skills": { field: "" },
  "fv_request_params.grades": { field: "pos_crade_code" }, //THIS IS SPELLED WRONG???!!!!!!
  "fv_request_params.languages": { field: "lang1" },
  "fv_request_params.bureaus": { field: "bureau_code" },
  "fv_request_params.danger_pays": { field: "bt_danger_pay_num" },
  "fv_request_params.bid_seasons": { field: "bsn_id" },
  "fv_request_params.location_codes": { field: "" },
  "fv_request_params.tod_codes": { field: "tod" }, //?? Need sample data for this field
  "fv_request_params.freeText": { field: "" },
  "fv_request_params.differential_pays": { field: "differential_rate" },
  "fv_request_params.skills": { field: "skill_code" },
  // "organizationCode": "org_code",,
  
}

function get_projected_vacancies(query) {
  const limit = query["fv_request_params.page_size"] || 25
  const page_number = query["fv_request_params.page_index"] || 1
  const positions =  projectedVacancies.filter(item => {
    for (let key in query) {
      const field = FILTERS[key].field
      // Ignore fields not in filter list (like pagination)
      if (field) {
        const filters = Array.isArray(query[key]) ? query[key] : [query[key]]
        console.log(`Search on ${field} with filters ${filters}`)
        if (item[field] === undefined || !filters.includes(`${item[field]}`)) {
          return false;
        }
      }
    }
    return true;
  })
  return { 
    "Data": positions.slice(page_number - 1 * limit, (page_number) * limit),
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
