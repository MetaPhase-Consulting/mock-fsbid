const { get_postindicators, get_unaccompaniedstatuses } = require('./lookups.js');

const get_postattributes = async query => {
  let data = {
    Data: [],
    usl_id: 0,
    return_code: 0
  }
  // TODO - add other post attribute models
  if (query.codeTableName === 'PostIndicatorTable') {
    data = await get_postindicators();
  } else if (query.codeTableName === 'UnaccompaniedTable') {
    data = await get_unaccompaniedstatuses();
  }
  return data
}

module.exports = { get_postattributes };
