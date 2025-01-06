import { expect } from 'chai'
import 'mocha';
import { AveragePrice, OptionFromSymbol, Side, SideFromSymbol, Strike, StrikePriceFromSymbol, Expiration, Chain } from '../../Strategies/Chain';

export const timestamp = "2024-11-23"
export const symbolC = "SPY241123C00456000"
export const symbolP = "SPY241123P00456000"

export function BuildTestExpiration() {
    const underStrike: Strike = {
        price: 455,
        call: OptionFromSymbol("SPY241123C00455000", 1.2, 1.25),
        put: OptionFromSymbol("SPY241123P00455000", .8, .85),
    }

    const atmStrike: Strike = {
        price: 456,
        call: OptionFromSymbol(symbolC, .95, 1.05),
        put: OptionFromSymbol(symbolP, .95, 1.05),
    }

    const overStrike: Strike = {
        price: 457,
        call: OptionFromSymbol("SPY241123C00457000", .8, .85),
        put: OptionFromSymbol("SPY241123P00457000", 1.2, 1.25),
    }

    return new Expiration(timestamp, [atmStrike, underStrike, overStrike]) 
}

export function BuildTestChain() {
    return new Chain(timestamp, "SPY", 456, [BuildTestExpiration()])
}

describe('option', () => {
    it("should extract side correctly", () => {
        expect(SideFromSymbol(symbolC)).to.equal(Side.Call)
        expect(SideFromSymbol(symbolP)).to.equal(Side.Put)
    })
    it("should extract price correctly", () => {
        expect(StrikePriceFromSymbol(symbolC)).to.equal(456)
        expect(StrikePriceFromSymbol(symbolP)).to.equal(456)
    })
    it("should build an option correctly", () => {
        const call = OptionFromSymbol(symbolC, .95, 1.05)
        expect(call.side).to.equal(Side.Call)
        expect(call.symbol).to.equal(symbolC)
        expect(AveragePrice(call)).to.equal(1)

        const put = OptionFromSymbol(symbolP, .95, 1.05)
        expect(put.side).to.equal(Side.Put)
        expect(put.symbol).to.equal(symbolP)
        expect(AveragePrice(put)).to.equal(1)
    })
})

describe('expiration', () => {
    const exp = BuildTestExpiration()

	it('should sort strikes', () => {
        expect(exp.strikeList[0].price).to.equal(455)
        expect(exp.strikeList[1].price).to.equal(456)
        expect(exp.strikeList[2].price).to.equal(457)
    })
    it('should properly construct the strike map', () => {
        expect((exp.map.get(455) as Strike).price).to.equal(455)
        expect((exp.map.get(456) as Strike).price).to.equal(456)
        expect((exp.map.get(457) as Strike).price).to.equal(457)
    })
})