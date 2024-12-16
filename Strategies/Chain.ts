import { set } from "fp-ts";

export enum Side {
    Put = "PUT",
    Call = "CALL",
}

export interface Option {
    bid: number;
    ask: number;
    side: Side;
    symbol: string;
}

export interface Strike {
    price: number;  // strike price, market prices will always be bid / ask
    call: Option | null;
    put: Option | null;
}

export class Expiration {
    public readonly date: Date;     // the date of expiration in question
    public readonly strikes: Number[];
    public readonly map: Map<Number, Strike>;

    constructor( date: Date, strikes: Array<Strike> ) {
        this.date = date;
        strikes.sort( (strike1, strike2) => strike1.price - strike2.price );
        let map: Map<Number, Strike> = new Map<Number, Strike>();
        this.strikes = new Array<Number>();
        strikes.forEach( (strike) => {
            map.set(strike.price, strike)
            this.strikes.push(strike.price);
        });
        this.map = map;
    }
}

export class Chain {
    public readonly date: Date;             // the date for which the chain was pulled
    public readonly underlying: string;
    public readonly price: number;          // the price of the underlying
    public readonly expirations: Expiration[];

    constructor( date: Date, underlying: string, price: number, expirations: Expiration[] ) {
        this.date = date;
        this.underlying = underlying;
        this.price = price;
        this.expirations = expirations
    }
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