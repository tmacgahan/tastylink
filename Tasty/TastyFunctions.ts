import * as T from 'fp-ts/TaskEither';
import * as C from './TastyConstants';
import { Tokens } from './ExternalModels/Tokens';
import { WebSocket } from 'ws';

export function Auth(tokenStr: string) {
    let auth = {
        type: "AUTH",
        channel: 0, 
        token: tokenStr,
    }
    return JSON.stringify(auth);
}

export function GetMessageType(data: string): C.DxMessageType {
    let json = JSON.parse(data);
    if( "type" in json ) {
        if( json.type === "AUTH_STATE" ) {
            if( json.state === "UNAUTHORIZED" ) {
                return C.DxMessageType.RequireAuth;
            } else if( json.state === "AUTHORIZED" ) {
                return C.DxMessageType.AuthAccepted;
            }
        } else if( json.type === "SETUP" ) {
            return C.DxMessageType.Setup;
        } else if( json.type === "KEEPALIVE" ) {
            return C.DxMessageType.KeepAlive;
        } else if( json.type === "CHANNEL_OPENED" ) {
            return C.DxMessageType.ChannelOpened
        } else if( json.type === "FEED_CONFIG" ) {
            return C.DxMessageType.FeedConfigured
        } else if( json.type === "FEED_DATA" ) {
            return C.DxMessageType.FeedData;
        }
    }

    return C.DxMessageType.Unknown;
}

export function StartSocket( tokens: Tokens ) {
    console.log( "starting websocket" );
    let apiUrl = tokens.dxToken.data['dxlink-url'];
    let ws: WebSocket = new WebSocket(apiUrl);
    ws.onopen = (evt)    => { console.log( `opening connection with event: ${evt.type}`); ws.send(C.Setup); }
    ws.onmessage = (msg) => {
        console.log( `message type: '${msg.type}' :: received: '${String(msg.data)}'` );
        switch( GetMessageType(String(msg.data)) ) {
            case C.DxMessageType.RequireAuth:
                ws.send(Auth(tokens.dxToken.data.token));
                break;
            case C.DxMessageType.AuthAccepted:
                console.log("DxLink Login Successful!");
                ws.send(C.SetupChannel)
                break;
            case C.DxMessageType.ChannelOpened:
                ws.send(C.SetupFeed);
                break;
            case C.DxMessageType.FeedConfigured:
                ws.send(C.SubscribeFeed);
                break;
            case C.DxMessageType.FeedData:
                break;
            case C.DxMessageType.Setup:
                console.log("dxlink sent us some setup data");
                break;
            case C.DxMessageType.KeepAlive:
                ws.send(C.KeepAlive);
                break;
            case C.DxMessageType.Unknown:
                console.log(`dxlink sent us an unknown message of type ${msg.type}`);
                break;
        }
    }
    ws.onerror = (err)   => { console.log( `error: '${err.message}'` ); }
    ws.onclose = (evt)   => { console.log( `closing with msg: '${evt.reason}'` ); }
}

export function GetOptionChain( tokens: Tokens, symbol: string ): T.TaskEither<Error, unknown> {
    let apiUrl = `https://api.cert.tastyworks.com/option-chains/${symbol}`;
    let requestData = {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'User-Agent': 'Dude-Bro',
            'Authorization': `${tokens.tastyToken.data['session-token']}`,
        }
    }
    return T.tryCatch(
        () => fetch(apiUrl, requestData).then(resp => resp.json().then(json => json)),
        (reason) => new Error(String(reason)),
    );
}

export function GetHistoricalOptionChain(tokens: Tokens, symbol: string): T.TaskEither<Error, unknown> {
    let apiUrl = `https://api.cert.tastyworks.com/instruments/equity-options`;
    console.log( `attempting to reach ${apiUrl}` );
    let requestData = {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'User-Agent': 'Dude-Bro',
            'Authorization': `${tokens.tastyToken.data['session-token']}`,
        }
    }
    return T.tryCatch(
        () => fetch(apiUrl, requestData).then(resp => resp.text().then(json => String(json))),
        (reason) => new Error(String(reason)),
    );
}
