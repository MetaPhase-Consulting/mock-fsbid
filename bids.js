const { employees, get_employee_by_ad_id, get_employee_by_perdet_seq_num} = require('./employees')

const positions = [
  { name: 'Position 1', pos_seq_num: '1'},
  { name: 'Position 2', pos_seq_num: '2'},
]

const cycles = [
  { id: 1, status: 'A', postViewable: 'Y', description: 'Cycle 1' },
]

const STATUS_CODES = ['W', 'A']
const HANDSHAKE_CODES = ['N']

const cyclePositions = [
  { cp_id: 1, pos_seq_num: positions[0].pos_seq_num, status: STATUS_CODES[0], totalBidders: 0, atGradeBidders: 0, inConeBidders: 0, inBothBidders: 0 },
  { cp_id: 2, pos_seq_num: positions[1].pos_seq_num, status: STATUS_CODES[0], totalBidders: 0, atGradeBidders: 0, inConeBidders: 0, inBothBidders: 0 },
]
const date = new Date()
const submittedDate = `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`

const bids = [
  {
    statusCode: STATUS_CODES[0],
    handshakeCode: HANDSHAKE_CODES[0],
    employee: employees[0],
    cycle: cycles[0],
    cyclePosition: cyclePositions[0],
    submittedDate
  },
  {
    statusCode: STATUS_CODES[0],
    handshakeCode: HANDSHAKE_CODES[0],
    employee: employees[0],
    cycle: cycles[0],
    cyclePosition: cyclePositions[1],
    submittedDate
  },
  {
    statusCode: STATUS_CODES[0],
    handshakeCode: HANDSHAKE_CODES[0],
    employee: employees[1],
    cycle: cycles[0],
    cyclePosition: cyclePositions[0],
    submittedDate
  },
  {
    statusCode: STATUS_CODES[1],
    handshakeCode: HANDSHAKE_CODES[0],
    employee: employees[1],
    cycle: cycles[0],
    cyclePosition: cyclePositions[1],
    submittedDate
  },
];

function get_position(pos_seq_num) {
  let position = positions.filter(p => p.pos_seq_num == pos_seq_num)[0]
  if (!position) {
    position = {
      name: `Position ${pos_seq_num}`,
      pos_seq_num,
    }
    positions.push(position)
  }
  return position
}

function get_cycle_position(cp_id) {
  let cycle_position = cyclePositions.filter(cp => cp.cp_id == cp_id)[0]
  if (!cycle_position) {
    throw `No position match for ${cp_id}`
  }
  return cycle_position
}

function get_bids(query) {
  const { perdet_seq_num } = query
  return bids.filter(bid => {
    return bid.employee.perdet_seq_num == perdet_seq_num
  });
}

function add_bid(data) {
  const { cp_id, perdet_seq_num, status } = data
  const date = new Date()
  bids.push({
    id: bids.length,
    statusCode: status || STATUS_CODES[0],
    handshakeCode: HANDSHAKE_CODES[0],
    employee: get_employee_by_perdet_seq_num(perdet_seq_num),
    cycle: cycles[0],
    cyclePosition: get_cycle_position(cp_id),
    submittedDate: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
  });
  return get_bids({perdet_seq_num})
}

function remove_bid(query) {
  const { perdet_seq_num, cp_id } = query
  for (var i = bids.length - 1; i >= 0; --i) {
    if (bids[i].employee.perdet_seq_num == perdet_seq_num && bids[i].cyclePosition.cp_id == cp_id) {
        bids.splice(i,1);
    }
  }
  return get_bids({perdet_seq_num})
}

module.exports = { get_bids, add_bid, remove_bid }