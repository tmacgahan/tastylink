import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { MarketDataRMI } from './MarketDataRMI';
import { Side, Option, Strike, Expiration, Chain, SideFromSymbol, StrikePriceFromSymbol } from '../Strategies/Chain';
import { TimestampToDate } from '../Utils/DateFunctions';
import { Replacer } from '../Utils/PrettyPrint'
import { ChainReply } from './ExternalModel';

function GenerateOption(symbol: string, bid: number, ask: number): Option {
    return {
        symbol: symbol,
        bid: bid,
        ask: ask,
        side: SideFromSymbol(symbol),
    }
}

function GatherStrikes(chainReply: ChainReply): Array<Strike> {
    console.log( `reply: ${JSON.stringify(chainReply)}` );
    console.log( `total symbols: ${chainReply.optionSymbol.length}` );
    let entries: Map<Number, Strike> = new Map<Number, Strike>();

    for( var ii = 0; ii < chainReply.optionSymbol.length; ii++ )  {
        let price = StrikePriceFromSymbol(chainReply.optionSymbol[ii])
        let opt = GenerateOption(chainReply.optionSymbol[ii], chainReply.bid[ii], chainReply.ask[ii]);
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
    Array.from(entries).forEach( (entry) => { strikes.push(entry[1]); });

    return strikes;
}

export function DownloadUnderlyingPrice(symbol: string, timestamp: string): T.TaskEither<Error, number> {
    return pipe(
        MarketDataRMI.instance.GetCandleForDay(symbol, timestamp),
        T.map( candleReply => (candleReply.o[0] + candleReply.c[0]) / 2 ) // taking the average over open / close
    )
}

export function DownloadChain(symbol: string, timestamp: string) {
    console.log( `executing chain download for ${symbol} on ${timestamp}` );
    pipe(
        MarketDataRMI.instance.GetExpirationDates(symbol, timestamp),
        T.flatMap( reply => {
            //console.log( `reply: ${JSON.stringify(reply)}` );
            return T.sequenceArray(reply.expirations.map( exp => pipe(
                MarketDataRMI.instance.GetChain(symbol, timestamp, exp),
                T.map( result => { return { reply: result, exp: exp, } })
            )))
        }),
        T.chain( replies => pipe(
            DownloadUnderlyingPrice(symbol, timestamp),
            T.map( price => {
                let expirations: Array<Expiration> = new Array();
                replies.forEach( (item , idx: number) => {
                    expirations.push(new Expiration(TimestampToDate(item.exp), GatherStrikes(item.reply)));
                })

                return new Chain(TimestampToDate(timestamp), symbol, price, expirations);
            }),
        )),
    )().then(result => pipe( 
        result,
        E.match(
            err => { console.log(`An error occurred while processing ${symbol} for ${timestamp}`); throw(err) },
            msg => { console.log(`${JSON.stringify(result, Replacer)}\ndone`) },
        )
    ));
}