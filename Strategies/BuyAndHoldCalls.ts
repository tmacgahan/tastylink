import { Chain, Expiration, Option, Strike, ExpirationDateFromSymbol, StrikePriceFromSymbol, AveragePrice } from './Chain.js'

export class BuyAndHoldCalls {
    private startDate: string
    private accountCash: number
    private call: Option | null

    constructor(startDate: string) {
        this.startDate = startDate;
        this.accountCash = 0;
    }

    // we should be able to repeatedly call this with expiration date data
    public MaintainPosition(date: string, chain: Chain) {
        if( date == this.startDate ) {
            this.OpenPosition(chain)
        }
    }

    public OpenPosition(chain: Chain) {
        let expiration = chain.expirations[chain.expirations.length - 1]
        let atmStrike = FindAtTheMoneyStrike(expiration, chain.price);
        this.call = atmStrike.call as Option;
        this.accountCash -= AveragePrice(this.call)
    }

    public ClosePosition(chain: Chain) {
        this.accountCash = this.AccountValue(chain);
        this.call = null;
    }

    public AccountValue(chain: Chain): number {
        let call = this.call as Option
        let symbol = call.symbol
        let exp = chain.dateMap.get(ExpirationDateFromSymbol(symbol)) as Expiration
        let strike = exp.map.get(StrikePriceFromSymbol(symbol)) as Strike
        return AveragePrice(strike.call as Option) + this.accountCash;
    }
}

export function FindAtTheMoneyStrike(expiration: Expiration, money: Number): Strike {
    let found: boolean = false
    for( let ii = 0; ii < expiration.strikes.length; ii++) {
        if( money >= expiration.strikes[ii] ){
            return expiration.map.get(expiration.strikes[ii]) as Strike;
        }
    }

    return expiration.map.get(expiration.strikes[expiration.strikes.length -1]) as Strike;
}