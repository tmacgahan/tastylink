interface TastyLoginReply {
    data: {
        user: {
            email: string,
            'external-id': string,
            'is-confirmed': boolean,
            username: string,
        },
        'session-expiration': string, //actually a date of some kind
        'session-token': string,
    },
    context: '/sessions',
}

// example reply
/*
{
    data: {
        user: {
        email: 'thomas.macgahan@gmail.com',
        'external-id': 'U74abdcbe-48bc-4883-8b94-93cd98cd7fc3',
        'is-confirmed': true,
        username: 'tmcsandbox'
        },
        'session-expiration': '2024-11-26T01:43:51.985Z',
        'session-token': 'ghXlS6YCSTe7y6Y2-VulvEVBqv7UplHAD9VmUpbGFu9rCl8ZWNYkg+C'
    },
    context: '/sessions'
}
*/
