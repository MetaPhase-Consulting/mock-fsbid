const { Bids } = require('../models')
const { get_available_position_by_id } = require('./availablepositions')

async function get_bid(cp_id, perdet_seq_num) {
  console.log(`Trying to get bid for cp_id=${cp_id} and perdet_seq_num=${perdet_seq_num}`)
  const bid = await Bids
    .where('cp_id', cp_id)
    .where('perdet_seq_num', perdet_seq_num)
    .fetch({ withRelated: ['position'], require: false })
  if (bid) {
    return bid
  } else {
    console.log(`No bid on cp_id=${cp_id} for perdet_seq_num=${perdet_seq_num}`)
  }
}

async function get_bids(query) {
  const { perdet_seq_num } = query
  const bids = await Bids.where('perdet_seq_num', perdet_seq_num).fetchAll({
    withRelated: ['position'],
    require: false,
  })

  return bids.map(bid => formatData(bid.serialize()))
}
// get the bid stats
const get_bid_stats = id => (
  {
    cp_ttl_bidder_qty: 0,
    cp_at_grd_qty: 0,
    cp_in_cone_qty: 0,
    cp_at_grd_in_cone_qty: 0,
  }
)
// calculate the delete_id value
const get_delete_id = id => (
  {
    delete_id: true
  }
)

const formatData = data => {
  if (data && data.position) {
    const { cycle_nm_txt, pos_title_desc:ptitle, pos_skill_code, pos_skill_desc, pos_grade_code } = data.position
    delete data.position
    const position = {
      cycle_nm_txt, ptitle, pos_skill_code, pos_skill_desc, pos_grade_code
    }
    return { ...data, ...position, ...get_bid_stats(data.id), ...get_delete_id(data.id) }
  }
}

async function add_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  const ap = await get_available_position_by_id(cp_id)
  if (!ap) {
    throw Error(`No ap with cp_id = ${cp_id} was found`)
  }
  // Cannot bid on the same position more than once
  if (!await get_bid(cp_id, perdet_seq_num)) {
    console.log(`Adding bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
    await Bids.forge(
      {
        perdet_seq_num,
        cp_id,
      }
    ).save()
  }
  return { Data: null, usl_id: 45066084, return_code: 0 }
}

async function submit_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  const bid = await get_bid(cp_id, perdet_seq_num)
  if (bid) {
    console.log(`Submitting bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
    await bid.save(
      {
        bs_cd: 'A',
        bs_descr_txt: 'Active',
        ubw_submit_dt: new Date().toISOString(),
      }
    )
  } else {
    console.log(`No bid on ${cp_id} for ${perdet_seq_num} was found`)
  }
  return { Data: null, usl_id: 45066084, return_code: 0 } 
}

async function remove_bid(query) {
  const { cp_id, ad_id, perdet_seq_num } = query
  // The error code, returned if no bid could be found
  let return_code = -1
  const bid = await get_bid(cp_id, perdet_seq_num)
  if (bid) {
    console.log(`Removing bid on ${cp_id} for ${perdet_seq_num} by ${ad_id}`)
    try {
      await new Bids({id: bid.id}).destroy()
      return_code = 0
    } catch (Error) {
      console.log(`An error occurred removing the bid... ${Error}`)
    }
  }
  // Even if the bid doesn't exist, it succeeds
  return { Data: null, usl_id: 45066084, return_code }
}

module.exports = { get_bids, add_bid, submit_bid, remove_bid }