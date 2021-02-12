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

module.exports = { get_available_bidders };
