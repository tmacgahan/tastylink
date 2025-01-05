import { Expiration, Strike } from "./Chain";

export function FindAtTheMoneyStrike(expiration: Expiration, money: number): Strike {
    let found: boolean = false
    for( let ii = 0; ii < expiration.strikes.length; ii++) {
        if( money >= expiration.strikes[ii] ){
            return expiration.map.get(expiration.strikes[ii]) as Strike;
        }
    }

    return expiration.map.get(expiration.strikes[expiration.strikes.length -1]) as Strike
}