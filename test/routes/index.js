const { chai, server } = global

describe('/', () => {
  it('it should return 200', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        done(err);
      });
  });
});