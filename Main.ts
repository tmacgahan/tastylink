import { DownloadChain } from './MarketData/DownloadFunctions'
import { MarketTimestampsBetween, PreviousMarketDay, Timestamp, TimestampToDate, } from './Utils/DateFunctions'
import { Delay } from './Utils/Delay'
import { LoadChain } from './Strategies/Chain'
import { BuyAndHoldCalls } from './Strategies/BuyAndHoldCalls'
import { RollATMStrangleDaily } from './Strategies/RollATMStrangleDaily'

function GenerateChains(fromDate: string, toDate: string, symbol: string) {
  MarketTimestampsBetween(fromDate, toDate).sort().forEach( timestamp => {
    DownloadChain(symbol, timestamp)
    Delay(25)
  })
}

//GenerateChains( "2024-11-08", "2024-09-12", "SPY" )
//DownloadChain("SPY", "2024-11-11")
//GenerateChains( "2024-09-12", "2024-12-19", "SPY" )

const startDate: string = "2024-10-25"
const endDate: string = "2024-12-19"
const dayBeforeLast: string = Timestamp(PreviousMarketDay(TimestampToDate(endDate)))
let strategy = new RollATMStrangleDaily()
//MarketTimestampsBetween( startDate, dayBeforeLast ).forEach( stamp => console.log(stamp) )
MarketTimestampsBetween( startDate, dayBeforeLast ).sort().forEach( timestamp => {
  strategy.MaintainPosition(timestamp, LoadChain("SPY", timestamp))
})

console.log(strategy.AccountValue(LoadChain("SPY", endDate)))