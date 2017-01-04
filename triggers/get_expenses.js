// Trigger stub created by 'zapier convert'. This is just a stub - you will need to edit!

// triggers on get_expenses with a certain tag
const triggerGetexpenses = (z, bundle) => {
  const responsePromise = z.request({
    url: 'https://secure.splitwise.com/api/v3.0/get_expenses',
    params: {
      EXAMPLE: bundle.inputData.EXAMPLE
    }
  })
  return responsePromise
    .then(response => JSON.parse(response.content))
}

module.exports = {
  key: 'get_expenses',
  noun: 'Get_expenses',

  display: {
    label: 'Get Get_expenses',
    description: 'Triggers on a new get_expenses.'
  },

  operation: {
    inputFields: [

    ],

    perform: triggerGetexpenses
  }
}
