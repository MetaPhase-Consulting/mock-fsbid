const { chai, server } = global

describe('/Authorize', () => {
  it('it should return 401 when no sAppCircuitID param is present', (done) => {
    chai.request(server)
      .get('/Authorize')
      .end((err, res) => {
        res.should.have.status(401);
        done(err);
      });
  });
  it('it should return 403 when no employee is found', (done) => {
    chai.request(server)
      .get('/Authorize?sAppCircuitID=32')
      .set('tmusrname', 'INVALID')
      .end((err, res) => {
        res.should.have.status(403);
        done(err);
      });
  });
  it('it should return 200 and token with valid user', (done) => {
    chai.request(server)
      .get('/Authorize?sAppCircuitID=32')
      .set('tmusrname', 'admin')
      .end((err, res) => {
        res.should.have.status(200);
        done(err);
      });
  });
});