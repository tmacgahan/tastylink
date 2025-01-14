import { Chain } from "./Chain";
import { CSV } from "./CSV";
import { MarketStrategy } from "./MarketStrategy";
import { TransactionLog } from "./TransactionLog";

export class IronCondorUndefended implements MarketStrategy {
    private transactions: TransactionLog = new TransactionLog()

    public MaintainPosition(date: string, chain: Chain) {
        if(this.transactions.OpenPositions().length == 0) {
            // find a 45 day iron condor and sell it
        }

        // check to see how much time is left on expiration
        // if it is zero, buy it back
    }

    public AccountValue(chain: Chain): bigint {
        return 0n
    }

    public ToCSV(): CSV {
        return this.transactions.ToCSV()
    }
}