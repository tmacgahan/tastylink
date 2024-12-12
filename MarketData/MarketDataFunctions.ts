import * as T from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { CacheKey } from '../Utils/CacheKey';


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

    private memoized( cache: CacheKey, apiUrl: string, requestData: Object ): T.TaskEither<Error, unknown> {
        return cache.exists() ? T.of(cache.load()) : pipe( T.tryCatch(
                () => fetch(apiUrl, requestData).then(resp => resp.json().then(json => json)),
                (reason) => new Error(String(reason)),
            ),
            T.map( result => { cache.write(JSON.stringify(result)); return result } ),
        );
    }

    public GetExpirationDates( symbol: string, timestamp: string ): T.TaskEither<Error, unknown> {
        return this.memoized(
            new CacheKey("expirations", symbol, timestamp),
            `https://api.marketdata.app/v1/options/expirations/${symbol}?${new URLSearchParams({
                date: timestamp,
            })}`,
            this.requestData('GET'),
        );
    }

    public GetStrikes( symbol: string, timestamp: string): T.TaskEither<Error, unknown> {
        return this.memoized(
            new CacheKey("strikes", symbol, timestamp),
            `https://api.marketdata.app/options/strikes/${symbol}?${new URLSearchParams({
                date: timestamp,
            })}`,
            this.requestData('GET'),
        )
    }
}