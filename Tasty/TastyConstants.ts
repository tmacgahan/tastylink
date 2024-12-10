
export const Setup = JSON.stringify({
    'type': "SETUP",
    channel: 0,
    version: "0.1-DXF-JS/0.3.0",
    keepaliveTimeout: 60,
    acceptKeepaliveTimeout: 60
});

export const KeepAlive = JSON.stringify({
    type:"KEEPALIVE",
    channel: 0,
});

export const SetupChannel = JSON.stringify({
    type: "CHANNEL_REQUEST",
    channel: 3,
    service: "FEED",
    parameters: {
        contract: "AUTO"
    }
});

export const SetupFeed = JSON.stringify({
    type: "FEED_SETUP",
    channel: 3,
    acceptAggregationPeriod: 0.1,
    acceptDataFormat: "COMPACT",
    acceptEventFields: { 
        Trade:    ["eventType","eventSymbol","price","dayVolume","size" ],
        TradeETH: ["eventType","eventSymbol","price","dayVolume","size"],
        Quote:    ["eventType","eventSymbol","bidPrice","askPrice","bidSize","askSize"],
        Greeks:   ["eventType","eventSymbol","volatility","delta","gamma","theta","rho","vega"],
        Profile:  ["eventType","eventSymbol","description","shortSaleRestriction","tradingStatus","statusReason","haltStartTime","haltEndTime","highLimitPrice","lowLimitPrice","high52WeekPrice","low52WeekPrice"],
        Summary:  ["eventType","eventSymbol","openInterest","dayOpenPrice","dayHighPrice","dayLowPrice","prevDayClosePrice"],
    },
});

export const SubscribeFeed = JSON.stringify({
    type: "FEED_SUBSCRIPTION",
    channel: 3,
    reset: true,
    add: [
        { type: "Trade", symbol: "SPY" },
        { type: "TradeETH", symbol: "SPY" },
        { type: "Quote", symbol: "SPY" },
        { type: "Profile", symbol: "SPY" },
        { type: "Summary", symbol: "SPY" },
    ],
});

export enum DxMessageType {
    Setup = "SETUP",
    RequireAuth = "AUTH REQUIRED",
    AuthAccepted = "AUTH ACCEPTED",
    KeepAlive = "KEEPALIVE",
    ChannelOpened = "CHANNEL_OPENED",
    FeedConfigured = "FEED_CONFIG",
    FeedData = "FEED_DATA",
    Unknown = "UNKNOWN MESSAGE",
}