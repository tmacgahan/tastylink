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