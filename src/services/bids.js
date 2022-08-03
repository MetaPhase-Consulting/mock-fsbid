const { Bids } = require('../models')
const { get_available_position_by_id } = require('./availablepositions')
const { bidNameMapping } = require('./common.js')
const { personSkills, personLanguages } = require('./employees')

const _ = require('lodash');
const dateFns = require('date-fns');

// Enumeration of Statuses for Bids
const BID_STATUSES = {
  DRAFT: { bs_cd: 'W', bs_descr_txt: 'Not Submitted' },
  SUBMITTED: { bs_cd: 'A', bs_descr_txt: 'Active' },
  DELETED: { bs_cd: 'D', bs_descr_txt: 'Deleted' },
  PANELED: { bs_cd: 'P', bs_descr_txt: 'Paneled' },
  CLOSED: { bs_cd: 'C', bs_descr_txt: 'Closed' },
  UNAVAILABLE: { bs_cd: 'U', bs_descr_txt: 'Unavailable' },
}

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  return array.slice((page_number - 1) * page_size, page_number * page_size);
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

async function get_bids_by_cp(query, excludeDraft = false) {
  const cp_id = _.get(query, 'request_params.cp_id');
  console.log(`Trying to get bid for cp_id=${cp_id}`)
  let bids = await Bids
    .where(...(excludeDraft ? ['bs_cd', '<>', 'W'] : ['cp_id', cp_id])) // redundant, but best way I could conditionally insert this where statement
    .where('cp_id', cp_id)
    .fetchAll({ withRelated: [
      'position',
      'position.position.location',
      'position.position.skill',
      'position.cycle',
      'position.bidstats',
      'employee',
      'employee.skills',
      'employee.languages',
      'employee.currentassignment',
      'employee.classifications',
    ], require: false })

  let bids$ = bids.map(bid => formatData(bid.serialize()))
  // fsbid mapping, with some static data
  bids$ = bids$.map((m, i) => {
    let payload = {
      "per_seq_num": null,
      "perdet_seq_num": m.perdet_seq_num,
      "full_name": `${m.per_last_name}, ${m.per_first_name}`,
      "org_short_desc": "ABIDJAN",
      "grade_code": m.per_grade_code,
      "skill_code": m.per_skill_code,
      "skill_desc": m.per_skill_code_desc,
      "language_txt": `${m.per_language_code} ${m.per_language_code_reading_proficiency}/${m.per_language_code_spoken_proficiency} (01/10/2017)`,
      "handshake_code": m.ubw_hndshk_offrd_flg === 'Y' ? "HS" : null,
      "tp_codes_txt": m.per_classifications_tp_codes_txt,
      "tp_descs_txt": m.per_classifications_tp_descs_txt,
      "ubw_submit_dt": m.ubw_submit_dt ? dateFns.format(m.ubw_submit_dt, 'MM/dd/yyyy') : null,
      "ubw_handshake_offered_dt": m.ubw_submit_dt ? dateFns.format(dateFns.add(m.ubw_submit_dt, {weeks: 2}), 'MM/dd/yyyy') : null,
      "ubw_handshake_offered_flag": m.ubw_hndshk_offrd_flg,
      "assignment_status": "EF",
      "TED": m.per_ted,
      "userDetails": {
        "gal_smtp_email_address_text": m.gal_smtp_email_address_text,
        "rnum": `${i + 1}`,
      },
      "employee": {
        "perdet_seq_num": m.perdet_seq_num,
        "per_last_name": m.per_last_name,
        "per_first_name": m.per_first_name,
        "per_middle_name": m.per_middle_name || 'NMN',
        "per_suffix_name": m.per_suffix_name || undefined,
        "rnum": `${i + 1}`,
      }
    };
    if(m.ubw_hndshk_offrd_flg === "N") {
      payload = _.omit(payload, ['handshake_offered_dt']);
    }
    return payload;
  });
  let orderBy = _.get(query, 'request_params.order_by', '');
  orderBy = orderBy.split(' ');
  if (orderBy) {
    bids$ = _.orderBy(bids$, orderBy[0], orderBy[1]);
  }

  let handshake_code = _.get(query, 'request_params.handshake_code');
  if (handshake_code) {
    let handshake_code$ = handshake_code;
    if (handshake_code$ === 'OP') {
      handshake_code$ = null;
    }
    bids$ = _.filter(bids$, f => f.handshake_code === handshake_code$);
  }

  const pageSize = _.get(query, 'request_params.page_size');
  const pageIndex = _.get(query, 'request_params.page_index');
  if (pageSize && pageIndex) {
    bids$ = paginate(bids$, pageSize, pageIndex);
  }

  return {
    Data: bids$,
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

async function v2_get_bids(filsCols, query) {
  try {
    //mock currently has no concept of hscode, so intentionally wrongly mapping and filtering to/by ubw_hndshk_offrd_flg

    const perdet_seq_num = _.get(_.find(filsCols.filters, ['name', 'perdet_seq_num']), 'value')

    let bids = await Bids.query(qb => {
      if(perdet_seq_num) {
        qb.where('perdet_seq_num', perdet_seq_num)
        qb.where('ubw_hndshk_offrd_flg', 'Y')
      }
    }).fetchPage({
      withRelated: [
        'position',
        'position.cycle',
        'position.position.org',
      ],
      require: false,
      pageSize: query['rp.pageRows'] || 100,
      page: query['rp.pageNum'] || 1,
    })
    bids = bids.serialize()

    //format data
    bids = bids.map(b => {
      let b$ = {
        ...b.position.position,
        'ubwhscode': 'HS',
        'perdet_seq_num': b['perdet_seq_num']
      }
      b$['position_info'] = {
        posseqnum: _.get(b$, 'pos_seq_num'),
        posorgshortdesc: _.get(b$, 'org.short_desc'),  
        posnumtext: _.get(b$, 'position'),
        posgradecode: _.get(b$, 'pos_grade_code'),
        postitledesc: _.get(b$, 'pos_title_desc'),
      }
      b$ = _.pick(b$, ['ubwhscode', 'pos_seq_num', 'position', 'pos_title_desc', 'org.short_desc', 'perdet_seq_num', 'position_info'])
      b$['short_desc'] = _.get(b$, 'org.short_desc')
      return _.omit(b$, 'org')
    })

    bids = bids.map(b => {
      return _.mapKeys(b, function(value, key) {
        return bidNameMapping(key, true);
      })
    })

    const setCols = [
      'ubwhscode',
      'cpposseqnum',
      'posnumtext',
      'posorgshortdesc',
      'postitledesc',
      'position'  
    ];
      
    const colsToPick = _.union(setCols,  filsCols['columns'])

    bids = bids.map(pd => _.pick(pd, colsToPick))

    return bids
  } catch (Error) {
    console.error(Error)
    return null
  }

}

// calculate the delete_ind value
const get_delete_ind = id => (
  {
    delete_ind: 'Y'
  }
)
// Whether or not a CDO bid on the position
const get_cdo_bid = data => ( !data.cdo_bid || data.cdo_bid === 'N' ? { cdo_bid: 'N' } : { cdo_bid: 'Y' } )

const formatData = (data, isCDO = true) => {
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
    const skills = _.get(data, 'employee.skills');
    const languages = _.get(data, 'employee.languages');
    const classifications = _.get(data, 'employee.classifications');
    let employeeProps = {
      per_first_name: _.get(data, 'employee.first_name'),
      per_last_name: _.get(data, 'employee.last_name'),
      per_suffix_name: _.get(data, 'employee.suffix_name') || undefined,
      gal_smtp_email_address_text: _.get(data, 'employee.email'),
      per_grade_code: _.get(data, 'employee.grade_code'),
      per_grade_code: _.get(data, 'employee.grade_code'),
      per_ted: _.get(data, 'employee.currentassignment.etd_ted_date'),
      per_classifications_tp_codes_txt: _.get(data, 'employee.classifications', []).map(m => m.tp_code).join(''),
      per_classifications_tp_descs_txt: _.get(data, 'employee.classifications', []).map(m => m.tp_descr_txt).join('; '),
    }
    if (skills) {
      employeeProps = {
        ...employeeProps,
        ...personSkills(skills),
      }
    }
    if (languages) {
      employeeProps = {
        ...employeeProps,
        ...personLanguages(languages),
      }
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
      ...get_cdo_bid(data),
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

async function submit_bid(query, isCDO = false) {
  let cdo_bid = 'N';
  if (isCDO) { cdo_bid = 'Y' };
  return await update_bid(
    query,
    {
      ...BID_STATUSES.SUBMITTED,
      handshake_allowed_ind: 'Y',
      ubw_submit_dt: new Date().toISOString(),
      cdo_bid,
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

module.exports = { get_bids, get_bids_by_cp, add_bid, submit_bid, remove_bid, offer_handshake, panel_bid, assign_bid, register_bid, unregister_bid, v2_get_bids }
