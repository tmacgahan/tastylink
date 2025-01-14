import { Option, Chain, AveragePrice } from "./Chain";
import { CSV } from "./CSV";
import { MarketStrategy } from "./MarketStrategy";
import { FindStrike } from "./StrategyHelpers";
import { TransactionLog } from "./TransactionLog";

export class RollATMStrangleDaily implements MarketStrategy {
    private transactions: TransactionLog = new TransactionLog()

   public  MaintainPosition(date: string, chain: Chain) {
        if(this.transactions.OpenPositions().length == 0) {
            const finalExpiration = chain.expirations[chain.expirations.length - 1]
            const nextExpiration = chain.expirations[1]

            const longDateStrike = FindStrike(finalExpiration, chain.price)
            const shortDateStrike = FindStrike(nextExpiration, chain.price, 10n)

            const longCall = longDateStrike.call as Option
            const shortCall = shortDateStrike.call as Option

            this.transactions.BuyToOpen(longCall, date, AveragePrice(longCall), 1n)
            this.transactions.SellToOpen(shortCall, date, AveragePrice(shortCall), 1n)
        }

        // check to see how much time is left on expiration
        // if it is less than a certain amount, roll it
    }

    public AccountValue(chain: Chain): bigint {
        return this.transactions.TotalPNL(chain)
    }

    public ToCSV(): CSV {
        return this.transactions.ToCSV()
    }
}