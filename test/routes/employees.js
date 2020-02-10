
const AGENTS_KEYS = [
  'first_name',
  'last_name',
  'middle_name',
  'fullname',
  'bids',
  'classifications',
  'currentassignment',
  'email',
  'hru_id',
  'per_seq_num',
  'prefix_name',
  'hs_cd',
  'rolecode',
  'rl_descr_txt'
]

const CDO_CLIENTS_KEYS = [
  "rnum",
  "perdet_seq_num",
  "rl_cd",
  'rnum', 
  "employee.currentAssignment.asgd_eta_date",
  "employee.currentAssignment.asgd_etd_ted_date",
  "employee.currentAssignment.asgd_revision_num",
  "employee.currentAssignment.currentPosition.currentLocation.city",
  "employee.currentAssignment.currentPosition.currentLocation.country",
  "employee.currentAssignment.currentPosition.currentLocation.gvt_geoloc_cd",
  "employee.currentAssignment.currentPosition.pos_bureau_long_desc",
  "employee.currentAssignment.currentPosition.pos_bureau_short_desc",
  "employee.currentAssignment.currentPosition.pos_grade_code",
  "employee.currentAssignment.currentPosition.pos_location_code",
  "employee.currentAssignment.currentPosition.pos_num_text",
  "employee.currentAssignment.currentPosition.pos_seq_num",
  "employee.currentAssignment.currentPosition.pos_skill_code",
  "employee.currentAssignment.currentPosition.pos_skill_desc",
  "employee.currentAssignment.currentPosition.pos_title_desc",
  "employee.currentAssignment.pos_seq_num",
  "employee.per_first_name",
  "employee.per_grade_code",
  "employee.per_last_name",
  "employee.per_middle_name",
  "employee.per_pay_plan_code",
  "employee.per_skill_code",
  "employee.per_skill_code_desc",
  "employee.per_tenure_code",
  "employee.pert_external_id",
]

describe('Employees', () => {
  describe('/Agents', () => {
    it('should return 200 with correct shape', done => {
      chai.request(server)
        .get('/Agents')
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.Data.forEach(d => {
            d.should.contain.all.keys(AGENTS_KEYS)
          })
          setTimeout(done, 0);
        });
    });
  });
  describe('/CDOClients', () => {
    it('should return 200 with correct shape', done => {
      chai.request(server)
        .get('/CDOClients')
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.Data.forEach(d => {
            flattenObject(d).should.contain.all.keys(CDO_CLIENTS_KEYS)
          })
          setTimeout(done, 0);
        });
    });
  });
});