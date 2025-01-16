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

        ledger.Sell(call, timestamp, AveragePrice(call), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(-AveragePrice(call))
        expect(ledger.OpenPositionValue(chain) < 0n).to.be.true
        ledger.CloseAllOpenPositions(chain)
        expect(ledger.OpenPositionValue(chain)).to.equal(0n)
    })

    it('accounts call buy correctly', () => {
        const ledger = new Ledger()

        ledger.Buy(call, timestamp, AveragePrice(call), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        expect(ledger.OpenPositionValue(chain) > 0n).to.be.true
        ledger.CloseAllOpenPositions(chain)
        expect(ledger.OpenPositionValue(chain)).to.equal(0n)
    })

	it('accounts put sell correctly', () => {
        const txLog = new Ledger()

        txLog.Sell(put, timestamp, AveragePrice(put), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(-AveragePrice(put))
        expect(txLog.OpenPositionValue(chain) < 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('accounts put buy correctly', () => {
        const ledger = new Ledger()

        ledger.Buy(put, timestamp, AveragePrice(put), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(put))
        expect(ledger.OpenPositionValue(chain) > 0n).to.be.true
        ledger.CloseAllOpenPositions(chain)
        expect(ledger.OpenPositionValue(chain)).to.equal(0n)
    })

    it('tallies PNL correctly', () => {
        const ledger = new Ledger()
        ledger.Buy(call, timestamp, AveragePrice(call), 1n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        ledger.Sell(put, timestamp, AveragePrice(put), 2n)
        expect(ledger.OpenPositionValue(chain)).to.equal(AveragePrice(call) - (2n * AveragePrice(put)))
        expect(ledger.OpenPositionBasis()).to.equal(ledger.OpenPositionValue(chain))
        expect(ledger.RealizedPNL()).to.equal(0n)
        expect(ledger.TotalPNL(chain)).to.equal(0n)
    })

    it('produces a csv correctly', () => {
        const ledger = new Ledger()
        ledger.Buy(call, "2024-11-23", AveragePrice(call), 1n)
        ledger.Sell(put, "2024-11-24", AveragePrice(put), 2n)
        expect(ledger.ToCSV().toString()).to.equal(
            "symbol, execution date, price, action, quantity, value\n" +
            "SPY241123C00455000, 2024-11-23, 122, buy, 1, -122\n" +
            "SPY241123P00455000, 2024-11-24, 82, sell, 2, 164"
        )
    })
})