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
        }
    }

    return DxMessageType.Unknown;
}

function StartSocket( tokens: Tokens ) {
    console.log( "starting websocket" );
    let apiUrl = tokens.dxToken.data['dxlink-url'];
    let ws = new WebSocket(apiUrl);
    ws.onopen = (evt)    => { console.log( `opening connection with event: ${evt.type}`); ws.send(Setup); }
    ws.onmessage = (msg) => {
        console.log( `message type: '${msg.type}' :: received: '${String(msg.data)}'` );
        switch( GetMessageType(String(msg.data)) ) {
            case DxMessageType.RequireAuth:
                ws.send(Auth(tokens.dxToken.data.token));
                break;
            case DxMessageType.AuthAccepted:
                console.log("DxLink Login Successful!");
                break;
            case DxMessageType.Setup:
                console.log("dxlink sent us some setup data");
                break;
            case DxMessageType.KeepAlive:
                ws.send(KeepAlive);
                break;
            case DxMessageType.Unknown:
                console.log(`dxlink sent us an unknown message of type ${msg.type}`);
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