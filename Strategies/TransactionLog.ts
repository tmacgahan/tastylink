import { Chain, Expiration, Side, Strike, Option } from "./Chain";

export enum BuySell {
    Buy = "buy",
    Sell = "sell",
}

export function Opposite(action: BuySell) {
    return action === BuySell.Buy ? BuySell.Sell : BuySell.Buy
}

export class Transaction {
    public readonly side: Side
    public readonly strike: number
    public readonly timestamp: string
    public readonly price: number
    public readonly action: BuySell
    public readonly quantity: number

    constructor( side: Side, strike: number, timestamp: string, price: number, action: BuySell, quantity: number ) {
        this.side = side
        this.strike = strike
        this.timestamp = timestamp
        this.price = price
        this.action = action
        this.quantity = quantity
    }
}

interface PositionID {
    side: Side,
    strike: number,
    action: BuySell
}

export class TransactionLog {
    private open: Map<PositionID, Transaction> = new Map<PositionID, Transaction>()
    private all: Transaction[] = new Array<Transaction>()

    private FindPrice(chain: Chain, tx: Transaction): number {
        let exp = chain.dateMap.get(tx.timestamp) as Expiration
        let strike = exp.map.get(tx.strike) as Strike
        let opt = (tx.side == Side.Call ? strike.call : strike.put) as Option

        return (opt.bid + opt.ask) / 2
    }

    public BuyToOpen(side: Side, strike: number, timestamp: string, price: number, quantity: number) {
        const tx = new Transaction(side, strike, timestamp, price, BuySell.Buy, quantity)
        this.all.push(tx)
        this.open.set({side: side, strike: strike, action: BuySell.Buy}, tx)
    }

    public SellToOpen(side: Side, strike: number, timestamp: string, price: number, quantity: number) {
        const tx = new Transaction(side, strike, timestamp, price, BuySell.Buy, quantity)
        this.all.push(tx)
        this.open.set({side: side, strike: strike, action: BuySell.Sell},tx)
    }

    public BuyToClose(side: Side, strike: number, timestamp: string, price: number, quantity: number) {
        const tx = new Transaction(side, strike, timestamp, price, BuySell.Buy, quantity)
        this.all.push(tx)

        const id = { side: side, strike: strike, action: BuySell.Sell }
        if(this.open.has(id)) {
            let openTx = this.open.get(id) as Transaction
            this.open.delete(id)
            if( openTx.quantity > quantity ) {
                this.open.set(id, new Transaction(openTx.side, openTx.strike, openTx.timestamp, openTx.price, openTx.action, openTx.quantity - quantity))
            } else if( openTx.quantity < quantity ) {
                this.open.set(id, new Transaction(openTx.side, openTx.strike, timestamp, price, BuySell.Buy, quantity - openTx.price))
            }
        }
    }

    public SellToClose(side: Side, strike: number, timestamp: string, price: number, quantity: number) {
        const tx = new Transaction(side, strike, timestamp, price, BuySell.Sell, quantity)
        this.all.push(tx)

        const id = { side: side, strike: strike, action: BuySell.Buy }
        if(this.open.has(id)) {
            let openTx = this.open.get(id) as Transaction
            this.open.delete(id)
            if( openTx.quantity > quantity ) {
                this.open.set(id, new Transaction(openTx.side, openTx.strike, openTx.timestamp, openTx.price, openTx.action, openTx.quantity - quantity))
            } else if( openTx.quantity < quantity ) {
                this.open.set(id, new Transaction(openTx.side, openTx.strike, timestamp, price, BuySell.Sell, quantity - openTx.price))
            }
        }
    }

    public CloseAllOpenPositions(chain: Chain) {
        this.open.forEach( (val, key) => 
            this.all.push(new Transaction(val.side, val.strike, val.timestamp, this.FindPrice(chain, val), Opposite(val.action), val.quantity))
        )

        this.open.clear();
    }
}