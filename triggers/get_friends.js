// Trigger stub created by 'zapier convert'. This is just a stub - you will need to edit!

// triggers on get_friends with a certain tag
const triggerGetfriends = (z, bundle) => {
  const responsePromise = z.request({
    url: 'https://secure.splitwise.com/api/v3.0/get_friends',
    params: {
      EXAMPLE: bundle.inputData.EXAMPLE
    }
  })
  return responsePromise
    .then(response => JSON.parse(response.content))
}

module.exports = {
  key: 'get_friends',
  noun: 'Get_friends',

  display: {
    label: 'Get Get_friends',
    description: 'Triggers on a new get_friends.'
  },

  operation: {
    inputFields: [

    ],

    perform: triggerGetfriends
  }
}
