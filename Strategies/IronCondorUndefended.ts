import { Chain } from "./Chain";
import { IMarketStrategy } from "./IMarketStrategy";

export class IronCondorUndefended extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        if(this.ledger.OpenPositions().length == 0) {
            // find a 45 day iron condor and sell it
        }

        // check to see how much time is left on expiration
        // if it is zero, buy it back
    }
}