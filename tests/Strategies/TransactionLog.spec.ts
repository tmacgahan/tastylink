import { expect } from 'chai'
import 'mocha';
import { TransactionLog } from '../../Strategies/TransactionLog';
import { BuildTestChain, timestamp } from './Chain.spec';
import { AveragePrice, Option } from '../../Strategies/Chain';

describe('Transaction', () => {
    const chain = BuildTestChain()
    const strike = chain.expirations[0].strikeList[0]
    const call = strike.call as Option
    const put = strike.put as Option

	it('accounts call sell correctly', () => {
        const txLog = new TransactionLog()

        txLog.SellToOpen(call, timestamp, AveragePrice(call), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(-AveragePrice(call))
        expect(txLog.OpenPositionValue(chain) < 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('accounts call buy correctly', () => {
        const txLog = new TransactionLog()

        txLog.BuyToOpen(call, timestamp, AveragePrice(call), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        expect(txLog.OpenPositionValue(chain) > 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

	it('accounts put sell correctly', () => {
        const txLog = new TransactionLog()

        txLog.SellToOpen(put, timestamp, AveragePrice(put), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(-AveragePrice(put))
        expect(txLog.OpenPositionValue(chain) < 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('accounts put buy correctly', () => {
        const txLog = new TransactionLog()

        txLog.BuyToOpen(put, timestamp, AveragePrice(put), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(put))
        expect(txLog.OpenPositionValue(chain) > 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('tallies PNL correctly', () => {
        const txLog = new TransactionLog()
        txLog.BuyToOpen(call, timestamp, AveragePrice(call), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        txLog.SellToOpen(put, timestamp, AveragePrice(put), 2n)
        expect(txLog.RealizedPNL()).to.equal(0n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(call) - (2n * AveragePrice(put)))
        expect(txLog.OpenPositionBasis()).to.equal(-txLog.OpenPositionValue(chain))
        expect(txLog.TotalPNL(chain)).to.equal(0n)
    })

    it('produces a csv correctly', () => {
        const txLog = new TransactionLog()
        txLog.BuyToOpen(call, "2024-11-23", AveragePrice(call), 1n)
        txLog.SellToOpen(put, "2024-11-24", AveragePrice(put), 2n)
        expect(txLog.ToCSV().toString()).to.equal(
            "option symbol, strike, execution date, price, action, quantity, value\n" +
            "SPY241123C00455000, 45500, 2024-11-23, 122, buy, 1, -122\n" +
            "SPY241123P00455000, 45500, 2024-11-24, 82, sell, 2, 164"
        )
    })
})