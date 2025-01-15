import { Chain, Security, AveragePrice } from './Chain'
import { FindStrike } from './FStrategyHelpers'
import { IMarketStrategy } from './IMarketStrategy'
import { Ledger } from './Ledger'
import { CSV } from './CSV'

export class BuyAndHoldCalls extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        if(this.ledger.OpenPositions().length == 0) {
            const call = FindStrike(chain.expirations[chain.expirations.length - 1], chain.price).call as Security
            this.ledger.Buy(call, date, AveragePrice(call), 1n)
        }
    }
}