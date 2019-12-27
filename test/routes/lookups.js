const { chai, server } = global

const BID_SEASONS_KEYS = [
  'bsn_id', 
  'bsn_create_date', 
  'bsn_create_id', 
  'bsn_descr_text', 
  'bsn_end_date', 
  'bsn_future_vacancy_ind', 
  'bsn_panel_cutoff_date',
  'bsn_start_date',
  'bsn_update_date',
  'bsn_update_id',
  'snt_seq_num',
]

const CYCLES_KEYS = [
  'cycle_id',
  'cycle_name',
  'cycle_status_code',
]

const GRADES_KEYS = [
  'grade_code',
]

const LANGUAGES_KEYS = [
  'language_code',
  'language_long_desc',
  'language_short_desc',
]

const DANGER_PAYS_KEYS = [
  'pay_percent_num',
  'pay_percentage_text',
]

const DIFF_RATES_KEYS = [
  'pay_percent_num',
  'pay_percentage_text',
]

const TOD_KEYS = [
  'code',
  'long_desc',
]

const BUREAUS_KEYS = [
  'bur',
  'bureau_long_desc',
  'bureau_short_desc',
  'isregional',
]

const SKILLS_KEYS = [
  'jc_id',
  'jc_nm_txt',
  'skill_descr',
  'skl_code',
]

const LOCATIONS_KEYS = [
  'is_domestic',
  'location_city',
  'location_code',
  'location_country',
  'location_state',
]

// Map routes to expected keys
const routes = [
  { 'path': '/bidSeasons', keys: BID_SEASONS_KEYS },
  { 'path': '/cycles', keys: CYCLES_KEYS },
  { 'path': '/grades', keys: GRADES_KEYS },
  { 'path': '/languages', keys: LANGUAGES_KEYS },
  { 'path': '/dangerpays', keys: DANGER_PAYS_KEYS },
  { 'path': '/differentialrates', keys: DIFF_RATES_KEYS },
  { 'path': '/tourofduties', keys: TOD_KEYS },
  { 'path': '/bureaus', keys: BUREAUS_KEYS },
  { 'path': '/skillCodes', keys: SKILLS_KEYS },
  { 'path': '/Locations', keys: LOCATIONS_KEYS },
]

/*
  Verify the route and data shape returned matches expected
  @param path - The path to the route
  @param keys - The expected keys to compare with the response
  @param cb   - Callback function
*/
const verify = (path, keys, cb) => {
  chai.request(server)
    .get(path)
    .set('jwtauthorization', 'test')
    .end((err, res) => {
      res.should.have.status(200)
      var data = res.body.Data
      if (!Array.isArray(data)) {
        data = [data]
      }
      data.map(d => {
        d.should.contain.keys(keys)
      })
      res.body.return_code.should.eq(0)
      cb(err)
    })
}

describe('Lookups', () => {
  routes.forEach(({path, keys}) => {
    describe(`${path}`, () => {
      it('it should return 200 with correct shape', done => verify(path, keys, done)); 
    })  
  })
});

