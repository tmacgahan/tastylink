import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import fetch from 'node-fetch';
import { TastyConfig } from './TastyConfig';

/*
    I think a better way to structure this is to have a function that more functionally
    gets all the structures we need in a single pipe.  Otherwise this mix n match shit
    we're doing with the options in tokens and all that is going to be a goddamn mess.

    Which makes sense because this isn't really oop stuff.
*/

export class DxConfig {
    public static readonly tokenURL = "https://api.cert.tastyworks.com/api-quote-tokens";

    private loginCredential: O.Option<DxLoginReply> = O.none;
    private tastyConfig: TastyConfig; 
    private tastyToken(): O.Option<string> {
        return this.tastyConfig.sessionToken();
    }

    constructor(tastyConf: TastyConfig) {
        this.tastyConfig = tastyConf;
    }

    public async connect() {
        let apiUrl = DxConfig.tokenURL;
        let token = pipe(
            this.tastyToken(),
            O.getOrElse(() => {
                throw new Error("No session token available!");
                return "";
            })
        )

        let requestData = {
            method: 'POST', // am I really a post ?
            redirect: 'follow' as RequestRedirect, // necessary ?
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
              'Accept': 'application/json',
              'User-Agent': 'Dude-Bro',
              'Authorization': `${token}`,
            }
        };

        let result = await fetch(apiUrl, requestData).then(response => {
            if (!response.ok) {
                console.error('Network response was not ok');
                this.loginCredential = O.none;
            }
            return response.json();
        }).then(data => {
            let reply = data as DxLoginReply;
            console.log(`session token: ${reply.data.token}`);
            this.loginCredential = O.some(reply);
        }).catch(error => {
            console.error('Error:', error);
            this.loginCredential = O.none;
        });
    }
}

/*
bashness:
session="$(cat tokens | grep sessionTok | sed 's/sessionTok: //')"
curl --location --globoff "https://api.cert.tastyworks.com/api-quote-tokens" \
	--header 'Accept: application/json' \
	--header 'Content-Type: application/json' \
	--header 'User-Agent: dorgachev' \
	--header "Authorization: $session" | tee tmp

echo "token: $(cat tmp | jq .data.token | sed 's/"//g')" > dxlink
echo "url: $(cat tmp | jq .data.\"dxlink-url\" | sed 's/"//g')" >> dxlink

rm tmp
*/