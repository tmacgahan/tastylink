import { pipe } from 'fp-ts/function'
import { LoadAPIToken } from './MarketData/GetTokens'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { MarketDataFunctions } from './MarketData/MarketDataFunctions'
import { Timestamp, TomorrowOf } from './Utils/DateFunctions'
import { CacheKey } from './Utils/CacheKey'

//const util = require('util');

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

let md = new MarketDataFunctions(LoadAPIToken());

pipe(
    md.GetExpirationDates("SPY", "2024-07-01"),
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