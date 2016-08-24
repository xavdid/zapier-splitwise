/* global z, _, ErrorException, crypto */ // eslint-disable-line no-unused-vars

import parsePrice from 'parse-price'
import OAuth from 'oauth-1.0a'

// these could be const
var rootUrl = 'https://secure.splitwise.com/api/v3.0'
var contentTypeHeader = 'application/x-www-form-urlencoded'

var oauth = OAuth({
  consumer: {
    public: '<OAUTH_CONSUMER_PUBLIC>',
    secret: '<OAUTH_CONSUMER_SECRET>'
  }
})

function fetchToken (authFields) {
  return {
    public: authFields.oauth_token,
    secret: authFields.oauth_token_secret
  }
}

function sum (arr) {
  return arr.reduce(function (a, b) {
    return a + b
  }, 0)
}

function calculatePortions (ids, cost) {
  cost = parsePrice(cost) * 100
  var costPer = Math.round(cost / ids.length)
  // makes an array of identical costs
  var portions = ids.map(function (x) { return costPer })

  // tweak it so portions add to cost exactly
  while (sum(portions) > cost) {
    portions[0] -= 1
  }

  return portions
}

function userIdsToKeys (ids, cost) {
  // iterate each with index
  var res = {}
  var portions = calculatePortions(ids, cost)

  ids.forEach(function (id, index) {
    res['users__' + index + '__user_id'] = id
    res['users__' + index + '__owed_share'] = portions[index] / 100
  })

  return res
}

var Zap = { // eslint-disable-line no-unused-vars
  get_friends_post_poll: function (bundle) {
    var friends = JSON.parse(bundle.response.content).friends
    friends.forEach(function (friend) {
      friend.name = friend.first_name + ' ' + friend.last_name
    })

    var token = fetchToken(bundle.auth_fields)

    var requestData = {
      url: rootUrl + '/get_current_user',
      method: 'GET'
    }

    var me = JSON.parse(z.request({
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
    var groups = JSON.parse(bundle.response.content).groups
    // non group expenses group is always first, let's make it last
    var nonGroupExpenses = groups.splice(0, 1)[0]
    groups = _.sortBy(groups, 'name')
    groups.push(nonGroupExpenses)
    return groups
  },

  create_expense_pre_write: function (bundle) {
    bundle.request.headers['Content-Type'] = contentTypeHeader

    var usersObj = userIdsToKeys(bundle.action_fields_full.users, bundle.action_fields_full.cost)
    delete bundle.action_fields_full.users

    bundle.request.data = _.extend({}, bundle.action_fields_full, usersObj)
    // user 0 always pays the full cost. Need clean float representation
    bundle.request.data.users__0__paid_share = parsePrice(bundle.action_fields_full.cost)

    return bundle.request
  },

  create_expense_post_write: function (bundle) {
    var result = JSON.parse(bundle.response.content)
    if (result.errors.base) {
      var message = result.errors.base.join('\n')
      throw new ErrorException(message)
    } else {
      return result
    }
  }
} // end zap
