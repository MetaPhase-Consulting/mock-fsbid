var oracledb = require('oracledb');
const _ = require('lodash');
var dbConfig = require('../../oracle.js');
var employees = require('./employees');

const get_available_bidders = async () => {

  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    result = await connection.execute(
      `SELECT * FROM CDO_AVAILABLEBIDDERS `,
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
      return {
        ..._.omit(emp, ['currentassignment', 'roles', 'bids', 'classifications', 'assignments', 'bureaus', 'organizations']),
        ...m,
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

const get_fake_available_bidders = (isCDO) => {
  const fakeData = 
    [
      {
        "hru_id": "1215",
        "perdet_seq_num": "435652",
        "cdo_fullname": "SCHIISSLER-PENALOZA,COLBYE-GOSTOF NMN",
        "cdo_last_name": "SCHIISSLER-PENALOZA",
        "cdo_first_name": "COLBYE-GOSTOF",
        "cdo_email": "fjx717578jkcewxokeewa@state.gov",
        "employee": {
          "perdet_seq_num": "435652",
          "per_seq_num": "65537",
          "pert_external_id": "154231",
          "per_last_name": "AKINREMI",
          "per_first_name": "ZOHARA-KESEAN",
          "per_middle_name": "NMN",
          "per_grade_code": "06",
          "per_skill_code": "9017",
          "per_skill_code_desc": "OFFICE MANAGEMENT",
          "per_skill_2_code": "9017",
          "per_skill_2_code_desc": "OFFICE MANAGEMENT",
          "per_pay_plan_code": "FP",
          "per_tenure_code": "01",
          "rnum": "1",
          "currentAssignment": {
            "pos_seq_num": "13082",
            "asg_seq_num": "296520",
            "asgd_revision_num": "2",
            "asgd_eta_date": "2020-08-24T00:00:00-04:00",
            "asgd_etd_ted_date": "2021-07-24T00:00:00-04:00",
            "asgs_code": "EF",
            "rnum": "2",
            "currentPosition": {
              "pos_seq_num": "13082",
              "pos_location_code": "110010001",
              "pos_num_text": "S8888700",
              "pos_grade_code": "00",
              "pos_skill_code": "7090",
              "pos_skill_desc": "LEAVE WITHOUT PAY",
              "pos_org_short_desc": "GTM/LWOP",
              "pos_bureau_short_desc": "GTM",
              "pos_bureau_long_desc": "DIRECTOR GENERAL OF THE FS AND DIRECTOR OF GT",
              "pos_title_desc": "SECRETARY OF STATE",
              "rnum": "3",
              "currentLocation": {
                "gvt_geoloc_cd": "110010001",
                "city": "WASHINGTON",
                "state": "DC",
                "country": "USA",
                "rnum": "1"
              }
            }
          }
        },
        "languages": [
          {
            "rnum": "11",
            "empl_language_code": "FR",
            "empl_language": "French",
            "empl_high_test_date": "2019-09-09T00:00:00-04:00",
            "empl_high_speaking": "2+",
            "empl_high_reading": "3"
          },
          {
            "rnum": "12",
            "empl_language_code": "QB",
            "empl_language": "Spanish",
            "empl_high_test_date": "2013-06-07T00:00:00-04:00",
            "empl_high_speaking": "2",
            "empl_high_reading": "2+"
          }
        ],
        "details": {
          "status": "OC",
          "oc_reason": "Appealing/Grieving Selection Out",
          "oc_bureau": "A",
          "comments": "Must panel or they're fired",
          "date_created": "2021-02-19T09:32:49-05:00",
          "update_date": "2021-02-19T09:32:49-05:00",
          "archived": "1",
          "is_shared": "0",
          "last_editing_user_id": "11262"
        }
      },
      {
        "hru_id": "1215",
        "perdet_seq_num": "533825",
        "cdo_fullname": "SCHIISSLER-PENALOZA,COLBYE-GOSTOF NMN",
        "cdo_last_name": "SCHIISSLER-PENALOZA",
        "cdo_first_name": "COLBYE-GOSTOF",
        "cdo_email": "fjx717578jkcewxokeewa@state.gov",
        "employee": {
          "perdet_seq_num": "533825",
          "per_seq_num": "623277",
          "pert_external_id": "173307",
          "per_last_name": "ANCHONDO",
          "per_first_name": "SHORENI",
          "per_middle_name": "NMN",
          "per_grade_code": "06",
          "per_skill_code": "9017",
          "per_skill_code_desc": "OFFICE MANAGEMENT",
          "per_skill_2_code": "9017",
          "per_skill_2_code_desc": "OFFICE MANAGEMENT",
          "per_pay_plan_code": "FP",
          "per_tenure_code": "01",
          "rnum": "2",
          "currentAssignment": {
            "pos_seq_num": "9078",
            "asg_seq_num": "279413",
            "asgd_revision_num": "2",
            "asgd_eta_date": "2019-08-22T00:00:00-04:00",
            "asgd_etd_ted_date": "2021-08-22T00:00:00-04:00",
            "asgs_code": "EF",
            "rnum": "1",
            "currentPosition": {
              "pos_seq_num": "9078",
              "pos_location_code": "IS4000000",
              "pos_num_text": "56252001",
              "pos_grade_code": "05",
              "pos_skill_code": "9017",
              "pos_skill_desc": "OFFICE MANAGEMENT",
              "pos_org_short_desc": "JERUSALEM",
              "pos_bureau_short_desc": "NEA",
              "pos_bureau_long_desc": "BUREAU NEAR EASTERN AFFAIRS                       ",
              "pos_title_desc": "ADMIN ASSISTANT PRM",
              "pos_language_1_code": "AD",
              "pos_language_1_desc": "Arabic-Modern",
              "pos_position_lang_prof_desc": "Arabic-Modern 0/0",
              "rnum": "1",
              "currentLocation": {
                "gvt_geoloc_cd": "IS4000000",
                "city": "JERUSALEM",
                "country": "ISR",
                "rnum": "2"
              }
            }
          }
        },
        "languages": [{
          "rnum": "13",
          "empl_language_code": "DU",
          "empl_language": "Dutch"
        }],
        "details": {
          "status": "AWOL",
          "oc_reason": "",
          "oc_bureau": "",
          "comments": "Update later",
          "date_created": "2021-02-19T09:55:08-05:00",
          "update_date": "2021-02-19T09:55:08-05:00",
          "archived": "0",
          "is_shared": "1",
          "last_editing_user_id": "11260"
        }
      },
      {
        "hru_id": "4859",
        "perdet_seq_num": "383279",
        "cdo_fullname": "SCHIISSLER-PENALOZA,COLBYE-GOSTOF NMN",
        "cdo_last_name": "SCHIISSLER-PENALOZA",
        "cdo_first_name": "COLBYE-GOSTOF",
        "cdo_email": "fjx717578jkcewxokeewa@state.gov",
        "employee": {
          "perdet_seq_num": "383279",
          "per_seq_num": "26676",
          "pert_external_id": "100275",
          "per_last_name": "MESHBORN",
          "per_first_name": "SIRAANO",
          "per_middle_name": "NMN",
          "per_grade_code": "02",
          "per_skill_code": "5015",
          "per_skill_code_desc": "ECONOMICS",
          "per_pay_plan_code": "FO",
          "per_tenure_code": "01",
          "rnum": "3",
          "classifications": [
            {
              "tp_code": "D",
              "tp_descr_txt": "Differential Bidder",
              "td_id": "149551",
              "disabled_ind": "Y",
              "rnum": "1"
            },
            {
              "tp_code": "D",
              "tp_descr_txt": "Differential Bidder",
              "td_id": "137358",
              "disabled_ind": "Y",
              "rnum": "2"
            }
          ],
          "currentAssignment": {
            "pos_seq_num": "10770",
            "asg_seq_num": "295620",
            "asgd_revision_num": "2",
            "asgd_eta_date": "2020-06-01T00:00:00-04:00",
            "asgd_etd_ted_date": "2021-06-01T00:00:00-04:00",
            "asgs_code": "EF",
            "rnum": "3",
            "currentPosition": {
              "pos_seq_num": "10770",
              "pos_location_code": "110010001",
              "pos_num_text": "S7348001",
              "pos_grade_code": "03",
              "pos_skill_code": "5520",
              "pos_skill_desc": "POLITICAL-MILITARY AFFAIRS",
              "pos_org_short_desc": "PM/PP/RSAT",
              "pos_bureau_short_desc": "PM",
              "pos_bureau_long_desc": "BUREAU OF POLITICAL-MILITARY AFFAIRS",
              "pos_title_desc": "FRAUD INVESTIGATIONS SUPERVISO",
              "rnum": "2",
              "currentLocation": {
                "gvt_geoloc_cd": "110010001",
                "city": "WASHINGTON",
                "state": "DC",
                "country": "USA",
                "rnum": "1"
              }
            }
          }
        },
        "languages": [
          {
            "rnum": "1",
            "empl_language_code": "AD",
            "empl_language": "Arabic-Modern",
            "empl_high_test_date": "2016-06-03T00:00:00-04:00",
            "empl_high_speaking": "3",
            "empl_high_reading": "3"
          },
          {
            "rnum": "2",
            "empl_language_code": "BU",
            "empl_language": "Bulgarian",
            "empl_high_test_date": "1997-10-27T00:00:00-05:00",
            "empl_high_speaking": "3",
            "empl_high_reading": "3"
          },
          {
            "rnum": "3",
            "empl_language_code": "BX",
            "empl_language": "Bosnian",
            "empl_high_test_date": "2006-07-12T00:00:00-04:00",
            "empl_high_speaking": "3+",
            "empl_high_reading": "3+"
          },
          {
            "rnum": "4",
            "empl_language_code": "DU",
            "empl_language": "Dutch",
            "empl_high_test_date": "1992-02-04T00:00:00-05:00",
            "empl_high_speaking": "2",
            "empl_high_reading": "2"
          },
          {
            "rnum": "5",
            "empl_language_code": "FR",
            "empl_language": "French",
            "empl_high_test_date": "1992-02-18T00:00:00-05:00",
            "empl_high_speaking": "4+",
            "empl_high_reading": "3+"
          },
          {
            "rnum": "6",
            "empl_language_code": "GM",
            "empl_language": "German",
            "empl_high_test_date": "2014-09-11T00:00:00-04:00",
            "empl_high_speaking": "2+",
            "empl_high_reading": "3"
          },
          {
            "rnum": "7",
            "empl_language_code": "JT",
            "empl_language": "Italian",
            "empl_high_test_date": "1992-02-10T00:00:00-05:00",
            "empl_high_speaking": "2",
            "empl_high_reading": "2"
          },
          {
            "rnum": "8",
            "empl_language_code": "QB",
            "empl_language": "Spanish",
            "empl_high_test_date": "1994-01-24T00:00:00-05:00",
            "empl_high_speaking": "3+",
            "empl_high_reading": "3+"
          },
          {
            "rnum": "9",
            "empl_language_code": "RU",
            "empl_language": "Russian",
            "empl_high_test_date": "2018-05-10T00:00:00-04:00",
            "empl_high_speaking": "3",
            "empl_high_reading": "3"
          },
          {
            "rnum": "10",
            "empl_language_code": "SY",
            "empl_language": "Swedish",
            "empl_high_test_date": "1992-02-24T00:00:00-05:00",
            "empl_high_speaking": "2",
            "empl_high_reading": "2+"
          }
        ],
        "details": {
          "status": "IT",
          "oc_reason": "OC Reason 3",
          "oc_bureau": "OC Bureau 3",
          "comments": "Test Comment 3",
          "date_created": "2021-02-19T12:21:27-05:00",
          "update_date": "2021-02-19T12:21:27-05:00",
          "archived": "0",
          "is_shared": "0",
          "last_editing_user_id": "11260"
        }
      },
    ];
  if (!isCDO) {
    return fakeData.map(e => _.omit(e, 'details'))
  }
  return fakeData
}

module.exports = { get_available_bidders, get_fake_available_bidders };
