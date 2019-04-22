const projectedVacancies = [
  {
    "bsn_id":1,
    "bsn_descr_text": "Summer 2020",
    "pos_id": 1,
    "grade": "MC",
    "skill_code": "0020",
    "skill": "Executive (Career) (0020)",
    "bureau_code": "110000",
    "bureau":  "Bureau of Western Hemisphere Affairs (WHA)",
    "org_code": "310612",
    "organization": "Tunis, Tunisia",
    "representation": "[12058000] LABOR/POLITICAL OFFICER (Tunis, Tunisia)",
    "position_number": "12058000",
    "title": "LABOR/POLITICAL OFFICER",
    "isOverseas": "N",
    "createDate": "2006-09-20",
    "updateDate": "2019-04-08",
    "effectiveDate": "2014-08-11",
    "language_code_1": "PY",
    "language1": "Portuguese (PY)",
    "spoken_proficiency_1": "3",
    "reading_proficiency_1": "3",
    "language_representation_1": "Portuguese (PY) 3/3",
    "language2": "",
    "spoken_proficiency_2": "",
    "reading_proficiency_2": "",
    "language_representation_2": "",
    "locationCode": "BR9300000",
    "tod_code": "I",
    "tour_of_duty": "3 YRS (2 R&R)",
    "cost_of_living_adjustment": 20,
    "differential_rate": 10,
    "danger_pay": 0,
    "rest_relaxation_point": "Miami",
    "has_consummable_allowance": "false",
    "has_service_needs_differential": "false",
    "incumbent": "Doe, John X",
    "assignee":  "Doe, Jane A",
    "ted": "06/2020",
  },
  {
    "bsn_id":2,
    "bsn_descr_text": "Winter 2020",
    "pos_id": 1,
    "grade": "MC",
    "skill_code": "0020",
    "skill": "Executive (Career) (0020)",
    "bureau_code": "110000",
    "bureau":  "Bureau of Western Hemisphere Affairs (WHA)",
    "org_code": "310612",
    "organization": "Tunis, Tunisia",
    "representation": "[12058000] LABOR/POLITICAL OFFICER (Tunis, Tunisia)",
    "position_number": "12058000",
    "title": "LABOR/POLITICAL OFFICER",
    "isOverseas": "N",
    "createDate": "2006-09-20",
    "updateDate": "2019-04-08",
    "effectiveDate": "2014-08-11",
    "language_code_1": "PY",
    "language1": "Portuguese (PY)",
    "spoken_proficiency_1": "3",
    "reading_proficiency_1": "3",
    "language_representation_1": "Portuguese (PY) 3/3",
    "language2": "",
    "spoken_proficiency_2": "",
    "reading_proficiency_2": "",
    "language_representation_2": "",
    "locationCode": "BR9300000",
    "tod_code": "I",
    "tour_of_duty": "3 YRS (2 R&R)",
    "cost_of_living_adjustment": 20,
    "differential_rate": 10,
    "danger_pay": 0,
    "rest_relaxation_point": "Miami",
    "has_consummable_allowance": "false",
    "has_service_needs_differential": "false",
    "incumbent": "Doe, John X",
    "assignee":  "Doe, Jane A",
    "ted": "12/2020",
  }
]

// Maps filter values to data values
const FILTERS = {
  "bsn_id": "bsn_id",
  "bureauCode": "bureau_code",
  "dangerPay": "danger_pay",
  "gradeCode": "grade",
  "languageCode":"language_code_1",
  "organizationCode": "org_code",
  "positionNumber": "position_number",
  "postDifferential": "differential_rate",
  "skillCode": "skill_code",
  "tourOfDutyCode": "tod_code"
}

function get_projected_vacancies(query) {
  return projectedVacancies.filter(item => {
    for (let key in query) {
      const field = FILTERS[key]
      // Ignore fields not in filter list (like pagination)
      if (field && (item[field] === undefined || item[field] != query[key]))
        return false;
    }
    return true;
  })
}

module.exports = { get_projected_vacancies }