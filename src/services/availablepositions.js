const _ = require('lodash')

const { AvailablePositions } = require('../models')
const { createPositionQuery, createTandemPositionQuery, formatLanguage, formatCommuterPost} = require('./common')

const create_query = (query, isCount=false) => createPositionQuery(AvailablePositions, 'availablepositions', 'request_params', query, isCount)
const create_tandem_query = (query, isCount=false, isTandemOne=false) => createTandemPositionQuery(AvailablePositions, 'availablepositions', 'request_params', query, isCount, isTandemOne)

const formatData = (data, isCyclePositions) => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    const omitFields = [
      'capsuledescription',
      'skill',
      'bureau',
      'location',
      'org',
      'bidstats',
      'cycle',
      'commuterpost',
    ]
    if (!isCyclePositions) {
      omitFields.push(
        'last_updated_user',
        'last_updated_date',
        'incumbent_perdet_seq_num'
      )
    }
    return data.map(d => {
      const { cycle, position, bidstats } = d
      const { tod, lang1, lang2, org, location, bureau, skill, capsuledescription } = position
      d.cp_ttl_bidder_qty = bidstats.cp_ttl_bidder_qty
      d.cp_at_grd_qty = bidstats.cp_at_grd_qty
      d.cp_in_cone_qty = bidstats.cp_in_cone_qty
      d.cp_at_grd_in_cone_qty = bidstats.cp_at_grd_in_cone_qty
      d.tod = tod && tod.long_desc
      delete position.tod
      d.lang1 = formatLanguage(lang1)
      delete position.lang1
      d.lang2 = formatLanguage(lang2)
      delete position.lang2
      d.cycle_status = cycle.cycle_status_code
      d.cycle_nm_txt = cycle.cycle_name
      d.org_code = org.code
      d.org_long_desc = org.long_desc
      d.org_short_desc = org.short_desc
      d.location_city = location.location_city
      d.location_state = location.location_state
      d.location_country = location.location_country
      d.us_desc_text = _.get(location, 'unaccompaniedstatus.us_desc_text', '')
      d.pos_bureau_short_desc = bureau.bureau_short_desc
      d.pos_bureau_long_desc = bureau.bureau_long_desc
      d.bureau_code = bureau.bur
      d.pos_skill_desc = skill.skill_descr
      d.pos_skill_code = skill.skl_code
      d.ppos_capsule_descr_txt = capsuledescription.description
      d.ppos_capsule_modify_dt = capsuledescription.last_modified
      // Omit includes an array of fields to be excluded from given 1st arg object
      return _.omit({...d, ...position}, omitFields)
    })
  }
}

const formatTandemData = (data, isTandemOne=false) => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    // Counter for determing commuter posts on identical id positions
    const counter = {}
    return data.map(d => {
      const { cycle, position, bidstats } = d
      const { tod, lang1, lang2, org, location, bureau, skill, capsuledescription, commuterpost } = position
      // Sets up a counter for duplicate cp_ids to determine which commuter post to use
      const cp_id = d.cp_id
      counter.hasOwnProperty(cp_id) ? counter[cp_id] += 1 : counter[cp_id] = 0
      const cpn = formatCommuterPost(commuterpost, counter, d.cp_id)

      d.cp_ttl_bidder_qty = bidstats.cp_ttl_bidder_qty
      d.cp_at_grd_qty = bidstats.cp_at_grd_qty
      d.cp_in_cone_qty = bidstats.cp_in_cone_qty
      d.cp_at_grd_in_cone_qty = bidstats.cp_at_grd_in_cone_qty
      delete d.bidstats
      d.tod = tod && tod.long_desc
      delete position.tod
      d.lang1 = formatLanguage(lang1)
      delete position.lang1
      d.lang2 = formatLanguage(lang2)
      delete position.lang2
      d.cycle_status = cycle.cycle_status_code
      d.cycle_nm_txt = cycle.cycle_name
      d.org_code = org.code
      d.org_long_desc = org.long_desc
      d.org_short_desc = org.short_desc
      d.location_city = location.location_city
      d.location_state = location.location_state
      d.location_country = location.location_country
      d.pos_bureau_short_desc = bureau.bureau_short_desc
      d.pos_bureau_long_desc = bureau.bureau_long_desc
      d.bureau_code = bureau.bur
      d.pos_skill_desc = skill.skill_descr
      d.pos_skill_code = skill.skl_code
      d.ppos_capsule_descr_txt = capsuledescription.description
      d.ppos_capsule_modify_dt = capsuledescription.last_modified
      d.tandem_nbr = isTandemOne ? 1 : 2
      return _.omit({...d, ...cpn, ...position}, 
        [
          'commuterpost',
          'capsuledescription',
          'skill',
          'bureau',
          'location',
          'org',
          'bidstats',
          'cycle'
        ]
      )
    })
  }
}

