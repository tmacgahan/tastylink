import { Timestamp } from '../Utils/DateFunctions';
import { AveragePrice, Chain, Security, Expiration, ExpirationDateFromSymbol } from './Chain';
import { FindExpiration, FindStrike } from "./FStrategyHelpers";
import { IMarketStrategy } from "./IMarketStrategy";

export class IronCondorUndefended extends IMarketStrategy {
    public MaintainPosition(date: string, chain: Chain) {
        // check to see how much time is left on expiration
        // if it is zero, buy it back
        if(this.ledger.OpenPositions().length != 0){
            if(chain.timestamp === Timestamp(ExpirationDateFromSymbol(this.ledger.OpenPositions()[0][0]))) {
                this.ledger.CloseAllOpenPositions(chain)
            }
        }

        // whether we're opening for the first time, we expired, or we bought back, we should open a new condor
        if(this.ledger.OpenPositions().length == 0) {
            this.SellCondor(chain)
        }
    }

    private SellCondor(chain: Chain) {
        const exp = FindExpiration(chain, 8, 21)
        const shortCall = FindStrike(exp, chain.price, (chain.price / 50n)).call as Security
        const longCall = FindStrike(exp, chain.price, (chain.price / 50n) + 10n ).call as Security

        const shortPut = FindStrike(exp, chain.price, -(chain.price / 50n)).call as Security
        const longPut = FindStrike(exp, chain.price, -(chain.price / 50n) - 10n ).call as Security

        this.ledger.Sell(shortCall.symbol, chain.timestamp, AveragePrice(shortCall), 1n)
        this.ledger.Buy(longCall.symbol, chain.timestamp, AveragePrice(longCall), 1n)
        this.ledger.Sell(shortPut.symbol, chain.timestamp, AveragePrice(shortPut), 1n)
        this.ledger.Buy(longPut.symbol, chain.timestamp, AveragePrice(longPut), 1n)
    }
}