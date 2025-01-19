import { Timestamp, TimestampToDte } from '../Utils/DateFunctions';
import { Chain, Expiration, Side, Symbol, Security, ExpirationDateFromSymbol, TimestampFromSymbol, AveragePrice, StrikePriceFromSymbol, SideFromSymbol, SecurityFromSymbol, UnderlyingFromSymbol } from './Chain';
import { CSV } from './CSV';

export enum BuySell {
    Buy = "buy",
    Sell = "sell",
    Assign = "assigned",
    Exercise = "exercise",
    Expire = "expired",
}

export class Transaction {
    public readonly symbol: Symbol
    public readonly execution: string
    public readonly price: bigint
    public readonly action: BuySell
    public readonly quantity: bigint
    public readonly value: bigint

    constructor( symbol: Symbol, execution: string, price: bigint, action: BuySell, quantity: bigint ) {
        this.symbol = symbol
        this.execution = execution
        this.price = price
        this.action = action
        this.quantity = quantity
        this.value = this.price * this.quantity * (action == BuySell.Buy ? -1n : 1n)
    }
}

/**
 * Log transactions in an intuitive way so that we can do a good accounting at the end
 * of a run.  Should be able to get a nice csv out of it.
 */
export class Ledger {
    private open: Map<Symbol, bigint> = new Map<Symbol, bigint>()
    private past: Transaction[] = new Array<Transaction>()

    private FindPrice(chain: Chain, symbol: string): bigint {
        if(SideFromSymbol(symbol) === Side.Underlying) {
            return chain.price
        }

        let exp = chain.dateMap.get(TimestampFromSymbol(symbol)) as Expiration

        if(typeof exp === "undefined") {
            throw new Error(
                `found an UNDEFINED chain for expiration on date ${TimestampFromSymbol(symbol)}. Available expirations:`
                + chain.expirations.map( ex => ex.timestamp ).join( ", " )
            )
        }

        const strikePrice = StrikePriceFromSymbol(symbol)

        let strike = exp.strikeList[0]
        for( let ii = 0; ii < exp.strikeList.length; ii++ ) {
            if( exp.strikeList[ii].price === strikePrice ) {
                strike = exp.strikeList[ii]
                break
            }
        }

        let opt = (SideFromSymbol(symbol) == Side.Call ? strike.call : strike.put) as Security

        return AveragePrice(opt)
    }

    public Buy(symbol: Symbol, execDate: string, price: bigint, quantity: bigint) {
        this.past.push(new Transaction(symbol, execDate, price, BuySell.Buy, quantity))

        if(this.open.has(symbol)) {
            const owned = this.open.get(symbol) as bigint
            if( owned === -quantity ) {
                this.open.delete(symbol)
            } else {
                this.open.set(symbol, owned + quantity)
            }
        } else {
            this.open.set(symbol, quantity)
        }
    }

    public Sell(symbol: Symbol, execDate: string, price: bigint, quantity: bigint) {
        this.past.push(new Transaction(symbol, execDate, price, BuySell.Sell, quantity))

        if(this.open.has(symbol)) {
            const owned = this.open.get(symbol) as bigint
            if( owned === quantity ) {
                this.open.delete(symbol)
            } else {
                this.open.set(symbol, owned - quantity)
            }
        } else {
            this.open.set(symbol, -quantity)
        }
    }

    private ClosePosition(symbol: Symbol, price: bigint, execDate: string, reason: BuySell | undefined = undefined) {
        const quantity = this.open.get(symbol) as bigint
        const action = (typeof reason !== 'undefined') ? (reason as BuySell) : (quantity > 0 ? BuySell.Sell : BuySell.Buy)
        this.past.push(new Transaction(symbol, execDate, price, action, -quantity))
        this.open.delete(symbol)
    }

    public CloseAllOpenPositions(chain: Chain) {
        this.open.forEach( (quantity, symbol) => { this.ClosePosition(symbol, this.FindPrice(chain, symbol), chain.timestamp) } )
    }

    public RealizedPNL(): bigint {
        const sum = this.past.reduce( (accum: bigint, curr: Transaction) => accum + curr.value, 0n )
        const basis = this.OpenPositionBasis()

        return sum + basis
    }

