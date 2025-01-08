import { Chain, Expiration, Option, Strike, StrikePriceFromSymbol, AveragePrice, TimestampFromSymbol } from './Chain'
import { MarketStrategy } from './MarketStrategy'
import { FindAtTheMoneyStrike } from './StrategyHelpers'
import { TransactionLog } from './TransactionLog'

export class RollATMStrangleDaily implements MarketStrategy {
    private positionOpened: boolean = false
    private transactions: TransactionLog = new TransactionLog()

    public MaintainPosition(date: string, chain: Chain) {
        console.log( `processing positions for date: ${date}` )
        this.transactions.CloseAllOpenPositions(chain)
        this.OpenPosition(date, chain)
    }

    private OpenPosition(date: string, chain: Chain) {
        let strike = FindAtTheMoneyStrike(chain.expirations[1], chain.price)
        let call = strike.call as Option
        let put = strike.put as Option
        this.transactions.SellToOpen(call, strike.price, date, AveragePrice(call), 1n)
        this.transactions.SellToOpen(put, strike.price, date, AveragePrice(put), 1n)
    }

    public AccountValue(chain: Chain): bigint {
        return this.transactions.TotalPNL(chain)
    }
}