import { Timestamp, TimestampToDate } from "../Utils/DateFunctions";
import * as fs from 'fs';
import { Replacer, Reviver } from "../Utils/PrettyPrint";

export type Symbol = string

export const END_OF_TIME = TimestampToDate("9999-12-31")

export enum Side {
    Put = "PUT",
    Call = "CALL",
    Underlying = "UNDERLYING",
}

export interface Security {
    bid: bigint
    ask: bigint
    side: Side
    symbol: Symbol
}

export interface Strike {
    price: bigint  // strike price, market prices will always be bid / ask
    call: Security | null
    put: Security | null
}

export class Expiration {
    public readonly timestamp: string     // the date of expiration in question
    public readonly strikes: bigint[]
    public readonly strikeList: Strike[]
    public readonly map: Map<bigint, Strike>

    constructor( timestamp: string, strikes: Strike[] ) {
        this.timestamp = timestamp
        this.strikeList = strikes.sort( (strike1, strike2) => Number(strike1.price - strike2.price) )
        let map: Map<bigint, Strike> = new Map<bigint, Strike>()
        this.strikes = new Array<bigint>()
        strikes.forEach( (strike) => {
            map.set(strike.price, strike)
            this.strikes.push(strike.price)
        });
        this.map = map
    }
}

export class Chain {
    public readonly timestamp: string      // the date for which the chain was pulled
    public readonly underlying: string
    public readonly price: bigint          // the price of the underlying
    public readonly expirations: Expiration[]
    public readonly dateMap: Map<string, Expiration>

    constructor( timestamp: string, underlying: string, price: bigint, expirations: Expiration[] ) {
        expirations.sort( (exp1, exp2) => exp1.timestamp.localeCompare(exp2.timestamp) )
        this.timestamp = timestamp
        this.underlying = underlying
        this.price = price
        this.expirations = expirations

        let dateMap: Map<string, Expiration> = new Map<string, Expiration>();
        expirations.forEach( exp => dateMap.set(exp.timestamp, exp));
        this.dateMap = dateMap;
    }

    public Save() {
        const name: string = `chains/chain.${this.underlying}.${this.timestamp}.json`
        fs.writeFileSync(name, JSON.stringify(this, Replacer))
    }
}

export function LoadChain(underlying: string, timestamp: string): Chain {
    const name: string = `chains/chain.${underlying}.${timestamp}.json`
    const loaded: Chain = JSON.parse(String(fs.readFileSync(name)),Reviver) as Chain
    const expirations: Expiration[] = loaded.expirations.map( expiration => new Expiration(expiration.timestamp, expiration.strikeList))
    const result: Chain = new Chain( loaded.timestamp, loaded.underlying, loaded.price, expirations )
    return result
}

///// helpers /////
export function SideFromSymbol(symbol: Symbol) {
    if( symbol.length > 0 && symbol.length <= 5 ) {
        return Side.Underlying
    } else if(`${symbol.slice(symbol.length - 9, symbol.length - 8)}`.toUpperCase() == "P") {
        return Side.Put
    } else {
        return Side.Call
    }
}

export function StrikePriceFromSymbol(symbol: Symbol): bigint {
    if( SideFromSymbol(symbol) === Side.Underlying ) {
        return 0n
    }

    return BigInt(symbol.slice(symbol.length - 8, symbol.length)) / 10n
}

export function ExpirationDateFromSymbol(symbol: Symbol): Date {
    if( SideFromSymbol(symbol) === Side.Underlying ) {
        return END_OF_TIME
    }

    return TimestampToDate(TimestampFromSymbol(symbol))
}

export function TimestampFromSymbol(symbol: Symbol) {
    const day = symbol.slice(symbol.length - 11, symbol.length - 9)
    const month = symbol.slice(symbol.length - 13, symbol.length - 11)
    const year = `20${symbol.slice(symbol.length - 15, symbol.length - 13)}`

    return `${year}-${month}-${day}`;
}

export function AveragePrice(option: Security): bigint {
    return (option.bid + option.ask) / 2n
}

export function SecurityFromSymbol(symbol: Symbol, bid: bigint, ask: bigint): Security {
    return { symbol: symbol, side: SideFromSymbol(symbol), bid: bid, ask: ask, }
}