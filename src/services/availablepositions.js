const { AvailablePositions } = require('../models')
const { createPositionQuery, createTandemPositionQuery, formatLanguage} = require('./common')

const create_query = (query, isCount=false) => createPositionQuery(AvailablePositions, 'availablepositions', 'request_params', query, isCount)
const create_tandem_query = (query, isCount=false, isTandemOne=false) => createTandemPositionQuery(AvailablePositions, 'availablepositions', 'request_params', query, isCount, isTandemOne)

const formatData = data => {
  if (data) {
    if (!Array.isArray(data)) {
      data = [data]
    }
    return data.map(d => {
      const { cycle, position, bidstats } = d
      const { tod, lang1, lang2, org, location, bureau, skill, capsuledescription } = position
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
      delete d.cycle
      d.org_code = org.code
      d.org_long_desc = org.long_desc
      d.org_short_desc = org.short_desc
      delete position.org
      d.location_city = location.location_city
      d.location_state = location.location_state
      d.location_country = location.location_country
      delete position.location
      d.pos_bureau_short_desc = bureau.bureau_short_desc
      d.pos_bureau_long_desc = bureau.bureau_long_desc
      d.bureau_code = bureau.bur
      delete position.bureau
      d.pos_skill_desc = skill.skill_descr
      d.pos_skill_code = skill.skl_code
      delete position.skill
      d.ppos_capsule_descr_txt = capsuledescription.description
      d.ppos_capsule_modify_dt = capsuledescription.last_modified
      delete position.capsuledescription
      return { ...d, ...position }
    })
  }
}

const formatTandemData = (data, isTandemOne=false) => {
  if (data) {
    console.log(data)
    if (!Array.isArray(data)) {
      data = [data]
    }
    return data.map(d => {
      const { cycle, position, bidstats } = d
      const { tod, lang1, lang2, org, location, bureau, skill, capsuledescription } = position
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
      delete d.cycle
      d.org_code = org.code
      d.org_long_desc = org.long_desc
      d.org_short_desc = org.short_desc
      delete position.org
      d.location_city = location.location_city
      d.location_state = location.location_state
      d.location_country = location.location_country
      delete position.location
      d.pos_bureau_short_desc = bureau.bureau_short_desc
      d.pos_bureau_long_desc = bureau.bureau_long_desc
      d.bureau_code = bureau.bur
      delete position.bureau
      d.pos_skill_desc = skill.skill_descr
      d.pos_skill_code = skill.skl_code
      delete position.skill
      d.ppos_capsule_descr_txt = capsuledescription.description
      d.ppos_capsule_modify_dt = capsuledescription.last_modified
      delete position.capsuledescription
      d.tandem_nbr = isTandemOne ? 1 : 2
      return { ...d, ...position }
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
]

async function get_available_positions(query) {
  const data = await create_query(query).fetchPage({
    withRelated: RELATED,
    pageSize: query["request_params.page_size"] || 25,
    page: query["request_params.page_index"] || 1,
    require: false,
  })

  return {
    "Data": formatData(data.serialize()),
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
  const dataTandemOne = await create_tandem_query(query, false, true).fetchPage({
    withRelated: RELATED,
    pageSize: query["request_params.page_size"] || 25,
    page: query["request_params.page_index"] || 1,
    require: false,
  })

  const dataTandemTwo = await create_tandem_query(query, false, false).fetchPage({
    withRelated: RELATED,
    pageSize: query["request_params.page_size"] || 25,
    page: query["request_params.page_index"] || 1,
    require: false,
  })

  return {
    "Data": formatTandemData(dataTandemOne.serialize(), true).concat(formatTandemData(dataTandemTwo.serialize(), false)),
    "usl_id": 44999637,
    "return_code": 0
  }
}

module.exports = { get_available_positions, get_available_positions_count, get_available_position_by_id, get_available_positions_tandem }
