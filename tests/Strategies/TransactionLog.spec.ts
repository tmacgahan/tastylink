import { expect } from 'chai'
import 'mocha';
import { TransactionLog } from '../../Strategies/TransactionLog';
import { BuildTestChain, timestamp } from './Chain.spec';
import { AveragePrice, Option } from '../../Strategies/Chain';

describe('transaction', () => {
    const chain = BuildTestChain()
    const strike = chain.expirations[0].strikeList[0]
    const call = strike.call as Option
    const put = strike.put as Option

	it('should account call sell correctly', () => {
        const txLog = new TransactionLog()

        txLog.SellToOpen(call, strike.price, timestamp, AveragePrice(call), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(-AveragePrice(call))
        expect(txLog.OpenPositionValue(chain) < 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('should account call buy correctly', () => {
        const txLog = new TransactionLog()

        txLog.BuyToOpen(call, strike.price, timestamp, AveragePrice(call), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        expect(txLog.OpenPositionValue(chain) > 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

	it('should account put sell correctly', () => {
        const txLog = new TransactionLog()

        //put side
        txLog.SellToOpen(put, strike.price, timestamp, AveragePrice(put), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(-AveragePrice(put))
        expect(txLog.OpenPositionValue(chain) < 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('should account put buy correctly', () => {
        const txLog = new TransactionLog()

        //put side
        txLog.BuyToOpen(put, strike.price, timestamp, AveragePrice(put), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(put))
        expect(txLog.OpenPositionValue(chain) > 0n).to.be.true
        txLog.CloseAllOpenPositions(chain)
        expect(txLog.OpenPositionValue(chain)).to.equal(0n)
    })

    it('should tally PNL correctly', () => {
        const txLog = new TransactionLog()
        txLog.BuyToOpen(call, strike.price, timestamp, AveragePrice(call), 1n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(call))
        txLog.SellToOpen(put, strike.price, timestamp, AveragePrice(put), 2n)
        expect(txLog.RealizedPNL()).to.equal(0n)
        expect(txLog.OpenPositionValue(chain)).to.equal(AveragePrice(call) - (2n * AveragePrice(put)))
        expect(txLog.OpenPositionBasis()).to.equal(-txLog.OpenPositionValue(chain))
        expect(txLog.TotalPNL(chain)).to.equal(0n)
    })
})