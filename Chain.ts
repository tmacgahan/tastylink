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
    price: number;
    call: Option;
    put: Option;
}

export class Expiration {
    private date: Date;     // the date of expiration in question
    private strikes: Strike[];

    constructor( setDate: Date ) {
        this.date = setDate;
        this.strikes = new Array();
    }

    public pushStrike( strike: Strike ) {
        this.strikes.push( strike );
    }
}

export class Chain {
    private date: Date;             // the date for which the chain was pulled
    private underlying: string;
    private price: number;          // the price of the underlying
    private expirations: Expiration[];

    constructor( setDate: Date, setUnderlying: string, setPrice: number ) {
        this.date = setDate;
        this.underlying = setUnderlying;
        this.price = setPrice;
        this.expirations = new Array();
    }

    public pushExpiration( expiration: Expiration ) {
        this.expirations.push( expiration ); // we should sort this
    }
}