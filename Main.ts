import { pipe } from 'fp-ts/function'
import { LoadAPIToken } from './MarketData/GetTokens'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { MarketDataFunctions } from './MarketData/MarketDataFunctions'
import { Timestamp, TimestampToDate, TimestampsToDte } from './Utils/DateFunctions'
import { decode, OptionCode } from './Utils/OptionCode'
import { ChainReply } from './MarketData/ExternalModel'
import { Option, Chain, Strike, Expiration, Side } from './Strategies/Chain'

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

let md = new MarketDataFunctions(LoadAPIToken());

interface ChainEntry {
    code: OptionCode,
    bid: number,
    ask: number,
}

if( false ) {
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
    let put: Option = {
        bid: 1.13,
        ask: 1.15,
        side: Side.Put,
        symbol: "SPY241220P00120000",
    }

    let call: Option = {
        bid: 1.13,
        ask: 1.15,
        side: Side.Call,
        symbol: "SPY241220C00120000",
    }

    let strike: Strike = {
        price: 120,
        call: call,
        put: put,
    }

    let expiration = new Expiration(TimestampToDate("2024-12-20"));
    expiration.pushStrike(strike);
    let chain = new Chain(TimestampToDate("2024-12-11"), "SPY", 500);
    chain.pushExpiration(expiration);

    console.log(JSON.stringify(chain));
}