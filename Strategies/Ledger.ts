import { Timestamp, TimestampToDte } from '../Utils/DateFunctions';
import { Chain, Expiration, Side, Strike, Security, ExpirationDateFromSymbol, TimestampFromSymbol, AveragePrice, StrikePriceFromSymbol } from './Chain';
import { CSV } from './CSV';

export enum BuySell {
    Buy = "buy",
    Sell = "sell",
}

export function Opposite(action: BuySell) {
    return action === BuySell.Buy ? BuySell.Sell : BuySell.Buy
}

export class Transaction {
    public readonly security: Security
    public readonly strike: bigint
    public readonly execution: string
    public readonly price: bigint
    public readonly action: BuySell
    public readonly quantity: bigint
    public readonly value: bigint

    constructor( security: Security, strike: bigint, execution: string, price: bigint, action: BuySell, quantity: bigint ) {
        this.security = security
        this.strike = strike
        this.execution = execution
        this.price = price
        this.action = action
        this.quantity = quantity
        this.value = this.price * this.quantity * (action == BuySell.Buy ? -1n : 1n)
    }
}

interface PositionData {
    quantity: bigint,
    basis: bigint,
}

/**
 * Log transactions in an intuitive way so that we can do a good accounting at the end
 * of a run.  Should be able to get a nice csv out of it.
 */
export class Ledger {
    private open: Map<string, PositionData> = new Map<string, PositionData>()
    private past: Transaction[] = new Array<Transaction>()

    private FindPrice(chain: Chain, tx: Transaction): bigint {
        let exp = chain.dateMap.get(TimestampFromSymbol(tx.security.symbol)) as Expiration

        if(typeof exp === "undefined") {
            throw new Error(
                `found an UNDEFINED chain for expiration on date ${TimestampFromSymbol(tx.security.symbol)}. Available expirations:`
                + chain.expirations.map( ex => ex.timestamp ).join( ", " )
            )
        }

        let strike = exp.map.get(tx.strike) as Strike
        let opt = (tx.security.side == Side.Call ? strike.call : strike.put) as Security

        return AveragePrice(opt)
    }

    public Buy(security: Security, execDate: string, price: bigint, quantity: bigint) {
        this.past.push(new Transaction(security, StrikePriceFromSymbol(security.symbol), execDate, price, BuySell.Buy, quantity))
        if(
        // log the transaction and quantity, then apply the quantity to open positions.
        // when done, check the position for equality to zero, and if zero remove it from the
        // map
    }

    public Sell(security: Security, execDate: string, price: bigint, quantity: bigint) {
        this.past.push(new Transaction(security, StrikePriceFromSymbol(security.symbol), execDate, price, BuySell.Buy, quantity))
        // log the transaction and quantity, then apply the quantity to open positions.
        // when done, check the position for equality to zero, and if zero remove it from the
        // map
    }

    private ClosePosition(key: PositionID, price: bigint) {
        const val = this.open.get(key) as Transaction
        this.past.push(new Transaction(val.security, val.strike, val.execution, price, Opposite(val.action), val.quantity))
        this.past.push(val)
        this.open.delete(key)
    }

    public CloseAllOpenPositions(chain: Chain) {
        this.open.forEach( (_, key) => { this.ClosePosition(key, this.FindPrice(chain, this.open.get(key) as Transaction)) })
    }

    public RealizedPNL(): bigint {
        return this.past.reduce( (accum: bigint, curr: Transaction) => accum + curr.value * curr.quantity, 0n )
    }

    public OpenPositionValue(chain: Chain): bigint {
        console.log(this.open)
        return Array.from(this.open.values())
            .reduce( (accum: bigint, curr: Transaction) => accum
                + (this.FindPrice(chain, curr) * (curr.action === BuySell.Buy ? 1n : -1n) * curr.quantity), 0n
            )
    }

    public OpenPositionBasis(): bigint {
        return Array.from(this.open.values()).reduce( (accum: bigint, curr: Transaction) => accum + curr.value, 0n )
    }

    public TotalPNL(chain: Chain): bigint {
        return this.RealizedPNL() + (this.OpenPositionValue(chain) + this.OpenPositionBasis())
    }

    public OpenPositions(): Security[] {
        return Array.from(this.open.values()).map( tx => tx.security )
    }

    public ToCSV(): CSV {
        const csv = new CSV( "option symbol", "strike", "execution date", "price", "action", "quantity", "value" )
        this.past.forEach( tx => csv.push(
            tx.security.symbol, String(tx.strike), String(tx.execution), String(tx.price), tx.action, String(tx.quantity), String(tx.value)
        ))
        this.open.forEach( tx => csv.push(
            tx.security.symbol, String(tx.strike), String(tx.execution), String(tx.price), tx.action, String(tx.quantity), String(tx.value)
        ))
        csv.sortBy("execution date")

        return csv
    }

    public ResolveEOD(chain: Chain): void {
        this.OpenPositions().forEach( tx => {
            const expirationDate = Timestamp(ExpirationDateFromSymbol(tx.symbol))
            const dte = TimestampToDte (chain.timestamp, expirationDate)

            if( tx.side != Side.Underlying && dte < 1 ) {
                // is it long or short?
                // if short and itm assign
                // if long and itm exercise

                const strikePrice = StrikePriceFromSymbol(tx.symbol)
                const otm = tx.side === Side.Call ? strikePrice >= chain.price : strikePrice >= chain.price
                const worth = otm ? 0 : chain.price - strikePrice * ( tx.side === Side.Call ? 1n : -1n )
                if( !otm ) {
                }
            }
        })
    }

    // close all non-option positions at market rate
    public LiquidateUnderlyings(chain: Chain) {}

    // process an assignment event
    private Assign(security: Security) {
        Array.from(this.open.entries()).filter( kvp => { kvp[1].security.symbol === security.symbol }).forEach( kvp => {
            this.ClosePosition(kvp[0], 0n)
            const qty = kvp[1].quantity
            if(security.side === Side.Call) {
                // we need to sell to close the amount of underlying we have, and sell to open the amount that we do not
                console.log( "implement me!" )
            }
        })
    }

    // process an exercise event
    private Exercise(security: Security) {}

    // process an expiration event
    private Expire(security: Security) {
        Array.from(this.open.entries()).filter( kvp => { kvp[1].security.symbol === security.symbol }).forEach( kvp => {
            this.ClosePosition(kvp[0], 0n)
        })
    }

    public toString(): string {
        return this.ToCSV().toString()
    }
}