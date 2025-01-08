import { Chain, Expiration, Side, Strike, Option, ExpirationDateFromSymbol, TimestampFromSymbol, AveragePrice } from './Chain';

export enum BuySell {
    Buy = "buy",
    Sell = "sell",
}

export function Opposite(action: BuySell) {
    return action === BuySell.Buy ? BuySell.Sell : BuySell.Buy
}

export class Transaction {
    public readonly option: Option
    public readonly strike: bigint
    public readonly execution: string
    public readonly price: bigint
    public readonly action: BuySell
    public readonly quantity: bigint
    public readonly value: bigint

    constructor( option: Option, strike: bigint, execution: string, price: bigint, action: BuySell, quantity: bigint ) {
        this.option = option
        this.strike = strike
        this.execution = execution
        this.price = price
        this.action = action
        this.quantity = quantity
        this.value = this.price * this.quantity * (action == BuySell.Buy ? -1n : 1n)
    }
}

interface PositionID {
    side: Side,
    strike: bigint,
    action: BuySell
}

export class TransactionLog {
    private open: Map<PositionID, Transaction> = new Map<PositionID, Transaction>()
    private past: Transaction[] = new Array<Transaction>()

    private FindPrice(chain: Chain, tx: Transaction): bigint {
        let exp = chain.dateMap.get(TimestampFromSymbol(tx.option.symbol)) as Expiration

        if(typeof exp === "undefined") {
            throw new Error(
                `found an UNDEFINED chain for expiration on date ${TimestampFromSymbol(tx.option.symbol)}. Available expirations:`
                + chain.expirations.map( ex => ex.timestamp ).join( ", " )
            )
        }

        let strike = exp.map.get(tx.strike) as Strike
        let opt = (tx.option.side == Side.Call ? strike.call : strike.put) as Option

        return AveragePrice(opt)
    }

    public BuyToOpen(option: Option, strike: bigint, timestamp: string, price: bigint, quantity: bigint) {
        const tx = new Transaction(option, strike, timestamp, price, BuySell.Buy, quantity)
        this.open.set({side: option.side, strike: strike, action: BuySell.Buy}, tx)
    }

    public SellToOpen(option: Option, strike: bigint, timestamp: string, price: bigint, quantity: bigint) {
        const tx = new Transaction(option, strike, timestamp, price, BuySell.Sell, quantity)
        this.open.set({side: option.side, strike: strike, action: BuySell.Sell},tx)
    }

    public BuyToClose(option: Option, strike: bigint, timestamp: string, price: bigint, quantity: bigint) {
        const tx = new Transaction(option, strike, timestamp, price, BuySell.Buy, quantity)

        const id = { side: option.side, strike: strike, action: BuySell.Sell }
        if(this.open.has(id)) {
            let openTx = this.open.get(id) as Transaction
            this.open.delete(id)
            this.past.push(openTx)
            if( openTx.quantity > quantity ) {
                this.open.set(id, new Transaction(openTx.option, openTx.strike, openTx.execution, openTx.price, openTx.action, openTx.quantity - quantity))
            } else if( openTx.quantity < quantity ) {
                this.open.set(id, new Transaction(openTx.option, openTx.strike, timestamp, price, BuySell.Buy, quantity - openTx.price))
            }
        }

        this.past.push(tx)
    }

    public SellToClose(option: Option, strike: bigint, timestamp: string, price: bigint, quantity: bigint) {
        const tx = new Transaction(option, strike, timestamp, price, BuySell.Sell, quantity)

        const id = { side: option.side, strike: strike, action: BuySell.Buy }
        if(this.open.has(id)) {
            let openTx = this.open.get(id) as Transaction
            this.open.delete(id)
            this.past.push(openTx)
            if( openTx.quantity > quantity ) {
                this.open.set(id, new Transaction(openTx.option, openTx.strike, openTx.execution, openTx.price, openTx.action, openTx.quantity - quantity))
            } else if( openTx.quantity < quantity ) {
                this.open.set(id, new Transaction(openTx.option, openTx.strike, timestamp, price, BuySell.Sell, quantity - openTx.price))
            }
        }

        this.past.push(tx)
    }

    public CloseAllOpenPositions(chain: Chain) {
        this.open.forEach( (val, key) => {
            this.past.push(new Transaction(val.option, val.strike, val.execution, this.FindPrice(chain, val), Opposite(val.action), val.quantity))
            this.past.push(val)
        })

        this.open.clear()
    }

    public RealizedPNL(): bigint {
        return this.past.reduce( (accum: bigint, curr: Transaction) => accum + curr.value * curr.quantity, 0n )
    }

    public OpenPositionValue(chain: Chain): bigint {
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
}