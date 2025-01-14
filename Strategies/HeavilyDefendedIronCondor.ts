import { Chain } from "./Chain";
import { CSV } from "./CSV";
import { MarketStrategy } from "./MarketStrategy";
import { TransactionLog } from "./TransactionLog";

export class HeavilyDefendedIronCondor implements MarketStrategy {
    private transactions: TransactionLog = new TransactionLog()

    public MaintainPosition(date: string, chain: Chain) {
        if(this.transactions.OpenPositions().length == 0) {
            // sell iron condor at 45 days
        }

        // if open value is less than 50% of open basis, buy it back and sell a new one
        // if it's in the money, roll and extend
        // if we already rolled and extended, buy the worthless end, then invert the side
        // if we only have one side, push it towards out of the money with the proceeds of selling the other wing
    }

    public AccountValue(chain: Chain): bigint {
        return 0n
    }

    public ToCSV(): CSV {
        return this.transactions.ToCSV()
    }
}