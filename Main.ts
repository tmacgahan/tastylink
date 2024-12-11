import { identity, pipe } from 'fp-ts/function'
import { LoadAPIToken } from './MarketData/GetTokens'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { GetExpirationDates } from './MarketData/MarketDataFunctions'

const util = require('util');

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

//console.log( LoadAPIToken() );
let apiToken = LoadAPIToken();
pipe(
    GetExpirationDates(apiToken, "SPY"),
    T.map( str => {
        console.log(JSON.stringify(str));
        return str;
    }),
)().then(result => pipe( 
    result,
    E.match(
        err => { throw(err) },
        msg => { console.log(`final match: ${msg}`) },
    )
));
/*
pipe(
    GetTokens(),
    T.map( tokens => {
        console.log( tokens );
        return tokens;
    }),
    T.map( str => {
        console.log(JSON.stringify(str));
    }),
)().then( result => pipe(
    result,
    E.match(
        err => { throw(err) },
        msg => { console.log(`final match: ${msg}`) }
    )
));
*/