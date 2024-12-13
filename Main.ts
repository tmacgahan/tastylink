import { pipe } from 'fp-ts/function'
import { LoadAPIToken } from './MarketData/GetTokens'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { MarketDataFunctions } from './MarketData/MarketDataFunctions'
import { Timestamp, TomorrowOf, TimestampToDate, TimestampsToDte } from './Utils/DateFunctions'
import { CacheKey } from './Utils/CacheKey'
import { decode, OptionCode } from './Utils/OptionCode'
import { ChainReply } from './MarketData/ExternalModel'

//const util = require('util');

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

let md = new MarketDataFunctions(LoadAPIToken());

interface ChainEntry {
    code: OptionCode,
    bid: number,
    ask: number,
}

if( true ) {
    pipe(
        md.GetExpirationDates("SPY", "2024-12-11"),
        T.flatMap( reply =>
            T.sequenceArray(reply.expirations.map( exp => md.GetChain("SPY", "2024-12-11", exp)))
        ),
        T.map( replies => replies.forEach( (chainReply: ChainReply, idx: number) => {
            console.log( `total symbols: ${chainReply.optionSymbol.length}` );
            let entries: ChainEntry[] = new Array();

            for( var ii = 0; ii < chainReply.optionSymbol.length; ii++ ) {
                entries.push({
                    code: decode(chainReply.optionSymbol[ii]),
                    bid: chainReply.bid[ii],
                    ask: chainReply.ask[ii],
                });
            }

            return entries;
        })),
    )().then(result => pipe( 
        result,
        E.match(
            err => { throw(err) },
            msg => { console.log(`done`) },
        )
    ));
} else {
    let chainDate = "2024-12-11"
    let forExpiration = "2024-12-12"
    console.log(TimestampToDate(chainDate));
    console.log(TimestampToDate(forExpiration));
    console.log(TimestampsToDte(chainDate, forExpiration));
    console.log(JSON.stringify(decode("SPY241220C00120000")));
}