import { pipe } from 'fp-ts/function'
import { LoadAPIToken } from './MarketData/GetTokens'
import { MarketDataFunctions } from './MarketData/MarketDataFunctions'
import { Option, Chain, Strike, Expiration, Side, SideFromSymbol, StrikePriceFromSymbol } from './Strategies/Chain'
import { Replacer } from './Utils/PrettyPrint'

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL


// dedicated timestamp object


//let strategy = new BuyAndHoldCalls("2024-12-10")
/*
        T.sequenceArray(
            ["2024-12-10", "2024-12-11"].map( date => T.of<Error, string>(date) )
        ),
        T.map( dates => dates.map( date => md.GetExpirationDates("SPY", date) ) ),
*/

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