const RELATED = [
  'bidstats',
  'cycle',
  'position',
  'position.tod',
  'position.lang1',
  'position.lang2',
  'position.org',
  'position.location',
  'position.bureau',
  'position.skill',
  'position.capsuledescription',
  'position.location.unaccompaniedstatus',
  'position.commuterpost'
]

async function get_available_positions(query, isCyclePositions=false) {
  const isCount = query['request_params.count'] === 'true' || query['request_params.totalResults'] === 'true'
  if (isCount && isCyclePositions) {
    return get_available_positions_count(query)
  }
  const data = await create_query(query).fetchPage({
    withRelated: RELATED,
    pageSize: query["request_params.page_size"] || 25,
    page: query["request_params.page_index"] || 1,
    require: false,
    merge: false, 
    remove: false
  })

  return {
    "Data": formatData(data.serialize(), isCyclePositions),
    "usl_id": 44999637,
    "return_code": 0
  }
}

async function get_available_positions_count(query) {
  const count = await create_query(query, true).count()
  return {
    "Data": [
        {
           "count(1)": parseInt(count)
        }
     ],
    "usl_id":  44999615,
    "return_code":  0
  }
}

async function get_available_position_by_id(id) {
  const data = await new AvailablePositions({ cp_id: id })
    .fetch({
      withRelated: RELATED,
      require: false,
    })
  if (data) {
    return formatData(data.serialize())
  }
}

async function get_available_positions_tandem(query) {
  const isCount = query['request_params.count'] === 'true'

  if (isCount) {
    return await get_ap_tandem_count(query, isCount)
  } else {
    const dataTandemOne = await create_tandem_query(query, isCount, true).fetchPage({
      withRelated: RELATED,
      pageSize: query["request_params.page_size"] || 25,
      page: query["request_params.page_index"] || 1,
      require: false,
      merge: false, 
      remove: false
    })
    const dataTandemTwo = await create_tandem_query(query, isCount, false).fetchPage({
      withRelated: RELATED,
      pageSize: query["request_params.page_size"] || 25,
      page: query["request_params.page_index"] || 1,
      require: false,
      merge: false, 
      remove: false
    })
    const data = formatTandemData(dataTandemOne.serialize(), true).concat(formatTandemData(dataTandemTwo.serialize(), false))
    return {
      "Data": data,
      "usl_id": 44999637,
      "return_code": 0
    }
  }
}

async function get_ap_tandem_count(query, isCount) {
  const dataTandemOne = await create_tandem_query(query, isCount, true).count()
  const dataTandemTwo = await create_tandem_query(query, isCount, false).count()
  const combinedCount = parseInt(dataTandemOne) + parseInt(dataTandemTwo)
  return {
    "Data": [{ "cnt": combinedCount }],
    "usl_id": 44999637,
    "return_code": 0
  }
}

module.exports = { get_available_positions, get_available_positions_count, get_available_position_by_id, get_available_positions_tandem }
