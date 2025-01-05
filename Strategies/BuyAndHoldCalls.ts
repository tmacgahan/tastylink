import { Chain, Expiration, Option, Strike, StrikePriceFromSymbol, AveragePrice, TimestampFromSymbol } from './Chain'
import { FindAtTheMoneyStrike } from './StrategyHelpers'
import { MarketStrategy } from './MarketStrategy'

export class BuyAndHoldCalls implements MarketStrategy {
    private startDate: string
    private accountCash: number
    private call: Option | null

    constructor(startDate: string) {
        this.startDate = startDate
        this.accountCash = 0
        this.call = null
    }

    // we should be able to repeatedly call this with expiration date data
    public MaintainPosition(date: string, chain: Chain) {
        if( date == this.startDate ) {
            this.OpenPosition(chain)
        }
    }

    private OpenPosition(chain: Chain) {
        let expiration = chain.expirations[chain.expirations.length - 1]
        let atmStrike = FindAtTheMoneyStrike(expiration, chain.price)
        this.call = atmStrike.call as Option
        this.accountCash -= AveragePrice(this.call)
    }

    private ClosePosition(chain: Chain) {
        this.accountCash = this.AccountValue(chain);
        this.call = null;
    }

    public AccountValue(chain: Chain): number {
        let call = this.call as Option
        let symbol = call.symbol
        let exp = chain.dateMap.get(TimestampFromSymbol(symbol)) as Expiration
        let strike = exp.map.get(StrikePriceFromSymbol(symbol)) as Strike
        return AveragePrice(strike.call as Option) + this.accountCash
    }

    public Results(): string {
        return `ending account cash: $${this.accountCash.toFixed(2)}`
    }
}