    public OpenPositionValue(chain: Chain): bigint {
        return Array.from(this.open).reduce( (acc, cur) => acc + (this.FindPrice(chain, cur[0]) * cur[1]), 0n )
    }

    // this needs extensive testing
    public OpenPositionBasis(): bigint {
        let sum = 0n

        Array.from(this.open).forEach( kvp => {
            const symbol = kvp[0]
            let qty = kvp[1]
            const long = qty > 0
            let thisBasis = 0n

            for( let ii = this.past.length - 1; ii >= 0; ii-- ) {
                const tx = this.past[ii]
                if( tx.symbol === symbol ) {
                    qty -= tx.quantity
                    thisBasis += tx.price * tx.quantity * (tx.action === BuySell.Buy ? 1n : -1n)
                    if( qty === 0n ) {
                        break
                    } else if ( long && qty <= 0 || !long && qty >= 0 ) {
                        thisBasis -= (tx.quantity - qty) * tx.price
                        break
                    }
                }
            }

            sum += thisBasis
        })

        return sum
    }

    public TotalPNL(chain: Chain): bigint {
        //console.log( `realized: ${this.RealizedPNL()}, open: ${this.OpenPositionValue(chain)}, basis: ${this.OpenPositionBasis()}` )
        return this.RealizedPNL() + (this.OpenPositionValue(chain) - this.OpenPositionBasis())
    }

    public OpenPositions(): Array<[Symbol, bigint]> {
        return Array.from(this.open).sort()
    }

    public ToCSV(): CSV {
        const csv = new CSV( "symbol", "execution date", "price", "action", "quantity", "value" )
        this.past.forEach( tx => csv.push(
            tx.symbol, String(tx.execution), String(tx.price), tx.action, String(tx.quantity), String(tx.value)
        ))

        return csv
    }

    public ResolveEOD(chain: Chain): void {
        this.OpenPositions().forEach( position => {
            const symbol = position[0]
            const side = SideFromSymbol(symbol)
            const expirationDate = Timestamp(ExpirationDateFromSymbol(symbol))
            const dte = TimestampToDte (chain.timestamp, expirationDate)

            if( side !== Side.Underlying && dte < 1 ) {
                const strikePrice = StrikePriceFromSymbol(symbol)
                const otm = side === Side.Call ? strikePrice >= chain.price : strikePrice <= chain.price
                if( !otm ) {
                    this.Assign(symbol, chain.timestamp)
                } else {
                    this.Expire(symbol, chain.timestamp)
                }
            }
        })
    }

    // close all non-option positions at market rate
    public LiquidateUnderlyings(chain: Chain) {}

    // process an assignment event
    private Assign(symbol: Symbol, execDate: string) {
        Array.from(this.open.entries()).filter( kvp => kvp[0] === symbol ).forEach( kvp => {
            this.ClosePosition(kvp[0], 0n, execDate, BuySell.Assign)

            const qty = -1n * kvp[1] * 100n
            const price = StrikePriceFromSymbol(symbol)
            const underlying = UnderlyingFromSymbol(symbol)

            if( SideFromSymbol(symbol) === Side.Call ) {
                this.Sell(underlying, execDate, price, qty)
            } else {
                this.Buy(underlying, execDate, price, qty)
            }
        })
    }

    // process an exercise event
    private Exercise(symbol: Symbol, execDate: string) {
        Array.from(this.open.entries()).filter( kvp => kvp[0] === symbol ).forEach( kvp => {
            this.ClosePosition(kvp[0], 0n, execDate, BuySell.Exercise)

            const qty = kvp[1] * 100n
            const price = StrikePriceFromSymbol(symbol)
            const underlying = UnderlyingFromSymbol(symbol)

            if( SideFromSymbol(symbol) === Side.Call ) {
                this.Buy(underlying, execDate, price, qty)
            } else {
                this.Sell(underlying, execDate, price, qty)
            }
        })
    }

    // process an expiration event
    private Expire(symbol: Symbol, execDate: string) {
        Array.from(this.open.entries()).filter( kvp => kvp[0] === symbol ).forEach( kvp => {
            this.ClosePosition(kvp[0], 0n, execDate, BuySell.Expire)
        })
    }

    public toString(): string {
        return this.ToCSV().toString()
    }
}