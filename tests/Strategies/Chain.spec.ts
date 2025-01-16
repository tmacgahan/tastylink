import { expect } from 'chai'
import 'mocha';
import { AveragePrice, SecurityFromSymbol, Side, SideFromSymbol, Strike, StrikePriceFromSymbol, Expiration, Chain } from '../../Strategies/Chain';

export const timestamp = "2024-11-23"
export const symbolC = "SPY241123C00456000"
export const symbolP = "SPY241123P00456000"

export function BuildTestExpiration() {
    const underStrike: Strike = {
        price: 45500n,
        call: SecurityFromSymbol("SPY241123C00455000", 120n, 125n),
        put: SecurityFromSymbol("SPY241123P00455000", 80n, 85n),
    }

    const atmStrike: Strike = {
        price: 45600n,
        call: SecurityFromSymbol(symbolC, 95n, 105n),
        put: SecurityFromSymbol(symbolP, 95n, 105n),
    }

    const overStrike: Strike = {
        price: 45700n,
        call: SecurityFromSymbol("SPY241123C00457000", 80n, 85n),
        put: SecurityFromSymbol("SPY241123P00457000", 120n, 125n),
    }

    return new Expiration(timestamp, [atmStrike, underStrike, overStrike]) 
}

export function BuildTestChain() {
    return new Chain(timestamp, "SPY", 456n, [BuildTestExpiration()])
}

describe('Option', () => {
    it('extracts side correctly', () => {
        expect(SideFromSymbol(symbolC)).to.equal(Side.Call)
        expect(SideFromSymbol(symbolP)).to.equal(Side.Put)
    })
    it('extracts price correctly', () => {
        expect(StrikePriceFromSymbol(symbolC)).to.equal(45600n)
        expect(StrikePriceFromSymbol(symbolP)).to.equal(45600n)
    })
    it('builds an option correctly', () => {
        const call = SecurityFromSymbol(symbolC, 95n, 105n)
        expect(call.side).to.equal(Side.Call)
        expect(call.symbol).to.equal(symbolC)
        expect(AveragePrice(call)).to.equal(100n)

        const put = SecurityFromSymbol(symbolP, 95n, 105n)
        expect(put.side).to.equal(Side.Put)
        expect(put.symbol).to.equal(symbolP)
        expect(AveragePrice(put)).to.equal(100n)
    })
})

describe('Expiration', () => {
    const exp = BuildTestExpiration()

	it('sorts strikes', () => {
        expect(exp.strikeList[0].price).to.equal(45500n)
        expect(exp.strikeList[1].price).to.equal(45600n)
        expect(exp.strikeList[2].price).to.equal(45700n)
    })
    it('properly constructs the strike map', () => {
        expect((exp.map.get(45500n) as Strike).price).to.equal(45500n)
        expect((exp.map.get(45600n) as Strike).price).to.equal(45600n)
        expect((exp.map.get(45700n) as Strike).price).to.equal(45700n)
    })
})