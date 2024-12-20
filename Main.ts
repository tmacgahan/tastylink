import { pipe } from 'fp-ts/function'
import { MarketDataRMI } from './MarketData/MarketDataRMI'
import { Resolution } from './MarketData/ExternalModel'
import { Replacer } from './Utils/PrettyPrint'
import * as T from 'fp-ts/TaskEither'
import { DownloadChain, DownloadUnderlyingPrice } from './MarketData/DownloadFunctions'
import { MarketTimestampsBetween, NextMarketDay, Timestamp, TimestampToDate, TomorrowOf } from './Utils/DateFunctions'

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

//MarketTimestampsBetween( "2024-12-10", "2024-12-19" ).sort().forEach( date => DownloadChain("SPY", date))
console.log( MarketTimestampsBetween( "2024-12-112", "2024-12-20" ) )
//DownloadChain("SPY", "2024-12-18")