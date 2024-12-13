import * as T from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { CacheKey } from '../Utils/CacheKey';
import { ChainReply, ExpirationsReply } from './ExternalModel';
import { TimestampsToDte } from '../Utils/DateFunctions';


export class MarketDataFunctions {
    private readonly apiToken: string;
    public constructor(setToken: string) {
        this.apiToken = setToken;
    }

    private requestData(verb: string) {
        return {
            method: verb,
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
            }
        }
    }

    // Memoize this call to disk.  If it is already on disk, use that instead.
    private memoized<T>( cache: CacheKey, apiUrl: string, requestData: Object ): T.TaskEither<Error, T> {
        return cache.exists() ? T.of(cache.load<T>()) : pipe( T.tryCatch(
                () => fetch(apiUrl, requestData).then(resp => resp.json().then(json => json)),
                (reason) => new Error(String(reason)),
            ),
            T.map( result => { cache.write(JSON.stringify(result)); return result } ),
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
            this.requestData('GET'),
        ) as T.TaskEither<Error, ExpirationsReply>;
    }

    public GetStrikes( symbol: string, timestamp: string ): T.TaskEither<Error, unknown> {
        return this.memoized(
            new CacheKey("strikes", symbol, timestamp),
            `https://api.marketdata.app/v1/options/strikes/${symbol}?${new URLSearchParams({
                date: timestamp,
            })}`,
            this.requestData('GET'),
        );
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
                columns: "optionSymbol,bid,ask"
            })}`,
            this.requestData('GET'),
        ) as T.TaskEither<Error, ChainReply>;
    }
}