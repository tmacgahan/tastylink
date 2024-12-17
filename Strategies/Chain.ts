import { set } from "fp-ts";
import { TimestampToDate } from "../Utils/DateFunctions";

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
    public readonly dateMap: Map<Date, Expiration>;

    constructor( date: Date, underlying: string, price: number, expirations: Expiration[] ) {
        expirations.sort( (date1, date2) => date1.date.getTime() - date2.date.getTime() )
        this.date = date;
        this.underlying = underlying;
        this.price = price;
        this.expirations = expirations

        let dateMap: Map<Date, Expiration> = new Map<Date, Expiration>();
        expirations.forEach( exp => dateMap.set(exp.date, exp));
        this.dateMap = dateMap;
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

export function ExpirationDateFromSymbol(symbol: string): Date {
    return TimestampToDate(TimestampFromSymbol(symbol))
}

export function TimestampFromSymbol(symbol: string) {
    let day = symbol.slice(symbol.length - 11, symbol.length - 9);
    let month = symbol.slice(symbol.length - 13, symbol.length - 11);
    let year = `20${symbol.slice(symbol.length - 15, symbol.length - 13)}`;

    return `${year}-${month}-${day}`;
}

export function AveragePrice(option: Option): number {
    return (option.bid + option.ask) / 2
}