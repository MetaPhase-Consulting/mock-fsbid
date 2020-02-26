
const BIDS_KEYS = [

]

const getBidAndVerifyShape = (cp_id, perdet_seq_num, done) => {
  chai.request(server)
    .get(`/bids?cp_id=${cp_id}&perdet_seq_num=${perdet_seq_num}`)
    .set('jwtauthorization', 'test')
    .end((err, res) => {
      res.should.have.status(200)
      res.body.Data.forEach(d => {
        d.should.contain.all.keys(BIDS_KEYS)
      })
      setTimeout(done, 0);
    });
}
describe('Bids', () => {
  describe('GET /bids', () => {
    it('should return 200 with correct shape', done => {
      const cp_id = 1
      const perdet_seq_num = 1
      getBidAndVerifyShape(cp_id, perdet_seq_num, done)
    });
  });
  describe('POST /bids', () => {
    it('should add bid for user', done => {
      const cp_id = 1
      const perdet_seq_num = 2
      chai.request(server)
        .post(`/bids`)
        .set('jwtauthorization', 'test')
        .send({ perdet_seq_num, cp_id })
        .end((err, res) => {
          res.should.have.status(200)
          getBidAndVerifyShape(cp_id, perdet_seq_num, done)
        });
    })
  })
  describe('PUT /bids', () => {
    it('should submit bid for user', done => {
      const cp_id = 1
      const perdet_seq_num = 2
      chai.request(server)
        .put(`/bids`)
        .set('jwtauthorization', 'test')
        .send({ perdet_seq_num, cp_id })
        .end((err, res) => {
          res.should.have.status(200)
          getBidAndVerifyShape(cp_id, perdet_seq_num, done)
        });
    })
  })
  describe('DELETE /bids', () => {
    it('should remove bid for user', done => {
      const cp_id = 1
      const perdet_seq_num = 2
      chai.request(server)
        .delete(`/bids?cp_id=${cp_id}&perdet_seq_num=${perdet_seq_num}`)
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          getBidAndVerifyShape(cp_id, perdet_seq_num, done)
        });
    })
  })
});