import { Security, Chain, AveragePrice } from "./Chain";
import { CSV } from "./CSV";
import { IMarketStrategy } from "./IMarketStrategy";
import { FindStrike } from "./FStrategyHelpers";

export class RollATMStrangleDaily extends IMarketStrategy {
   public  MaintainPosition(date: string, chain: Chain) {
        if(this.ledger.OpenPositions().length == 0) {
            const finalExpiration = chain.expirations[chain.expirations.length - 1]
            const nextExpiration = chain.expirations[1]

            const longDateStrike = FindStrike(finalExpiration, chain.price)
            const shortDateStrike = FindStrike(nextExpiration, chain.price, 10n)

            const longCall = longDateStrike.call as Security
            const shortCall = shortDateStrike.call as Security

            this.ledger.Buy(longCall.symbol, date, AveragePrice(longCall), 1n)
            this.ledger.Sell(shortCall.symbol, date, AveragePrice(shortCall), 1n)
        }

        // check to see how much time is left on expiration
        // if it is less than a certain amount, roll it
    }
}