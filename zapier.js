// this is all stuff zapier exposes
/* global z, _, ErrorException, moment */

// need es6 imports for rollup
import parsePrice from 'parse-price'
import OAuth from 'oauth-1.0a'

// these could be const
const rootUrl = 'https://secure.splitwise.com/api/v3.0'
const contentTypeHeader = 'application/x-www-form-urlencoded'

// helpers
const oauth = OAuth({
  consumer: {
    public: '<OAUTH_CONSUMER_PUBLIC>',
    secret: '<OAUTH_CONSUMER_SECRET>'
  }
})

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

  return portions
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
  get_friends_post_poll: function (bundle) {
    let friends = JSON.parse(bundle.response.content).friends
    friends.forEach(function (friend) {
      friend.name = friend.first_name + ' ' + friend.last_name
    })

    let token = fetchToken(bundle.auth_fields)

    let requestData = {
      url: rootUrl + '/get_current_user',
      method: 'GET'
    }

    let me = JSON.parse(z.request({
      method: requestData.method,
      url: requestData.url,
      'headers': _.extend({
        'Content-Type': contentTypeHeader
      }, oauth.toHeader(oauth.authorize(requestData, token)))
    }).content).user

    me.name = me.first_name + ' ' + me.last_name + ' (you)'
    // insert me at front of sorted array
    friends = _.sortBy(friends, 'name')
    friends.splice(0, 0, me)
    // console.log(me)

    return friends
  },

  get_groups_post_poll: function (bundle) {
    let groups = JSON.parse(bundle.response.content).groups
    // non group expenses group is always first, let's make it last
    let nonGroupExpenses = groups.splice(0, 1)[0]
    groups = _.sortBy(groups, 'name')
    groups.push(nonGroupExpenses)
    return groups
  },

  new_expense_pre_poll: function (bundle) {
    bundle.request.headers['Content-Type'] = contentTypeHeader // needed for auth
    bundle.request.params = {
      group_id: bundle.trigger_fields.group_id
    }

    // for tests, we always want to find something, whenever it was made
    if (bundle.meta.frontend) {
      bundle.request.params.limit = 3
    } else {
      bundle.request.params.dated_after = moment().subtract(1, 'hour').toISOString()
      bundle.request.params.limit = 0 // no limit
    }

    return bundle.request
  },

  new_expense_post_poll: function (bundle) {
    let result = JSON.parse(bundle.response.content)
    handleError(result)

    return result.expenses.filter(removeDeleted).sort(newestFirst)
  },

  create_expense_pre_write: function (bundle) {
    bundle.request.headers['Content-Type'] = contentTypeHeader

    let usersObj = userIdsToKeys(bundle.action_fields_full.users, bundle.action_fields_full.cost)
    delete bundle.action_fields_full.users

    bundle.request.data = _.extend({}, bundle.action_fields_full, usersObj)
    let cost = parsePrice(bundle.action_fields_full.cost)
    // user 0 always pays the full cost. Need clean float representation
    bundle.request.data.users__0__paid_share = cost
    bundle.request.data.cost = cost

    return bundle.request
  },

  create_expense_post_write: function (bundle) {
    let result = JSON.parse(bundle.response.content)
    handleError(result)
    return result
  }
} // end zap
