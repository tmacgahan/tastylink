import * as fs from 'fs';
import * as T from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { CacheKey } from '../Utils/CacheKey';
import { ChainReply, ExpirationsReply, CandleReply, Resolution, GeneralReply } from './ExternalModel';
import { TimestampsToDte } from '../Utils/DateFunctions';
import  Semaphore = require( 'ts-semaphore' );


/**
 * Singleton for accessing remote methods on the MarketData API.  Located at https://api.marketdata.app
 * You need to have a token to talk to them, and you should put that token in the place referenced
 * in the constructor
 */
export class MarketDataRMI {
    private readonly apiToken: string;
    public static readonly instance: MarketDataRMI = new MarketDataRMI();
    private connections = new Semaphore(40);

    private constructor() {
        this.apiToken = String(fs.readFileSync('secrets/marketdata.token'))
    }

    
    private requestData() {
        return {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
            },
        }
    }

    // Memoize this call to disk.  If it is already on disk, use that instead.
    private memoized<T>( cache: CacheKey, apiUrl: string ): T.TaskEither<Error, T> {
        return cache.exists() ? T.of(cache.load<T>()) : pipe(
            T.tryCatch(
                () => this.connections.use( () => fetch(apiUrl, this.requestData()).then(resp => resp.json().then(json => json)) ),
                (reason) => new Error(String(reason)),
            ),
            T.map( result => {
                let gen = result as GeneralReply
                if( (gen == null) || (gen.s == null) || !(gen.s === "ok") ) {
                    console.log( `failed to cache result: ${JSON.stringify(result)} to ${cache.path()}` );
                    T.left(new Error(`got a failure back from server: ${JSON.stringify(gen)}`));
                } else {
                    cache.write(JSON.stringify(result));
                    return result;
                }
            }),
        );
    }

    /**
     * Get the expiration dates that would have been available on the date of the timestamp
     * @param symbol    underlying symbol
     * @param timestamp historical date on which we would be interrogating the chain
     * @returns 
     */
    public GetExpirationDates( symbol: string, timestamp: string ): T.TaskEither<Error, ExpirationsReply> {
        return this.memoized<ExpirationsReply>(
            new CacheKey("expirations", symbol, timestamp),
            `https://api.marketdata.app/v1/options/expirations/${symbol}?${new URLSearchParams({
                date: timestamp,
            })}`,
        )
    }

    /**
     * This function is not done because it lacks an appropriate external model entry
     * @param symbol 
     * @param timestamp 
     * @returns 
     */
    public GetStrikes( symbol: string, timestamp: string ): T.TaskEither<Error, unknown> {
        return this.memoized(
            new CacheKey("strikes", symbol, timestamp),
            `https://api.marketdata.app/v1/options/strikes/${symbol}?${new URLSearchParams({
                date: timestamp,
            })}`,
        )
    }

    /**
     * So if we want to get options expiring on 2014-08-01 as if we were trying to figure out
     * what our possibilities are as if it were 2014-07-01 and we were interested in SPY
     * then we would do
     *          GetChain( "SPY", "2014-07-01", "2014-08-01" );
     * @param symbol            underlying symbol
     * @param queryDate         day in the past for which we are doing the lookup
     * @param expirationDate    day of the expiration we are looking up
     * @returns 
     */
    public GetChain( symbol: string, queryDate: string, expirationDate: string ): T.TaskEither<Error, ChainReply> {
        return this.memoized<ChainReply>(
            new CacheKey("chain", symbol, queryDate, expirationDate),
            `https://api.marketdata.app/v1/options/chain/${symbol}?${new URLSearchParams({
                date: queryDate,
                expirations: "all",
                dte: String(TimestampsToDte(queryDate, expirationDate)),
                columns: "s,optionSymbol,bid,ask", // we need to ask sfor the s column, or we won't get the status column and won't be able to tell a failed result from a valid one
            })}`,
        )
    }

    /**
     * Download a candle for the specified day.  We will get just the open and close, and compute the average value
     * @param symbol
     * @param queryDate
     */
    public GetCandleForDay( symbol: string, queryDate: string ): T.TaskEither<Error, CandleReply> {
        let resolution = Resolution.Daily
        return this.memoized<CandleReply>(
            new CacheKey("candle", symbol, queryDate, queryDate),
            `https://api.marketdata.app/v1/stocks/candles/${resolution}/${symbol}?${new URLSearchParams({
                from: queryDate,
                to: queryDate,
            })}`,
        )
    }
}