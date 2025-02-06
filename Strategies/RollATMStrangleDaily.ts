import { Chain, Security, AveragePrice } from './Chain'
import { IMarketStrategy } from './IMarketStrategy'
import { FindStrike } from './FStrategyHelpers'

export class RollATMStrangleDaily extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        console.log( `processing positions for date: ${date}` )
        this.ledger.CloseAllOpenPositions(chain)
        this.OpenPosition(date, chain)
    }

    private OpenPosition(date: string, chain: Chain) {
        let strike = FindStrike(chain.expirations[1], chain.price)
        let call = strike.call as Security
        let put = strike.put as Security
        this.ledger.Sell(call.symbol, date, AveragePrice(call), 1n)
        this.ledger.Sell(put.symbol, date, AveragePrice(put), 1n)
    }
}