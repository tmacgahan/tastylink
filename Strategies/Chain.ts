import { set } from "fp-ts";
import { Timestamp, TimestampToDate } from "../Utils/DateFunctions";
import * as fs from 'fs';
import { Replacer } from "../Utils/PrettyPrint";

export enum Side {
    Put = "PUT",
    Call = "CALL",
}

export interface Option {
    bid: number
    ask: number
    side: Side
    symbol: string
}

export interface Strike {
    price: number;  // strike price, market prices will always be bid / ask
    call: Option | null
    put: Option | null
}

export class Expiration {
    public readonly timestamp: string     // the date of expiration in question
    public readonly strikes: number[]
    public readonly strikeList: Strike[]
    public readonly map: Map<number, Strike>

    constructor( timestamp: string, strikes: Strike[] ) {
        this.timestamp = timestamp
        this.strikeList = strikes.sort( (strike1, strike2) => strike1.price - strike2.price )
        let map: Map<number, Strike> = new Map<number, Strike>()
        this.strikes = new Array<number>()
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
    public readonly price: number          // the price of the underlying
    public readonly expirations: Expiration[]
    public readonly dateMap: Map<string, Expiration>

    constructor( timestamp: string, underlying: string, price: number, expirations: Expiration[] ) {
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
    const loaded: Chain = JSON.parse(String(fs.readFileSync(name))) as Chain
    const expirations: Expiration[] = loaded.expirations.map( expiration => new Expiration(expiration.timestamp, expiration.strikeList))
    const result: Chain = new Chain( loaded.timestamp, loaded.underlying, loaded.price, expirations )
    return result
}

///// helpers /////
export function SideFromSymbol(symbol: string) {
    if(`${symbol.slice(symbol.length - 9, symbol.length - 8)}`.toUpperCase() == "P") {
        return Side.Put
    } else {
        return Side.Call
    }
}

export function StrikePriceFromSymbol(symbol: string) {
    return parseInt(symbol.slice(symbol.length - 8, symbol.length)) / 1000
}

export function ExpirationDateFromSymbol(symbol: string): Date {
    return TimestampToDate(TimestampFromSymbol(symbol))
}

export function TimestampFromSymbol(symbol: string) {
    let day = symbol.slice(symbol.length - 11, symbol.length - 9)
    let month = symbol.slice(symbol.length - 13, symbol.length - 11)
    let year = `20${symbol.slice(symbol.length - 15, symbol.length - 13)}`

    return `${year}-${month}-${day}`;
}

export function AveragePrice(option: Option): number {
    return (option.bid + option.ask) / 2
}