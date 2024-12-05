import * as T from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { Tokens } from './ExternalModels/Tokens';
import { DxLoginReply } from './ExternalModels/DxLoginReply';
import { TastyLoginReply } from './ExternalModels/TastyLoginReply';
import * as child from 'child_process';
import fetch from 'node-fetch';

function tastyURL(): string { return "https://api.cert.tastyworks.com/sessions"; }
function tokenURL(): string { return "https://api.cert.tastyworks.com/api-quote-tokens"; }
function apiLogin(): string { return "tmcsandbox"; }
function apiRememberFlag(): boolean { return false; }

function loadPW(): string { return child.execSync('bash secrets/passdecode.sh').toString().replaceAll("\n", ""); }
function getTastyToken(pw: string): T.TaskEither<Error, TastyLoginReply>{
    let apiUrl = tastyURL();

    let requestData = {
        method: 'POST',
        body: JSON.stringify({
            login: apiLogin(),
            password: pw,
            'remember-me': apiRememberFlag(),
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            'User-Agent': 'Dude-Bro',
        }
    };

    console.log(requestData);

    return T.tryCatch(
        () => fetch(apiUrl, requestData).then( resp => resp.json().then( json => json as TastyLoginReply ) ),
        reason => new Error(String(reason))
    )
}

function getDxToken(tastyToken: TastyLoginReply): T.TaskEither<Error, DxLoginReply> {
        console.log( `getting dx token with tasty token: ${JSON.stringify(tastyToken)}` );
        console.log( `the session token is: ${tastyToken.data['session-token']}` );
        let apiUrl = tokenURL();
        let requestData = {
            method: 'GET',
            redirect: 'follow' as RequestRedirect,
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
              'Accept': 'application/json',
              'User-Agent': 'Dude-Bro',
              'Authorization': `${tastyToken.data['session-token']}`,
            }
        };

    return T.tryCatch(
        () => fetch(apiUrl, requestData).then( resp => resp.json().then( json => json as DxLoginReply ) ),
        reason => new Error(String(reason))
    )
}

export function GetTokens(): T.TaskEither<Error, Tokens> {
    let pass = loadPW();

    return pipe(
        getTastyToken(pass),
        T.chain( tlr => pipe(
            getDxToken(tlr),
            T.map( (dlr: DxLoginReply) => {
                let result: Tokens = { dxToken: dlr, tastyToken: tlr }
                return result;
            })
        ))
    );
}