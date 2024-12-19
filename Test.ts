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
}