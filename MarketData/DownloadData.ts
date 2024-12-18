import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/function'
import { MarketDataFunctions } from './MarketDataFunctions';
import { LoadAPIToken } from './GetTokens';
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

function GatherStrikes(chainReply: ChainReply, expirationTimestamp: string): Array<Strike> {
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

export function DownloadData(symbol: string, timestamp: string) {
    let md = new MarketDataFunctions(LoadAPIToken());
    pipe(
        md.GetExpirationDates(symbol, timestamp),
        T.flatMap( reply =>
            T.sequenceArray(reply.expirations.map( exp => pipe(
                md.GetChain(symbol, timestamp, exp),
                T.map( result => { return { reply: result, exp: exp, } })
            )))
        ),
        T.map( replies => {
            let expirations: Array<Expiration> = new Array();
            replies.forEach( (item , idx: number) => {
                expirations.push(new Expiration(TimestampToDate(item.exp), GatherStrikes(item.reply, item.exp)));
            })

            return new Chain(TimestampToDate(timestamp), symbol, 600, expirations); // we need to actually download the price as well.
        }),
    )().then(result => pipe( 
        result,
        E.match(
            err => { throw(err) },
            msg => { console.log(`${JSON.stringify(result, Replacer)}\ndone`) },
        )
    ));
}