// this is all stuff zapier exposes
/* global z, _, moment, ErrorException */

// need es6 imports for rollup
import parsePrice from 'parse-price'
import OAuth from 'oauth-1.0a'
import * as utils from './utils'

// these could be const
const rootUrl = 'https://secure.splitwise.com/api/v3.0'
const contentTypeHeader = 'application/x-www-form-urlencoded'

const oauth = OAuth({
  consumer: {
    public: '<OAUTH_CONSUMER_PUBLIC>',
    secret: '<OAUTH_CONSUMER_SECRET>'
  }
})

module.exports = {
  get_friends_post_poll: function (bundle) {
    let friends = z.JSON.parse(bundle.response.content).friends
    friends.forEach(function (friend) {
      friend.name = friend.first_name + ' ' + friend.last_name
    })

    let token = utils.fetchToken(bundle.auth_fields)

    let requestData = {
      url: rootUrl + '/get_current_user',
      method: 'GET'
    }

    let me = z.JSON.parse(z.request({
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

    return friends
  },

  get_groups_post_poll: function (bundle) {
    let groups = z.JSON.parse(bundle.response.content).groups
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
    let result = z.JSON.parse(bundle.response.content)
    utils.handleError(result)

    return result.expenses.filter(utils.removeDeleted).sort(utils.newestFirst)
  },

  create_expense_pre_write: function (bundle) {
    bundle.request.headers['Content-Type'] = contentTypeHeader
    let parsedCost = parsePrice(bundle.action_fields_full.cost)
    let groupId = bundle.action_fields_full.group_id
    let users = bundle.action_fields_full.users || []

    if (!(users.length || groupId)) {
      throw new ErrorException('Need to specify either a group or participants')
    } else if (groupId && !users.length) {
      // default split, authed user pays
      bundle.request.data = _.extend({}, bundle.action_fields_full, { split_equally: true })
    } else {
      // manually specified participants
      let usersObj = utils.userIdsToKeys(users, bundle.action_fields_full.cost)
      delete bundle.action_fields_full.users

      bundle.request.data = _.extend({}, bundle.action_fields_full, usersObj)

      // user 0 always pays the full cost. Need clean float representation
      bundle.request.data.users__0__paid_share = parsedCost
    }

    bundle.request.data.cost = parsedCost
    return bundle.request
  },

  create_expense_post_write: function (bundle) {
    let result = z.JSON.parse(bundle.response.content)
    utils.handleError(result)
    return result
  }
} // end zap
