import { Chain } from "./Chain";
import { IMarketStrategy } from "./IMarketStrategy";

export class TastyStyleIronCondor extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        if(this.ledger.OpenPositions().length == 0) {
            // find 45 day iron condor and sell it
        }

            // if below 50% of opening value, buy it back
            // if above 200% of opening value, buy it back
            // if it's 21 days or less to expiration, buy it back
            // if bought it back, sell a new one
    }
}