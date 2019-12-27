describe('Future Vacancies', () => {
  describe('/futureVacancies', () => {
    it('it should return 200 with correct shape', done => {
      setTimeout(done, 0);
      chai.request(server)
        .get('/futureVacancies')
        .set('jwtauthorization', 'test')
        .end((err, res) => {
          res.should.have.status(200)
          console.log(res.body.Data)
          done(err)
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

          done(err)
        });
      });
  });
});
