import { expect } from 'chai'
import 'mocha';
import { TimestampToDate, Timestamp, TomorrowOf, YesterdayOf, MarketTimestampsBetween, IsPublicHoliday } from '../../Utils/DateFunctions';

describe('date functions', () => {
    it('form a timestamp correctly', () => {
        expect(Timestamp(new Date(2021, 11, 25))).to.equal('2021-12-25')
    })

    it('extract a date correctly', () => {
        // this guy will probably only work in EST.  Need to make this more general before I move / get other people involved.
        expect(`${TimestampToDate('2021-12-25')}`).to.equal(`${new Date(2021, 11, 25, 7)}`)
    })

    it('find the following day', () => {
        expect(`${TomorrowOf(TimestampToDate('2024-01-01'))}`).to.equal(`${TimestampToDate('2024-01-02')}`)
    })

    it('find the previous day', () => {
        expect(`${YesterdayOf(TimestampToDate('2020-01-01'))}`).to.equal(`${TimestampToDate('2019-12-31')}`)
    })
    
    it('correctly compute market days between specific dates', () => {
        expect(MarketTimestampsBetween( "2024-12-19", "2024-12-26" )).deep.equal([
            '2024-12-19', '2024-12-20', '2024-12-23', '2024-12-24', '2024-12-26',
        ])
    })

    it('determine public holidays correctly', () => {
        expect(IsPublicHoliday(TimestampToDate("2024-11-28"))).to.be.true  // thanksgiving
        expect(IsPublicHoliday(TimestampToDate("2024-10-14"))).to.be.true  // columbus day
        expect(IsPublicHoliday(TimestampToDate("2024-09-02"))).to.be.true  // labor day
        expect(IsPublicHoliday(TimestampToDate("2025-05-26"))).to.be.true
        expect(IsPublicHoliday(TimestampToDate("2024-02-19"))).to.be.true  // president's day
        expect(IsPublicHoliday(TimestampToDate("2024-01-15"))).to.be.true  // MLK day
        expect(IsPublicHoliday(TimestampToDate("2024-01-16"))).to.be.false // Nothing in particular
    })
})