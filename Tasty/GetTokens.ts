import * as child from 'child_process';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import fetch from 'node-fetch';

function tastyURL(): string { return "https://api.cert.tastyworks.com/sessions"; }
function tokenURL(): string { return "https://api.cert.tastyworks.com/api-quote-tokens"; }
function apiLogin(): string { return "tmcsandbox"; }
function apiRememberFlag(): boolean { return false; }

function loadPW(): string { return child.execSync('bash secrets/passdecode.sh').toString().replaceAll("\n", ""); }
async function getTastyToken(pw: string): O.Option<TastyLoginReply> {
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

    let loginCredential: O.Option<TastyLoginReply> = O.none;

    let result = await fetch(apiUrl, requestData).then(response => {
        if (!response.ok) {
            console.error('Network response was not ok');
            loginCredential = O.none;
        }
        return response.json();
    }).then(data => {
        let reply = data as TastyLoginReply;
        console.log(`session token: ${reply.data['session-token']}`);
        loginCredential = O.some(reply);
    }).catch(error => {
        console.error('Error:', error);
        loginCredential = O.none;
    });

    console.log( `result: ${result}` );
}

async function getDxToken(tastyToken: TastyLoginReply): O.Option<DxLoginReply> {
        let apiUrl = tokenURL();
        let requestData = {
            method: 'POST', // am I really a post ?
            redirect: 'follow' as RequestRedirect, // necessary ?
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
              'Accept': 'application/json',
              'User-Agent': 'Dude-Bro',
              'Authorization': `${tastyToken}`,
            }
        };

        let loginCredential: O.Option<DxLoginReply> = O.none;

        let result = await fetch(apiUrl, requestData).then(response => {
            if (!response.ok) {
                console.error('Network response was not ok');
                loginCredential = O.none;
            }
            return response.json();
        }).then(data => {
            let reply = data as DxLoginReply;
            console.log(`session token: ${reply.data.token}`);
            loginCredential = O.some(reply);
        }).catch(error => {
            console.error('Error:', error);
            loginCredential = O.none;
        });
    }

export async function GetTokens(): O.Option<Tokens> {
    let pass = loadPW();
    return pipe(
        await getTastyToken(pass),
        O.flatMap((tlr: TastyLoginReply) => {
            return pipe(
                getDxToken(tlr),
                O.map((dlr: DxLoginReply) => {
                    return {
                        tastyToken: tlr,
                        dxToken: dlr
                    }
                })
            )
        }),
    );
}