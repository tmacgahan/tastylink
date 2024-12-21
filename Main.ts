import { pipe } from 'fp-ts/function'
import { MarketDataRMI } from './MarketData/MarketDataRMI'
import { Resolution } from './MarketData/ExternalModel'
import { Replacer } from './Utils/PrettyPrint'
import * as T from 'fp-ts/TaskEither'
import { DownloadChain, DownloadUnderlyingPrice } from './MarketData/DownloadFunctions'
import { FindFirstDayOfTypeInMonth, FindLastDayOfTypeInMonth, IsPublicHoliday, MarketTimestampsBetween, NextMarketDay, Timestamp, TimestampToDate, TomorrowOf } from './Utils/DateFunctions'
import { Delay } from './Utils/Delay'

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL


// dedicated timestamp object


//let strategy = new BuyAndHoldCalls("2024-12-10")

/*
our pipe is:
pipe(
  GatherDates,
  ForEachDate(
    GetExpirations,
    ForEachExpiration(
        GetChainForExpiration
    ),
    BuildCompleteChain,
    ApplyStrategyToChain,
  )
)
*/

/*
pipe(
    DownloadUnderlyingPrice("SPY", "2024-12-17"),
    T.map( price => console.log(`price: ${price}`) ),
)()
*/

/*
console.log( MarketTimestampsBetween( "2024-12-12", "2024-12-19" ) )
MarketTimestampsBetween( "2024-11-25", "2024-11-27" ).sort().forEach( date => {
  DownloadChain("SPY", date)
  Delay(100)
})
*/

// so now what we really want to do is build chains from downloaded data and then
// save those to disk as completed daily chains.  Then we can synchronously load them
// and run back tests and shit.  Sounds good, right?  Let's do it.
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
let date = TimestampToDate("2025-05-26")
console.log(`${date}`)
console.log(date.getUTCDay())
//let target = TimestampToDate("2024
//while( 