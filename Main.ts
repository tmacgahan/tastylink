import { DownloadChain } from './MarketData/DownloadFunctions'
import { MarketTimestampsBetween, PreviousMarketDay, Timestamp, TimestampToDate, } from './Utils/DateFunctions'
import { Delay } from './Utils/Delay'
import { LoadChain } from './Strategies/Chain'
import { BuyAndHoldCalls } from './Strategies/BuyAndHoldCalls'
import { RollATMStrangleDaily } from './Strategies/RollATMStrangleDaily'
import { Wheel } from './Strategies/Wheel'


function GenerateChains(fromDate: string, toDate: string, symbol: string) {
  MarketTimestampsBetween(fromDate, toDate).sort().forEach( timestamp => {
    DownloadChain(symbol, timestamp)
    Delay(25)
  })
}

//GenerateChains( "2024-11-08", "2024-09-12", "SPY" )
//DownloadChain("SPY", "2024-11-11")
//GenerateChains( "2024-09-12", "2024-12-19", "SPY" )

const startDate: string = "2024-10-01"
const endDate: string = "2024-12-19"
const dayBeforeLast: string = Timestamp(PreviousMarketDay(TimestampToDate(endDate)))
let strategy = new Wheel()
MarketTimestampsBetween( startDate, dayBeforeLast ).sort().forEach( timestamp => {
  const chain = LoadChain("SPY", timestamp)
  strategy.MaintainPosition(timestamp, chain)
  strategy.ResolveEOD(chain)
})

console.log(strategy.ToCSV().toString())
console.log(`total $${Number(strategy.AccountValue(LoadChain("SPY", endDate))) / 100}`)