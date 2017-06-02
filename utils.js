/* global ErrorException, _ */

const parsePrice = require('parse-price')

// helpers
const fetchToken = function (authFields) {
  return {
    public: authFields.oauth_token,
    secret: authFields.oauth_token_secret
  }
}

// sum of an array of ints
const sum = function (arr) {
  return arr.reduce(function (a, b) {
    return a + b
  }, 0)
}

const calculatePortions = function (ids, cost) {
  cost = parsePrice(cost) * 100
  let costPer = Math.round(cost / ids.length)
  // makes an array of (nearly) identical costs
  let portions = ids.map(function (x) { return costPer })

  // tweak it so portions add to cost exactly
  while (sum(portions) > cost) {
    portions[0] -= 1
  }

  let nextCentIndex = 0
  while (sum(portions) < cost) {
    portions[nextCentIndex % portions.length] += 1
    nextCentIndex += 1
  }

  if (sum(portions) !== cost) {
    let errMessage = [
      cost,
      "can't be split between",
      portions.length,
      'people'
    ].join(' ')
    throw new ErrorException(errMessage)
  }
  // to randomize for max fairness, shuffle this array
  // underscore can't be used in tests but not be in the bundle
  if (typeof _ === 'undefined') {
    return portions
  } else {
    return _.shuffle(portions)
  }
}

const userIdsToKeys = function (ids, cost) {
  // iterate each with index
  let res = {}
  let portions = calculatePortions(ids, cost)

  ids.forEach(function (id, index) {
    res['users__' + index + '__user_id'] = id
    res['users__' + index + '__owed_share'] = portions[index] / 100
  })

  return res
}

// utils
const handleError = function (result) {
  // why aren't these standard across splitwise calls?
  if (result.errors && result.errors.base) {
    throw new ErrorException(result.errors.base.join('\n'))
  } else if (result.error) {
    throw new ErrorException(result.error)
  } else {
    // this is fine
  }
}

// AGGREGATORS

// sort by id, newest first
const newestFirst = function (a, b) {
  let keyA = a.id
  let keyB = b.id
  if (keyA < keyB) return 1
  if (keyA > keyB) return -1
  return 0
}

const removeDeleted = function (obj) {
  // falsy when expense was deleted
  return !obj.deleted_at
}

module.exports = {
  fetchToken,
  sum,
  calculatePortions,
  userIdsToKeys,
  handleError,
  newestFirst,
  removeDeleted
}
