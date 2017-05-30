const test = require('tape')

const utils = require('./utils')

test('sum', (t) => {
  t.equal(utils.sum([1, 2, 3]), 6)
  t.equal(utils.sum([]), 0)
  t.end()
})

test('calculatePortions', (t) => {
  t.deepEqual(
    utils.calculatePortions([1, 2], '$100'),
    [5000, 5000]
  )

  t.deepEqual(
    utils.calculatePortions([1, 2, 3], '70.00'),
    [2334, 2333, 2333]
  )

  t.deepEqual(
    utils.calculatePortions([1, 2], '$45.45'),
    [2272, 2273]
  )

  t.deepEqual(
    utils.calculatePortions([1, 2, 3, 4, 5], '123.12'),
    [2463, 2463, 2462, 2462, 2462]
  )

  t.end()
})

test('userIdsToKeys', (t) => {
  t.deepEqual(
    utils.userIdsToKeys([1, 2], '$100'),
    {
      'users__0__user_id': 1,
      'users__0__owed_share': 50,
      'users__1__user_id': 2,
      'users__1__owed_share': 50
    }
  )
  t.end()
})
