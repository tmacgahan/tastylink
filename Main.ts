import { identity, pipe } from 'fp-ts/function'
import { GetTokens } from './Tasty/GetTokens'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import { WebSocket } from 'ws';
import { Tokens } from './Tasty/ExternalModels/Tokens';

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

const Setup = JSON.stringify({
    'type': "SETUP",
    channel: 0,
    version: "0.1-DXF-JS/0.3.0",
    keepaliveTimeout: 60,
    acceptKeepaliveTimeout: 60
});

const KeepAlive = JSON.stringify({
    type:"KEEPALIVE",
    channel: 0,
});

const SetupChannel = JSON.stringify({
    type: "CHANNEL_REQUEST",
    channel: 3,
    service: "FEED",
    parameters: {
        contract: "AUTO"
    }
});

const SetupFeed = JSON.stringify({
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

const SubscribeFeed = JSON.stringify({
    type: "FEED_SUBSCRIPTION",
    channel: 3,
    reset: true,
    add: [
        //{ type: "Trade", symbol: "BTC/USD:CXTALP" },
        //{ type: "Quote", symbol: "BTC/USD:CXTALP" },
        //{ type: "Profile", symbol: "BTC/USD:CXTALP" },
        //{ type: "Summary", symbol: "BTC/USD:CXTALP" },
        { type: "Trade", symbol: "SPY" },
        { type: "TradeETH", symbol: "SPY" },
        { type: "Quote", symbol: "SPY" },
        { type: "Profile", symbol: "SPY" },
        { type: "Summary", symbol: "SPY" },
    ],
});

function Auth(tokenStr: string) {
    let auth = {
        type: "AUTH",
        channel: 0, 
        token: tokenStr,
    }
    return JSON.stringify(auth);
}

enum DxMessageType {
    Setup = "SETUP",
    RequireAuth = "AUTH REQUIRED",
    AuthAccepted = "AUTH ACCEPTED",
    KeepAlive = "KEEPALIVE",
    ChannelOpened = "CHANNEL_OPENED",
    FeedConfigured = "FEED_CONFIG",
    FeedData = "FEED_DATA",
    Unknown = "UNKNOWN MESSAGE",
}

function GetMessageType(data: string): DxMessageType {
    let json = JSON.parse(data);
    if( "type" in json ) {
        if( json.type === "AUTH_STATE" ) {
            if( json.state === "UNAUTHORIZED" ) {
                return DxMessageType.RequireAuth;
            } else if( json.state === "AUTHORIZED" ) {
                return DxMessageType.AuthAccepted;
            }
        } else if( json.type === "SETUP" ) {
            return DxMessageType.Setup;
        } else if( json.type === "KEEPALIVE" ) {
            return DxMessageType.KeepAlive;
        } else if( json.type === "CHANNEL_OPENED" ) {
            return DxMessageType.ChannelOpened
        } else if( json.type === "FEED_CONFIG" ) {
            return DxMessageType.FeedConfigured
        } else if( json.type === "FEED_DATA" ) {
            return DxMessageType.FeedData;
        }
    }

    return DxMessageType.Unknown;
}

function StartSocket( tokens: Tokens ) {
    console.log( "starting websocket" );
    let apiUrl = tokens.dxToken.data['dxlink-url'];
    let ws: WebSocket = new WebSocket(apiUrl);
    ws.onopen = (evt)    => { console.log( `opening connection with event: ${evt.type}`); ws.send(Setup); }
    ws.onmessage = (msg) => {
        console.log( `message type: '${msg.type}' :: received: '${String(msg.data)}'` );
        switch( GetMessageType(String(msg.data)) ) {
            case DxMessageType.RequireAuth:
                ws.send(Auth(tokens.dxToken.data.token));
                break;
            case DxMessageType.AuthAccepted:
                console.log("DxLink Login Successful!");
                ws.send(SetupChannel)
                break;
            case DxMessageType.ChannelOpened:
                ws.send(SetupFeed);
                break;
            case DxMessageType.FeedConfigured:
                ws.send(SubscribeFeed);
                break;
            case DxMessageType.FeedData:
                break;
            case DxMessageType.Setup:
                console.log("dxlink sent us some setup data");
                break;
            case DxMessageType.KeepAlive:
                ws.send(KeepAlive);
                break;
            case DxMessageType.Unknown:
                console.log(`dxlink sent us an unknown message of type ${msg.type}`);
                break;
        }
    }
    ws.onerror = (err)   => { console.log( `error: '${err.message}'` ); }
    ws.onclose = (evt)   => { console.log( `closing with msg: '${evt.reason}'` ); }
}

pipe(
    GetTokens(),
    T.map( tokens => {
        console.log( "found tokens:" );
        console.log( tokens );
        StartSocket( tokens );
    })
)().then( result => pipe(
    result,
    E.match(
        err => { throw(err) },
        msg => { console.log(`final match: ${msg}`) }
    )
));