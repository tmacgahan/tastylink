import { Chain, Expiration, Strike } from "./Chain";
import { TimestampToDte } from '../Utils/DateFunctions';

/**
 * By default this will return an at the money strike.  If a moneyness is specified, it will try to
 * find a strike with that moneyness.  When specifying moneyness, use positive values for out of the money
 * calls or in the money puts, with negatives for in the money calls or out of the money puts.
 */
export function FindStrike(expiration: Expiration, price: bigint, moneyness: bigint = 0n): Strike {
    for( let ii = 0; ii < expiration.strikes.length; ii++ ) {
        if( price <= expiration.strikes[ii] + moneyness ) {
            return expiration.map.get(expiration.strikes[ii]) as Strike
        }
    }

    return expiration.map.get(expiration.strikes[expiration.strikes.length - 1]) as Strike
}

export function FindExpiration(chain: Chain, minDte: number = 1, maxDte: number = 900 ): Expiration {
    const timestamp = chain.timestamp
    for( let ii = 0; ii < chain.expirations.length; ii++ ) {
        const dte = TimestampToDte(timestamp, chain.expirations[ii].timestamp)
        if( dte >= minDte && dte <= maxDte ) {
            return chain.expirations[ii]
        }
    }

    return chain.expirations[0]
}