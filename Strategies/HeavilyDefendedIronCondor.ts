import { Chain } from "./Chain";
import { IMarketStrategy } from "./IMarketStrategy";
import { Ledger } from "./Ledger";

export class HeavilyDefendedIronCondor extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        if(this.ledger.OpenPositions().length == 0) {
            // sell iron condor at 45 days
        }

        // if open value is less than 50% of open basis, buy it back and sell a new one
        // if it's in the money, roll and extend
        // if we already rolled and extended, buy the worthless end, then invert the side
        // if we only have one side, push it towards out of the money with the proceeds of selling the other wing
    }
}