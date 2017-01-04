// Trigger stub created by 'zapier convert'. This is just a stub - you will need to edit!

// triggers on get_groups with a certain tag
const triggerGetgroups = (z, bundle) => {
  const responsePromise = z.request({
    url: 'https://secure.splitwise.com/api/v3.0/get_groups',
    params: {
      EXAMPLE: bundle.inputData.EXAMPLE
    }
  })
  return responsePromise
    .then(response => JSON.parse(response.content))
}

module.exports = {
  key: 'get_groups',
  noun: 'Get_groups',

  display: {
    label: 'Get Get_groups',
    description: 'Triggers on a new get_groups.'
  },

  operation: {
    inputFields: [

    ],

    perform: triggerGetgroups
  }
}
