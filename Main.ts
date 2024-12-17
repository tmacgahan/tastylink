import { pipe } from 'fp-ts/function'
import { LoadAPIToken } from './MarketData/GetTokens'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { MarketDataFunctions } from './MarketData/MarketDataFunctions'
import { Timestamp, TimestampToDate, TimestampsToDte } from './Utils/DateFunctions'
import { decode, OptionCode } from './Utils/OptionCode'
import { ChainReply } from './MarketData/ExternalModel'
import { Option, Chain, Strike, Expiration, Side, SideFromSymbol, StrikePriceFromSymbol } from './Strategies/Chain'
import { BuyAndHoldCalls } from './Strategies/BuyAndHoldCalls'

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

let md = new MarketDataFunctions(LoadAPIToken());

// dedicated timestamp object

// helper lifted from stack overflow to prettyprint maps
function replacer(key: any, value: any) {
    if(value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()),
      };
    } else {
      return value;
    }
  }

//let strategy = new BuyAndHoldCalls("2024-12-10")
/*
        T.sequenceArray(
            ["2024-12-10", "2024-12-11"].map( date => T.of<Error, string>(date) )
        ),
        T.map( dates => dates.map( date => md.GetExpirationDates("SPY", date) ) ),
*/

/*
our pipe is:
pipe(
  GatherDates,
  ForEachDate(
    GetExpirations,
    ForEachExpiration(
        GetChainForExpiration
    ),
    BuildCompleteChain,
    ApplyStrategyToChain,
  )
)
*/

let timestamp = "2024-12-13"

// we need to break this up into functions
if( true ) {
    pipe(
        md.GetExpirationDates("SPY", timestamp),
        T.flatMap( reply =>
            T.sequenceArray(reply.expirations.map( exp => pipe(
                md.GetChain("SPY", timestamp, exp),
                T.map( result => { 
                    return {
                        reply: result,
                        exp: exp,
                    }
                })
            )))
        ),
        T.map( replies => {
            let expirations: Array<Expiration> = new Array();
            replies.forEach( (item , idx: number) => {
                let exp = item.exp
                let chainReply = item.reply
                console.log( `total symbols: ${chainReply.optionSymbol.length}` );
                let entries: Map<Number, Strike> = new Map<Number, Strike>();

                for( var ii = 0; ii < chainReply.optionSymbol.length; ii++ ) {
                    let symbol = chainReply.optionSymbol[ii]
                    let price = StrikePriceFromSymbol(symbol);
                    let opt: Option = {
                        symbol: symbol,
                        bid: chainReply.bid[ii],
                        ask: chainReply.ask[ii],
                        side: SideFromSymbol(symbol),
                    }

                    if( entries.has(price) ) {
                        let strike = entries.get(price) as Strike
                        if( opt.side == Side.Call ) {
                            strike.call = opt
                        } else {
                            strike.put = opt
                        }

                        entries.set(price, strike)
                    } else {
                        let strike: Strike = { price: price, put: null, call: null }
                        if( opt.side == Side.Put ) {
                            strike.put = opt
                        } else {
                            strike.call = opt
                        }

                        entries.set(price, strike)
                    }
                }

                let strikes: Array<Strike> = new Array()
                Array.from(entries).forEach( (entry) => {
                    strikes.push(entry[1]);
                });

                expirations.push(new Expiration(TimestampToDate(exp), strikes));
            })

            return new Chain(TimestampToDate("2024-12-10"), "SPY", 600, expirations);
        }),
    )().then(result => pipe( 
        result,
        E.match(
            err => { throw(err) },
            msg => { console.log(`${JSON.stringify(result, replacer)}\ndone`) },
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

    let expiration = new Expiration(TimestampToDate("2024-12-20"), [strike]);
    let chain = new Chain(TimestampToDate("2024-12-11"), "SPY", 500, [expiration]);

    console.log(JSON.stringify(chain, replacer));
}