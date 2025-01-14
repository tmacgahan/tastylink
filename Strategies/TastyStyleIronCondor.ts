import { Chain } from "./Chain";
import { MarketStrategy } from "./MarketStrategy";
import { TransactionLog } from "./TransactionLog";

export class TastyStyleIronCondor implements MarketStrategy {
    private transactions: TransactionLog = new TransactionLog()

    MaintainPosition(date: string, chain: Chain) {
        if(this.transactions.OpenPositions().length == 0) {
            // find 45 day iron condor and sell it
        }

            // if below 50% of opening value, buy it back
            // if above 200% of opening value, buy it back
            // if it's 21 days or less to expiration, buy it back
            // if bought it back, sell a new one
    }

    AccountValue(chain: Chain): bigint {
        return 0n
    }
}