
import { AveragePrice, Chain, Security, Side, SideFromSymbol } from "./Chain";
import { FindExpiration, FindStrike } from "./FStrategyHelpers";
import { IMarketStrategy } from "./IMarketStrategy";

export class Wheel extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        const openPositions = this.ledger.OpenPositions()
        if( openPositions.length === 2 ) {
            // do nothing (this should be a long stock and a covered call
        } else if( openPositions.length === 0 ) {
            // sell a put
            const strike = FindStrike(FindExpiration(chain, 4, 7), chain.price, -(chain.price / 55n))
            const put = strike.put as Security
            // console.log( `SPY: ${chain.price}, short put: @${strike.price}` )
            this.ledger.Sell(put.symbol, chain.timestamp, AveragePrice(put) * 100n, 1n)
        } else if( openPositions.length === 1 ) {
            // determine if we have an outstanding put, or if we are long stock
            const position = Array.from(this.ledger.OpenPositions())[0][0]
            const side = SideFromSymbol(position)

            // if we are long stock, sell a call
            // otherwise we have a put, and we should just let it expire / get assigned
            if( side === Side.Underlying ) { 
                const strike = FindStrike(FindExpiration(chain, 8, 21), chain.price, (chain.price / 50n))
                const call = strike.call as Security
                // console.log( `SPY: ${chain.price}, short call: @${strike.price}` )
                this.ledger.Sell(call.symbol, chain.timestamp, AveragePrice(call) * 100n, 1n)
            }
        }
    }
}