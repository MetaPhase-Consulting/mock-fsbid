var oracledb = require('oracledb');
const _ = require('lodash');
var dbConfig = require('../../oracle.js');
var employees = require('./employees');
const { get } = require('lodash');

const get_available_bidders = async (isBureau = false) => {

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    let q = `SELECT * FROM CDO_AVAILABLEBIDDERS `;
    if (isBureau) { q += 'WHERE IS_SHARED = 1'};

    result = await connection.execute(
      q,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const availableBidders = result.rows.map(o => {
      let o$ = Object.keys(o).reduce((c, k) => (c[k.toLowerCase()] = o[k], c), {});
      o$.perdet_seq_num = +o$.bidder_perdet
      o$ = _.omit(o$, ['bidder_perdet'])
      return o$;
    })

    const proms = result.rows.map(m => employees.get_employee_by_perdet_seq_num(+m.BIDDER_PERDET));

    const emps = await Promise.all(proms)

    const availableBidders$ = availableBidders.map((m, i) => {
      const emp = emps[i][0];
      const skills = {};
      if (_.get(emp, 'skills[0]')) {
        skills.per_skill_code = _.get(emp, 'skills[0].skl_code');
        skills.per_skill_code_desc = _.get(emp, 'skills[0].skill_descr');
      }
      if (_.get(emp, 'skills[1]')) {
        skills.per_skill_2_code = _.get(emp, 'skills[1].skl_code');
        skills.per_skill_2_code_desc = _.get(emp, 'skills[1].skill_descr');
      }
      return {
        ..._.omit(emp, ['currentassignment', 'roles', 'bids', 'classifications', 'bureaus', 'organizations', 'languages']),
        cdo_fullname: _.get(emp, 'manager.fullname'),
        cdo_last_name: _.get(emp, 'manager.last_name'),
        cdo_first_name: _.get(emp, 'manager.first_name'),
        cdo_email: _.get(emp, 'manager.email'),
        languages: (_.get(emp, 'languages') || []).map((l, i) => ({
          "rnum": `${i + 1}`,
          "empl_language_code": l.language_code,
          "empl_language": l.language_short_desc,
          "empl_high_test_date": "2019-09-09T00:00:00-04:00",
          "empl_high_speaking": "2+",
          "empl_high_reading": "3"
        })),
        employee: {
          "perdet_seq_num": emp.perdet_seq_num,
          "per_seq_num": emp.perdet_seq_num,
          "pert_external_id": emp.perdet_seq_num,
          "per_last_name": emp.last_name,
          "per_first_name": emp.first_name,
          "per_middle_name": emp.middle_name,
          "per_suffix_name": emp.suffix_name || undefined,
          "per_grade_code": emp.grade_code,
          ...skills,
          "per_pay_plan_code": "FP",
          "per_tenure_code": "01",
          "rnum": "1",
          currentAssignment: {
            ...(_.omit(_.get(emp, 'assignments[0]', {}), ['position'])),
            "asgd_etd_ted_date": _.get(emp, 'assignments[0].eta_date'),
            "rnum": `${i}`,
            currentPosition: {
              ...(_.omit(_.get(emp, 'assignments[0].position', {}), ['location'])),
              currentLocation: {
                ...(_.omit(_.get(emp, 'assignments[0].position.location', {}), [])),
                "gvt_geoloc_cd": _.get(emp, 'assignments[0].position.location.location_code'),
                "city": _.get(emp, 'assignments[0].position.location.location_city'),
                "state": _.get(emp, 'assignments[0].position.location.location_state'),
                "country": _.get(emp, 'assignments[0].position.location.location_country'),
                "rnum": "1"
              }
            }
          }
        },
        details: {
          ...m,
          "is_shared": `${m.is_shared}`,
        }
      };
    })

    return availableBidders$;

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }

  return {}
}

module.exports = { get_available_bidders };
