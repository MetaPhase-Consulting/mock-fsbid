const { Employees, AvailablePositions, Bids } = require('../../src/models')

describe('Models - Bids', function() {
  it('should set position status to FP when assignment date is present', async function() {
    const emp = await Employees.query(qb => {
      qb.join('employees_roles', 'employees.perdet_seq_num', 'employees_roles.perdet_seq_num')
      qb.where('employees_roles.code', 'fsofficer')
    }).fetch()
    const ap = await AvailablePositions.query(qb => {
      qb.where('cp_status', 'OP')
    }).fetch()
    const perdet_seq_num = emp.get('perdet_seq_num')
    const cp_id = ap.get('cp_id')
    await Bids.forge(
      {
        perdet_seq_num,
        cp_id,
        assignment_date: new Date().toISOString()
      }
    ).save()

    await ap.refresh()
    ap.get('cp_status').should.equal('FP')
  })
  it('should set position status to HS when bs_cd is A and ubw_hndshk_offrd_flg is Y', async function() {
    const emp = await Employees.query(qb => {
      qb.join('employees_roles', 'employees.perdet_seq_num', 'employees_roles.perdet_seq_num')
      qb.where('employees_roles.code', 'fsofficer')
    }).fetch()
    const ap = await AvailablePositions.query(qb => {
      qb.where('cp_status', 'OP')
    }).fetch()
    const perdet_seq_num = emp.get('perdet_seq_num')
    const cp_id = ap.get('cp_id')
    await Bids.forge(
      {
        bs_cd: 'A',
        perdet_seq_num,
        cp_id,
        ubw_hndshk_offrd_flg: 'Y'
      }
    ).save()

    await ap.refresh()
    ap.get('cp_status').should.equal('HS')
  })
})