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
MarketTimestampsBetween( "2024-11-08", "2024-12-19" ).sort().forEach( timestamp => {
  DownloadChain("SPY", timestamp)
  Delay(50)
})
*/

const startDate: string = "2024-12-02"
const endDate: string = "2024-12-19"
const dayBeforeLast: string = Timestamp(PreviousMarketDay(TimestampToDate(endDate)))
let strategy = new BuyAndHoldCalls(startDate)
MarketTimestampsBetween( startDate, dayBeforeLast ).sort().forEach( timestamp => {
  strategy.MaintainPosition(timestamp, LoadChain("SPY", timestamp))
})

strategy.ClosePosition(LoadChain("SPY", endDate))
console.log(strategy.Results())