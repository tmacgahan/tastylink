import { pipe } from 'fp-ts/function'
import { MarketDataRMI } from './MarketData/MarketDataRMI'
import { Resolution } from './MarketData/ExternalModel'
import { Replacer } from './Utils/PrettyPrint'
import * as T from 'fp-ts/TaskEither'
import { DownloadChain, DownloadUnderlyingPrice } from './MarketData/DownloadFunctions'
import { MarketTimestampsBetween, NextMarketDay, Timestamp, TimestampToDate, TomorrowOf } from './Utils/DateFunctions'
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

console.log( MarketTimestampsBetween( "2024-12-12", "2024-12-19" ) )
MarketTimestampsBetween( "2024-11-25", "2024-11-27" ).sort().forEach( date => {
  DownloadChain("SPY", date)
  Delay(100)
})