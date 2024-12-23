export interface ChainReply {
    s: string,
    optionSymbol: string[],
    underlying: string[],
    expiration: number[],
    side: string[],
    strike: number[],
    firstTraded: number[],
    dte: number[],
    updated: number[],
    bid: number[],
    bidSize: number[],
    ask: number[],
    askSize: number[],
    last: number[],
    openInterest: number[],
    volume: number[],
    inTheMoney: boolean[],
    intrinsicValue: number[],
    extrinsicValue: number[],
    underlyingPrice: number[],
}

export interface ExpirationsReply {
    s: string,
    expirations: string[],
    updated: string,
}

export interface QuoteReply {
    s: string,
    symbol: string[]
    ask: number[],
    askSize: number[],
    bid: number[],
    bidSize: number[],
    mid: number[],
    last: number[],
    volume: number[],
    updated: number[],
}

export interface CandleReply {
    s: string,
    c: number[],    // close price
    h: number[],    // high price
    l: number[],    // low price
    o: number[],    // open price
    t: number[],    // candle time as timestamp, only applicable to intraday candles
    v: number[],    // volume
}

export interface GeneralReply { // we should do inheritence if ts supports it
    s: string,
}

export enum Resolution {
    OneMinute = "1",
    ThreeMinutes = "3",
    FiveMinutes = "5",
    FifteenMinutes = "15",
    ThirtyMinutes = "30",
    FortyFiveMinutes = "45",
    Hourly = "H",
    BiHourly = "2H",
    Daily = "D",
    BiDaily = "2D",
    Weekly = "W",
    BiWeekly = "2W",
    Monthly = "M",
    BiMonthly = "2M",
    Annually = "Y",
    BiAnnually = "2Y",
}