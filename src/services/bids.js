const { Bids } = require('../models')
const { get_available_position_by_id } = require('./availablepositions')

const _ = require('lodash');

// Enumeration of Statuses for Bids
const BID_STATUSES = {
  DRAFT: { bs_cd: 'W', bs_descr_txt: 'Not Submitted' },
  SUBMITTED: { bs_cd: 'A', bs_descr_txt: 'Active' },
  DELETED: { bs_cd: 'D', bs_descr_txt: 'Deleted' },
  PANELED: { bs_cd: 'P', bs_descr_txt: 'Paneled' },
  CLOSED: { bs_cd: 'C', bs_descr_txt: 'Closed' },
  UNAVAILABLE: { bs_cd: 'U', bs_descr_txt: 'Unavailable' },
}

async function get_bid(cp_id, perdet_seq_num) {
  console.log(`Trying to get bid for cp_id=${cp_id} and perdet_seq_num=${perdet_seq_num}`)
  const bid = await Bids
    .where('cp_id', cp_id)
    .where('perdet_seq_num', perdet_seq_num)
    .fetch({ withRelated: ['position', 'position.cycle'], require: false })
  if (bid) {
    return bid
  } else {
    console.log(`No bid on cp_id=${cp_id} for perdet_seq_num=${perdet_seq_num}`)
  }
}

async function get_bids_by_cp(query) {
  const cp_id = _.get(query, 'cp_id');
  console.log(`Trying to get bid for cp_id=${cp_id}`)
  const bids = await Bids
    .where('cp_id', cp_id)
    .fetchAll({ withRelated: [
      'position',
      'position.position.location',
      'position.position.skill',
      'position.cycle',
      'position.bidstats',
      'employee',
    ], require: false })

  return {
    Data: bids.map(bid => formatData(bid.serialize())),
    usl_id: 0,
    return_code: 0
  }
}

async function get_bids(query, isCDO) {
  const { perdet_seq_num } = query
  const bids = await Bids.where('perdet_seq_num', perdet_seq_num).fetchAll({
    withRelated: [
      'position',
      'position.position.location',
      'position.position.skill',
      'position.cycle',
      'position.bidstats'
    ],
    require: false,
  })

  return {
    Data: bids.map(bid => formatData(bid.serialize(), isCDO)),
    usl_id: 0,
    return_code: 0
  }
}
// calculate the delete_ind value
const get_delete_ind = id => (
  {
    delete_ind: 'Y'
  }
)
// Whether or not a CDO bid on the position
const get_cdo_bid = id => ( { cdo_bid: 'N' } )

const formatData = (data, isCDO = true) => {s
  if (data && data.position) {
    const { cycle, bidstats } = data.position
    const { pos_seq_num, pos_title_desc:ptitle, position:pos_num_text, pos_skill_code, pos_skill_desc, pos_grade_code, location, skill } = data.position.position
    if (location) {
      delete location.is_domestic;
      delete location.location_code;
    }
    const position = {
      pos_seq_num, ptitle, pos_skill_code: _.get(skill, 'skl_code'), pos_skill_desc: _.get(skill, 'skill_descr'), pos_grade_code, pos_num_text
    }
    if (!isCDO) {
      data.handshake_allowed_ind = null;
    };
    if (isCDO && !data.handshake_allowed_ind) {
      data.handshake_allowed_ind = 'N';
    };
    let employeeProps = {
      per_first_name: _.get(data, 'employee.first_name'),
      per_last_name: _.get(data, 'employee.last_name'),
    }
    employeeProps = _.pickBy(employeeProps, _.identity);
    delete data.employee;
    delete data.position;
    return {
      ...data,
      ...position,
      ...location,
      cycle_nm_txt:cycle.cycle_name,
      ...bidstats,
      ...get_delete_ind(data.id),
      ...get_cdo_bid(data.id),
      ...employeeProps,
    }
  }
}

async function add_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  const ap = await get_available_position_by_id(cp_id)
  let return_code = 0
  if (!ap) {
    throw Error(`No ap with cp_id = ${cp_id} was found`)
  }

  const bid = await get_bid(cp_id, perdet_seq_num)
  if (bid && bid.attributes.bs_cd === 'D') {
    console.log(`Updating deleted bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
    try {
      await bid.save(
        {
          ...BID_STATUSES.DRAFT,
          ubw_submit_dt: null,
        }
      )
    } catch (Error) {
      return_code = -1
      console.log(`An error occurred adding the bid... ${Error}`)
    }
  } else {
    console.log(`Adding bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
    await Bids.forge(
      {
        perdet_seq_num,
        cp_id,
      }
    ).save()
  }
  return { Data: null, usl_id: 45066084, return_code }
}

async function submit_bid(query) {
  return await update_bid(
    query,
    {
      ...BID_STATUSES.SUBMITTED,
      handshake_allowed_ind: 'Y',
      ubw_submit_dt: new Date().toISOString(),
    }
  )
}

async function register_bid(query) {
  const bid = await get_bid(query.cp_id, query.perdet_seq_num)
  if (bid && bid.attributes.bs_cd === 'A' && bid.attributes.handshake_allowed_ind === 'Y') {
    return await update_bid(
      { ..._.pick(query, ['perdet_seq_num', 'cp_id'] ) },
      {
        ubw_hndshk_offrd_flg: 'Y',
      }
    )
  } else {
    return { Data: null, usl_id: 4000001, return_code: -2 }
  }
}

async function unregister_bid(query) {
  const bid = await get_bid(query.cp_id, query.perdet_seq_num)
  if (bid && bid.attributes.bs_cd === 'A' && bid.attributes.handshake_allowed_ind === 'Y') {
    return await update_bid(
      { ..._.pick(query, ['perdet_seq_num', 'cp_id'] ) },
      {
        ubw_hndshk_offrd_flg: 'N',
      }
    )
  } else {
    return { Data: null, usl_id: 4000031, return_code: -2 }
  }
}

async function remove_bid(query) {
  return await update_bid(
    query,
    {
      ...BID_STATUSES.DELETED,
      ubw_submit_dt: new Date().toISOString(),
    }
  )
}

async function offer_handshake(query) {
  return await update_bid(
    query,
    {
      // This will need to be updated, as it describes what takes place in a "register bid"
      ubw_hndshk_offrd_flg: 'Y',
      ubw_hndshk_offrd_dt: new Date().toISOString(),
    }
  )
}

async function panel_bid(query) {
  return await update_bid(
    query,
    {
      ...BID_STATUSES.PANELED
    }
  )
}

async function assign_bid(query) {
  return await update_bid(
    query,
    {
      assignment_date: new Date().toISOString(),
    }
  )
}

// Helper to update the bid on all the actions taken
async function update_bid(query, data) {
  const { cp_id, ad_id, perdet_seq_num } = query
  // The error code, returned if no bid could be found
  let return_code = -1
  const bid = await get_bid(cp_id, perdet_seq_num)
  if (bid) {
    console.log(`Updating bid on ${cp_id} for ${perdet_seq_num} by ${ad_id} with data ${data}`)
    try {
      await bid.save(
        {
          ...data
        }
      )
      return_code = 0
    } catch (Error) {
      console.log(`An error occurred updating the bid... ${Error}`)
    }
  }
  // Even if the bid doesn't exist, it succeeds
  return { Data: null, usl_id: 45066084, return_code }
}

module.exports = { get_bids, get_bids_by_cp, add_bid, submit_bid, remove_bid, offer_handshake, panel_bid, assign_bid, register_bid, unregister_bid }
