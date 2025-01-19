
import { Chain, Security, Side, SideFromSymbol } from "./Chain";
import { FindExpiration, FindStrike } from "./FStrategyHelpers";
import { IMarketStrategy } from "./IMarketStrategy";

export class Wheel extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        console.log( `${chain.underlying} on ${date}: ${chain.price}` )

        const openPositions = this.ledger.OpenPositions()
        if( openPositions.length === 2 ) {
            // do nothing (this should be a long stock and a covered call
        } else if( openPositions.length === 0 ) {
            // sell a put
            const strike = FindStrike(FindExpiration(chain, 2, 7), -(chain.price / 50n))
            this.ledger.Sell((strike.put as Security).symbol, chain.timestamp, chain.price, 1n)
        } else if( openPositions.length === 1 ) {
            // determine if we have an outstanding put, or if we are long stock
            const position = Array.from(this.ledger.OpenPositions())[0][0]
            const side = SideFromSymbol(position)

            // if we are long stock, sell a call
            // otherwise we have a put, and we should just let it expire / get assigned
            if( side === Side.Underlying ) { 
                const strike = FindStrike(FindExpiration(chain, 8, 21), (chain.price / 50n))
                this.ledger.Sell((strike.call as Security).symbol, chain.timestamp, chain.price, 1n)
            }
        }
    }
}