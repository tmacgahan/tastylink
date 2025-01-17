
import { Chain, Security } from "./Chain";
import { FindExpiration, FindStrike } from "./FStrategyHelpers";
import { IMarketStrategy } from "./IMarketStrategy";

export class TastyStyleIronCondor extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        const openPositions = this.ledger.OpenPositions()
        if( openPositions.length === 2 ) {
            // do nothing (this should be a long stock and a covered call
        } else if( openPositions.length === 0 ) {
            // sell a put
            const strike = FindStrike(FindExpiration(chain, 8, 21), -(chain.price / 50n))
            this.ledger.Sell(strike.put as Security, chain.timestamp, chain.price, 1n)
        } else if( openPositions.length === 1 ) {
            // sell a call
            const strike = FindStrike(FindExpiration(chain, 8, 21), (chain.price / 50n))
            this.ledger.Sell(strike.call as Security, chain.timestamp, chain.price, 1n)
        }
    }
}