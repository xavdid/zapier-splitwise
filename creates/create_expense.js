// "Create" stub created by 'zapier convert'. This is just a stub - you will need to edit!

// create a particular create_expense by name
const createCreateexpense = (z, bundle) => {
  const responsePromise = z.request({
    method: 'POST',
    url: 'https://secure.splitwise.com/api/v3.0/create_expense',
    data: JSON.stringify({
      EXAMPLE: bundle.inputData.EXAMPLE
    })
  })
  return responsePromise
    .then(response => JSON.parse(response.content))
}

module.exports = {
  key: 'create_expense',
  noun: 'Create_expense',

  display: {
    label: 'Create Create_expense',
    description: 'Creates a create_expense.'
  },

  operation: {
    inputFields: [
      {
        key: 'cost',
        label: 'Cost',
        helpText: 'Total cost of the expense in a reasonable currency format (eg: **$12.34** or **12,34 €**)',
        type: 'string',
        required: true,
        placeholder: '13.37'
      },
      {
        key: 'description',
        label: 'Description',
        helpText: 'The title of the expense',
        type: 'string',
        required: true,
        placeholder: 'Paying for that thing'
      },
      {
        key: 'users',
        label: 'Participants',
        helpText: 'List the users involved in the expense. Whatever user is listed first is the person who paid for it. ',
        type: 'string',
        required: true
      },
      {
        key: 'group_id',
        label: 'Group ID',
        helpText: 'The id for the group if you want it to be assigned to a group',
        type: 'string',
        required: false
      }
    ],

    perform: createCreateexpense
  }
}
