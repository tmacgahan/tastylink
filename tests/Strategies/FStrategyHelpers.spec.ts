import { expect } from 'chai'
import 'mocha';
import { SecurityFromSymbol, Strike, Expiration, Chain } from '../../Strategies/Chain';
import { FindStrike, FindExpiration } from '../../Strategies/FStrategyHelpers';

function BuildTestExpiration(timestamp: string) {
    const strikes = new Array<Strike>()

    for( let ii = 1; ii < 51; ii++ ) {
        const price = 75n * 100n + BigInt(ii) * 100n
        const bidask = BigInt((25 - Math.abs((25 - ii))) * 25)
        strikes.push({
            price: price,
            call: SecurityFromSymbol(`SPY241123C00${price}0`, bidask, bidask),
            put: SecurityFromSymbol(`SPY241123P00${price}0`, bidask, bidask),
        })
    }

    return new Expiration(timestamp, strikes)
}

function BuildTestChain() {
    return new Chain("2024-11-01", "SPY", 456n * 100n, [
        BuildTestExpiration("2024-11-01"), BuildTestExpiration("2024-11-02"), BuildTestExpiration("2024-11-03"),
        BuildTestExpiration("2024-11-04"), BuildTestExpiration("2024-11-05"), BuildTestExpiration("2024-11-06"),
        BuildTestExpiration("2024-11-07"),

        BuildTestExpiration("2024-12-01"), BuildTestExpiration("2025-01-01"), BuildTestExpiration("2025-02-01"),
        BuildTestExpiration("2025-03-01"), BuildTestExpiration("2025-04-01"), BuildTestExpiration("2025-05-01"),
        BuildTestExpiration("2025-06-01"),
    ])
}


describe('Strategy Functions', () => {
    const chain = BuildTestChain()
    it('finds expiration date correctly', () => {
        expect(FindExpiration(chain).timestamp).to.equal("2024-11-02")
        expect(FindExpiration(chain, 3).timestamp).to.equal("2024-11-04")
        expect(FindExpiration(chain, 90).timestamp).to.equal("2025-02-01")
    })

    it('finds moneyness correctly', () => {
        const exp = BuildTestExpiration("2024-01-01")
        expect(FindStrike(exp, 100n * 100n, 0n).price).to.equal(100n * 100n)
        expect(FindStrike(exp, 76n * 100n, 0n).price).to.equal(76n * 100n)
        expect(FindStrike(exp, 80n * 100n, 0n).price).to.equal(80n * 100n)
        expect(FindStrike(exp, 125n * 100n, 0n).price).to.equal(125n * 100n)
    })
})