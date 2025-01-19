import { expect } from 'chai'
import 'mocha';
import { Ledger } from '../../Strategies/Ledger';
import { BuildTestChain, timestamp } from './Chain.spec';
import { AveragePrice, Security } from '../../Strategies/Chain';

describe('Ledger', () => {
    const chain = BuildTestChain()
    const strike = chain.expirations[0].strikeList[0]
    const call = strike.call as Security
    const put = strike.put as Security

	it('accounts call sell correctly', () => {
        const ledger = new Ledger()

        ledger.Sell(call.symbol, timestamp, AveragePrice(call), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(-AveragePrice(call))
        expect(ledger.OpenPositionValue(chain) < 0n).to.be.true
        ledger.CloseAllOpenPositions(chain)
        expect(ledger.OpenPositionValue(chain)).to.equal(0n)
    })

    it('accounts call buy correctly', () => {
        const ledger = new Ledger()

        ledger.Buy(call.symbol, timestamp, AveragePrice(call), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        expect(ledger.OpenPositionValue(chain) > 0n).to.be.true
        ledger.CloseAllOpenPositions(chain)
        expect(ledger.OpenPositionValue(chain)).to.equal(0n)
    })

	it('accounts put sell correctly', () => {
        const txLog = new Ledger()

        txLog.Sell(put.symbol, timestamp, AveragePrice(put), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(-AveragePrice(put))
        expect(txLog.OpenPositionValue(chain) < 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('accounts put buy correctly', () => {
        const ledger = new Ledger()

        ledger.Buy(put.symbol, timestamp, AveragePrice(put), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(put))
        expect(ledger.OpenPositionValue(chain) > 0n).to.be.true
        ledger.CloseAllOpenPositions(chain)
        expect(ledger.OpenPositionValue(chain)).to.equal(0n)
    })

    it('tallies PNL correctly', () => {
        const ledger = new Ledger()
        ledger.Buy(call.symbol, timestamp, AveragePrice(call), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        ledger.Sell(put.symbol, timestamp, AveragePrice(put), 2n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(call) - (2n * AveragePrice(put)))
        expect(ledger.OpenPositionBasis()).to.equal(ledger.OpenPositionValue(chain))
        expect(ledger.RealizedPNL()).to.equal(0n)
        expect(ledger.TotalPNL(chain)).to.equal(0n)
    })

    it('produces a csv correctly', () => {
        const ledger = new Ledger()
        ledger.Buy(call.symbol, "2024-11-23", AveragePrice(call), 1n)
        ledger.Sell(put.symbol, "2024-11-24", AveragePrice(put), 2n)
        expect(ledger.ToCSV().toString()).to.equal(
            "symbol, execution date, price, action, quantity, value\n" +
            "SPY241123C00455000, 2024-11-23, 122, buy, 1, -122\n" +
            "SPY241123P00455000, 2024-11-24, 82, sell, 2, 164"
        )
    })

    it('processes assignment properly', () => {
        const ledger = new Ledger()
        ledger.Sell(call.symbol, "2024-11-23", AveragePrice(call), 1n)
        ledger.ResolveEOD(chain)

        expect(ledger.OpenPositions().length).to.equal(1)
        expect(Array.from(ledger.OpenPositions())[0][0]).to.equal("SPY")

        const itmPut = chain.expirations[0].strikeList[2].put as Security
        ledger.Sell(itmPut.symbol, "2024-11-23", AveragePrice(itmPut), 1n)
        ledger.ResolveEOD(chain)
        
        expect(ledger.ToCSV().toString()).to.equal(
            "symbol, execution date, price, action, quantity, value\n" +
            "SPY241123C00455000, 2024-11-23, 122, sell, 1, 122\n" +
            "SPY241123C00455000, 2024-11-23, 0, assigned, 1, 0\n" +
            "SPY, 2024-11-23, 45500, sell, 100, 4550000\n" +
            "SPY241123P00457000, 2024-11-23, 122, sell, 1, 122\n" +
            "SPY241123P00457000, 2024-11-23, 0, assigned, 1, 0\n" +
            "SPY, 2024-11-23, 45700, buy, 100, -4570000"
        )
        
        expect(ledger.OpenPositions().length).to.equal(0)
    })

    it('processes expiration properly', () => {
        const ledger = new Ledger()
        ledger.Sell(put.symbol, "2024-11-23", AveragePrice(put), 1n)
        ledger.ResolveEOD(chain)

        expect(ledger.ToCSV().toString()).to.equal(
            "symbol, execution date, price, action, quantity, value\n" +
            "SPY241123P00455000, 2024-11-23, 82, sell, 1, 82\n" +
            "SPY241123P00455000, 2024-11-23, 0, expired, 1, 0"
        )
    })
})