const fs = require('fs')
const readJson = path => JSON.parse(fs.readFileSync(require.resolve(path)))

// Mapping of sort params (keys) to field to sort on (value)
const sortFieldMapping = {
  "pos_num_text": 'position',
}
const sortList = (list, sort, customSortFieldMapping = {}) => {
  const results = list
  const fieldMapping = { ...sortFieldMapping, ...customSortFieldMapping}
  if (sort) {
    // pull off the asc/desc
    let [field, direction] = sort.split(' ');
    const dirVal = direction && direction === 'asc' ? -1 : 1
    if (fieldMapping[field]) {
      field = fieldMapping[field]
    }
    results.sort(function(a, b) {
      var x = `${a[field]}`.toLowerCase();
      var y = `${b[field]}`.toLowerCase();
      if (x < y) {return dirVal;}
      if (x > y) {return -dirVal;}
      return 0;
    });
  }
  return results
}
// Paginates the list
const paginateList = (list, page = 1, limit = 25) => list.slice((page - 1) * limit, (page) * limit);

// TOD filter mappings
const TODS = [
  {code: "O", value: "1 YR ( 2 R & R)"},
  {code: "1", value: "1 YR (3 R & R)"},
  {code: "D", value: "2 YRS (1 R & R )"},
  {code: "Q", value: "2 YRS (4 R & R)"},
  {code: "E", value: "2 YRS/TRANSFER"},
  {code: "F", value: "2 YRS (2 R & R)"},
  {code: "R", value: "2 YRS (3R&R)"},
  {code: "I", value: "3 YRS ( 2 R & R )"},
  {code: "J", value: "3 YRS/TRANSFER"},
];

// Custom filter function for TOD
const todFilter = (filter, field, item) => customFilter(TODS, filter, field, item)

// Language filter mappings
const LANGUAGES = [
  {code: "QB", value: "Spanish(QB) 3/3"},
  {code: "FR", value: "French(FR) 1/1"},
  {code: "NONE", value: "null"},
]

// Custom filter function for Languages
const languageFilter = (filter, field, item) => customFilter(LANGUAGES, filter, field, item)

const OVERSEAS = [
  { code: "O", value: "" },
  { code: "D", value: "110010001" }
]
// Custom filter function for overseas positions
const overseasFilter = (filter, field, item) => customFilter(OVERSEAS, filter, field, item)


/* 
  Custom filter since we show the value but filter on the code
  mapping - the mapping of code to value
  filter - The filter value(s).
  field - the field on the FILTERS mapping
  item - The items to check for the presence of the filter
*/
const customFilter = (mapping, filter, field, item) => {
  const filters = mapping.filter(i => filter.includes(i.code)).map(i => i.value)
  if (item[field] !== undefined && filters.includes(`${item[field]}`)) {
    return true;
  }
  return false;
}

const freeTextFilter = (filter, field, item) => {
  return item[field] !== undefined && filter.map(i => i.toLowerCase()).some(i => `${item[field]}`.toLowerCase().indexOf(i) > -1)
}
/*
  Filters the list
  list - the list to filter
  FILTERS - the filters mapping (request_param: { fiield: <field to apply value to>, filter: <function for custom filtering> })
  query - the request query
*/ 
const filterList = (list, FILTERS, query) => {
  return list.filter(item => {
    let found = false
    let noFilters = true
    for (let key in query) {
      const fields = FILTERS[key] ? FILTERS[key].field : null
      // Ignore fields not in filter list (like pagination)
      if (fields && query[key]) {
        noFilters = false
        const field = Array.isArray(fields) ? fields : [fields]
        for (let index = 0; index < field.length; index++) {
          const element = field[index];
          const filters = Array.isArray(query[key]) ? query[key] : query[key].split(',')
          console.log(`Search on ${element} with filters ${filters}`)
          // Check to see if there is a filter function
          const customFilter = FILTERS[key].filter
          if (customFilter) {
            found = found || customFilter(filters, element, item)
          } else {
            if (item[element] !== undefined && filters.includes(`${item[element]}`)) {
              found = found || true;
            }
          }
        }
      }
    }
    return found || noFilters;
  })
}

module.exports = { readJson, filterList, sortList, paginateList, freeTextFilter, todFilter, languageFilter, overseasFilter }