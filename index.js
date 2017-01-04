// Created by 'zapier convert'. This is just a stub - you will need to edit!

const GetgroupsTrigger = require('./triggers/get_groups')
const GetexpensesTrigger = require('./triggers/get_expenses')
const GetfriendsTrigger = require('./triggers/get_friends')
const NewexpenseTrigger = require('./triggers/new_expense')
const CreateexpenseCreate = require('./creates/create_expense')

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: {
      // TODO: complete auth settings
  },

  resources: {
  },

  triggers: {
    [GetgroupsTrigger.key]: GetgroupsTrigger,
    [GetexpensesTrigger.key]: GetexpensesTrigger,
    [GetfriendsTrigger.key]: GetfriendsTrigger,
    [NewexpenseTrigger.key]: NewexpenseTrigger
  },

  searches: {

  },

  creates: {
    [CreateexpenseCreate.key]: CreateexpenseCreate
  }

}

module.exports = App
