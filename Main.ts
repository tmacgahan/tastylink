import { pipe } from 'fp-ts/function'
import { MarketDataRMI } from './MarketData/MarketDataRMI'
import { Resolution } from './MarketData/ExternalModel'
import { Replacer } from './Utils/PrettyPrint'
import * as T from 'fp-ts/TaskEither'
import { DownloadChain, DownloadUnderlyingPrice } from './MarketData/DownloadFunctions'
import { FindFirstDayOfTypeInMonth, FindLastDayOfTypeInMonth, IsPublicHoliday, MarketTimestampsBetween, NextMarketDay, Timestamp, TimestampToDate, TomorrowOf } from './Utils/DateFunctions'
import { Delay } from './Utils/Delay'
import { Chain, LoadChain } from './Strategies/Chain'

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
MarketTimestampsBetween( "2024-11-08", "2024-12-19" ).sort().forEach( date => {
  DownloadChain("SPY", date)
  Delay(100)
})
*/

// so now what we really want to do is build chains from downloaded data and then
// save those to disk as completed daily chains.  Then we can synchronously load them
// and run back tests and shit.  Sounds good, right?  Let's do it.
let chain: Chain = LoadChain("SPY", "2024-12-19")
console.log(JSON.stringify(chain, Replacer))
