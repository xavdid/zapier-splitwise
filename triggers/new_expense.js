// Trigger stub created by 'zapier convert'. This is just a stub - you will need to edit!

// triggers on new_expense with a certain tag
const triggerNewexpense = (z, bundle) => {
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
  key: 'new_expense',
  noun: 'New_expense',

  display: {
    label: 'Get New_expense',
    description: 'Triggers on a new new_expense.'
  },

  operation: {
    inputFields: [
      {
        key: 'group_id',
        label: 'Group',
        helpText: 'Get expenses only for a certain group.',
        type: 'integer',
        required: false
      }
    ],

    perform: triggerNewexpense
  }
}
