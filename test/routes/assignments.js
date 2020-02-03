
const ASSIGNMENTS_KEYS = [
  'asg_seq_num',
  'asg_create_date',
  'asg_update_date',
  'pos_seq_num'
]

describe('Assignments', () => {
  describe('/Assignments', () => {
    it('should return 200 with correct shape', done => {
      chai.request(server)
        .get('/assignments')
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          res.body.Data.forEach(d => {
            d.should.contain.all.keys(ASSIGNMENTS_KEYS)
          })
          setTimeout(done, 0);
        });
    });
  });
});