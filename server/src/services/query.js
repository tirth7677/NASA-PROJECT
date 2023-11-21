//mean i have to return all the doc 0 mean all docs
const DEFAULT_PAGE_LIMIT = 0;
const DEFAULT_PAGE_NUMBER = 1;


function getpagination(query) {
  // here limit and page is in string so we have to convert it into number and .abs function convert string into number and even it change the -ve number to +ve number
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT ;
  //here skip mean suppose in first page i have 20 doc so in 2nd page i have to skip first 20 doc so it show me another 20
  // (1 - 1) * 20 = 0 * 20 = 0 so in first page i have to skip 0 docs
  // (2-1) * 20 = 1 * 20 = 20 so in 2nd page i have to skip first 20 docs
  // so on...........
  const skip = (page - 1) * limit; 
  return{
    skip,
    limit,
  }
}

module.exports = {
    getpagination,
}