import { Chain, Expiration, Side, Strike, Option, ExpirationDateFromSymbol, TimestampFromSymbol } from './Chain';

export enum BuySell {
    Buy = "buy",
    Sell = "sell",
}

export function Opposite(action: BuySell) {
    return action === BuySell.Buy ? BuySell.Sell : BuySell.Buy
}

export class Transaction {
    public readonly option: Option
    public readonly strike: number
    public readonly execution: string
    public readonly price: number
    public readonly action: BuySell
    public readonly quantity: number
    public readonly value: number

    constructor( option: Option, strike: number, execution: string, price: number, action: BuySell, quantity: number ) {
        this.option = option
        this.strike = strike
        this.execution = execution
        this.price = price
        this.action = action
        this.quantity = quantity
        this.value = this.price * this.quantity * (action == BuySell.Buy ? -1 : 1)
    }
}

interface PositionID {
    side: Side,
    strike: number,
    action: BuySell
}

export class TransactionLog {
    private open: Map<PositionID, Transaction> = new Map<PositionID, Transaction>()
    private past: Transaction[] = new Array<Transaction>()

    private FindPrice(chain: Chain, tx: Transaction): number {
        let exp = chain.dateMap.get(TimestampFromSymbol(tx.option.symbol)) as Expiration

        if(typeof exp === "undefined") {
            throw new Error(
                `found an UNDEFINED chain for expiration on date ${TimestampFromSymbol(tx.option.symbol)}. Available expirations:`
                + chain.expirations.map( ex => ex.timestamp ).join( ", " )
            )
        }

        let strike = exp.map.get(tx.strike) as Strike
        let opt = (tx.option.side == Side.Call ? strike.call : strike.put) as Option

        return (opt.bid + opt.ask) / 2
    }

    public BuyToOpen(option: Option, strike: number, timestamp: string, price: number, quantity: number) {
        const tx = new Transaction(option, strike, timestamp, price, BuySell.Buy, quantity)
        this.open.set({side: option.side, strike: strike, action: BuySell.Buy}, tx)
    }

    public SellToOpen(option: Option, strike: number, timestamp: string, price: number, quantity: number) {
        const tx = new Transaction(option, strike, timestamp, price, BuySell.Buy, quantity)
        this.open.set({side: option.side, strike: strike, action: BuySell.Sell},tx)
    }

    public BuyToClose(option: Option, strike: number, timestamp: string, price: number, quantity: number) {
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

    public SellToClose(option: Option, strike: number, timestamp: string, price: number, quantity: number) {
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

    public RealizedPNL(): number {
        return this.past.reduce( (accum: number, curr: Transaction) => accum + curr.value, 0 )
    }

    public OpenPositionValue(chain: Chain): number {
        return Array.from(this.open.values()).reduce( (accum: number, curr: Transaction) => accum + this.FindPrice(chain, curr), 0 )
    }

    public TotalPNL(chain: Chain): number {
        return this.RealizedPNL() + this.OpenPositionValue(chain)
    }
}