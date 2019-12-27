const FUTURE_VACANCIES_KEYS = [
  'fv_seq_num',
  'fv_override_ted_date',
  'bsn_id',
  'bsn_descr_text',
  'position',
  'tod',
  'lang1',
  'lang2',
  'org_code',
  'org_long_desc',
  'org_short_desc',
  'pos_bureau_short_desc',
  'pos_bureau_long_desc',
  'bureau_code',
  'pos_title_desc',
  'pos_location_code',
  'ted',
  "pos_skill_desc",
  'pos_job_category_desc',
  'pos_grade_code',
  'bt_differential_rate_num',
  'bt_danger_pay_num',
  'incumbent',
  'ppos_capsule_descr_txt',
  'ppos_capsule_modify_dt',
  'pos_skill_code',
]

describe('Future Vacancies', () => {
  describe('/futureVacancies', () => {
    it('it should return 200 with correct shape', done => {
      chai.request(server)
        .get('/futureVacancies')
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.Data.forEach(d => {
            d.should.contain.all.keys(FUTURE_VACANCIES_KEYS)
          })
          setTimeout(done, 0);
        });
    });
    it('should return filtered response when filter is provided', done => {
      const langFilter = 'QB'
      const skillFilter = '2010'
      chai.request(server)
        .get(`/futureVacancies?fv_request_params.languages=${langFilter}&fv_request_params.skills=${skillFilter}`)
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.Data.forEach(d => {
            d.should.contain.all.keys(FUTURE_VACANCIES_KEYS)
            d.lang1.should.equal(skillFilter)
            d.pos_skill_code.should.equal(skillFilter)
          })
          setTimeout(done, 0);
        });
    });
    it('should return filtered response when multiple filter values for the same field are provided', done => {
      const langFilter = 'QB'
      const langFilter2 = 'FR'
      chai.request(server)
        .get(`/futureVacancies?fv_request_params.languages=${langFilter}&fv_request_params.languages=${langFilter2}`)
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.Data.forEach(d => {
            d.should.contain.all.keys(FUTURE_VACANCIES_KEYS)
            d.lang1.should.be.oneOf([langFilter, langFilter2])
          })
          setTimeout(done, 0);
        });
    });
  });
  describe('/futureVacanciesCount', () => {
    it('it should return 200 with correct shape', done => {
      setTimeout(done, 0);
      chai.request(server)
        .get('/futureVacanciesCount')
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.Data[0].should.contain.keys(['count(1)'])
        });
    });
  });
});

