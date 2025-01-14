import { Chain, Expiration, Option, Strike, StrikePriceFromSymbol, AveragePrice, TimestampFromSymbol } from './Chain'
import { FindAtTheMoneyStrike } from './StrategyHelpers'
import { MarketStrategy } from './MarketStrategy'
import { TransactionLog } from './TransactionLog'
import { CSV } from './CSV'

export class BuyAndHoldCalls implements MarketStrategy {
    private startDate: string
    private transactions: TransactionLog = new TransactionLog()

    constructor(startDate: string) {
        this.startDate = startDate
    }

    public MaintainPosition(date: string, chain: Chain) {
        if(this.transactions.OpenPositions().length == 0) {
            const call = FindAtTheMoneyStrike(chain.expirations[chain.expirations.length - 1], chain.price).call as Option
            this.transactions.BuyToOpen(call, date, AveragePrice(call), 1n)
        }
    }

    public AccountValue(chain: Chain): bigint {
        return this.transactions.TotalPNL(chain)
    }

    public ToCSV(): CSV {
        return this.transactions.ToCSV()
    }
}
