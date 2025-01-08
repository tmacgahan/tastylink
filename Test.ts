/*
move these tests to the actual unit testing framework
import { Option, Strike, Expiration, Chain, Side } from './Strategies/Chain'
import { TimestampToDate } from './Utils/DateFunctions'
import { Replacer } from './Utils/PrettyPrint'

export function Test() {
    let put: Option = {
        bid: 1.13,
        ask: 1.15,
        side: Side.Put,
        symbol: "SPY241220P00120000",
    }

    let call: Option = {
        bid: 1.13,
        ask: 1.15,
        side: Side.Call,
        symbol: "SPY241220C00120000",
    }

    let strike: Strike = {
        price: 120,
        call: call,
        put: put,
    }

    let expiration = new Expiration(TimestampToDate("2024-12-20"), [strike]);
    let chain = new Chain(TimestampToDate("2024-12-11"), "SPY", 500, [expiration]);

    console.log(JSON.stringify(chain, Replacer));
    console.log(FindFirstDayOfTypeInMonth(TimestampToDate("2024-11-07"), 0))
    console.log(FindFirstDayOfTypeInMonth(TimestampToDate("2024-11-07"), 1))
    console.log(FindFirstDayOfTypeInMonth(TimestampToDate("2024-11-07"), 2))
    console.log(IsPublicHoliday(TimestampToDate("2024-11-28"))) // thanksgiving
    console.log(IsPublicHoliday(TimestampToDate("2024-10-14"))) // columbus day
    console.log(IsPublicHoliday(TimestampToDate("2024-09-02"))) // labor day
    console.log(MarketTimestampsBetween( "2024-11-21", "2024-12-07" ))
    console.log(FindLastDayOfTypeInMonth(TimestampToDate("2024-11-07"),0))
    console.log(IsPublicHoliday(TimestampToDate("2025-05-26")))
    console.log(FindLastDayOfTypeInMonth(TimestampToDate("2024-05-07"), 0))
    console.log(IsPublicHoliday(TimestampToDate("2024-02-19"))) // president's day
    console.log(IsPublicHoliday(TimestampToDate("2024-01-15"))) // MLK day
}
*/