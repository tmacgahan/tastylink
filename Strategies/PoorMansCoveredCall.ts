import { Chain } from "./Chain";
import { MarketStrategy } from "./MarketStrategy";
import { TransactionLog } from "./TransactionLog";

export class RollATMStrangleDaily implements MarketStrategy {
    private transactions: TransactionLog = new TransactionLog()

    MaintainPosition(date: string, chain: Chain) {
        if(this.transactions.OpenPositions().length == 0) {
            // find at the money long call of a certain expiration
            // find out of the money short call of a certain expiration
            // buy the long dated call sell the short dated call
        }

        // check to see how much time is left on expiration
        // if it is less than a certain amount, roll it
    }

    AccountValue(chain: Chain): bigint {
        return 0n
    }
}