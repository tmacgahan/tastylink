import { pipe } from 'fp-ts/function'
import { MarketDataRMI } from './MarketData/MarketDataRMI'
import { Resolution } from './MarketData/ExternalModel'
import { Replacer } from './Utils/PrettyPrint'
import * as T from 'fp-ts/TaskEither'
import { DownloadChain, DownloadUnderlyingPrice } from './MarketData/DownloadFunctions'
import { FindFirstDayOfTypeInMonth, FindLastDayOfTypeInMonth, IsPublicHoliday, MarketTimestampsBetween, NextMarketDay, PreviousMarketDay, Timestamp, TimestampToDate, TomorrowOf, YesterdayOf } from './Utils/DateFunctions'
import { Delay } from './Utils/Delay'
import { Chain, LoadChain } from './Strategies/Chain'
import { BuyAndHoldCalls } from './Strategies/BuyAndHoldCalls'
import { RollATMStrangleDaily } from './Strategies/RollATMStrangleDaily'

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

function GenerateChains(fromDate: string, toDate: string, symbol: string) {
  MarketTimestampsBetween(fromDate, toDate).sort().forEach( timestamp => {
    DownloadChain(symbol, timestamp)
    Delay(25)
  })
}

//GenerateChains( "2024-11-08", "2024-09-12", "SPY" )
//DownloadChain("SPY", "2024-11-11")

const startDate: string = "2024-10-25"
const endDate: string = "2024-12-19"
const dayBeforeLast: string = Timestamp(PreviousMarketDay(TimestampToDate(endDate)))
let strategy = new RollATMStrangleDaily() //new BuyAndHoldCalls(startDate)
MarketTimestampsBetween( startDate, dayBeforeLast ).forEach( stamp => console.log(stamp) )
MarketTimestampsBetween( startDate, dayBeforeLast ).sort().forEach( timestamp => {
  strategy.MaintainPosition(timestamp, LoadChain("SPY", timestamp))
})

console.log(strategy.AccountValue(LoadChain("SPY", endDate)))