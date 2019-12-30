const { chai, server } = global

describe('JWT Middleware', () => {
  describe('/ and /Authorize should not require JWT', (done) => {
    it('/ should return 200', (done) => {
      chai.request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done(err);
        });
      });
    it('/Authorize should return 200', (done) => {
      chai.request(server)
        .get('/Authorize?sAppCircuitID=32')
        .set('tmusrname', 'admin')
        .end((err, res) => {
          res.should.have.status(200);
          done(err);
        });
      });
  });
  describe('Route should require JWT', (done) => {
    it('should return 401 with no JWT', (done) => {
      chai.request(server)
        .get('/bidSeasons')
        .end((err, res) => {
          res.should.have.status(401);
          done(err);
        });
      });
    it('/ should return 200', (done) => {
      chai.request(server)
        .get('/bidSeasons')
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200);
          done(err);
        });
      });
  });
});