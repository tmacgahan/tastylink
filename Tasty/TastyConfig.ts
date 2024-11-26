import * as child from 'child_process';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import fetch from 'node-fetch';

export class TastyConfig {
    public static readonly tastyURL =  "https://api.cert.tastyworks.com/sessions";

    private apiPW: string = "";
    private apiLogin: string = "tmcsandbox";
    private apiRememberFlag: boolean = false;
    private loginCredential: O.Option<TastyLoginReply> = O.none;

    public sessionToken(): O.Option<string> {
        return pipe(
            this.loginCredential,
            O.map((tlr: TastyLoginReply) => { return tlr.data['session-token']; })
        )
    }

    private loadPW() { return child.execSync('bash secrets/passdecode.sh').toString().replaceAll("\n", ""); }

    // we may want the constructor to build the connection and run to avoid statefulness that must be externally managed
    constructor() {
        this.apiPW = this.loadPW();
    }

    public async connect() {
        //let apiUrl = "https://jsonplaceholder.typicode.com/todos/1";
        let apiUrl = TastyConfig.tastyURL;

        let requestData = {
            method: 'POST',
            body: JSON.stringify({
                login: this.apiLogin,
                password: this.apiPW,
                'remember-me': this.apiRememberFlag,
            }),
            headers: {
              'Content-type': 'application/json; charset=UTF-8',
              'User-Agent': 'Dude-Bro',
            }
        };

        console.log(requestData);

        // Make a GET request
        let result = await fetch(apiUrl, requestData).then(response => {
            if (!response.ok) {
                console.error('Network response was not ok');
                this.loginCredential = O.none;
            }
            return response.json();
        }).then(data => {
            let reply = data as TastyLoginReply;
            console.log(`session token: ${reply.data['session-token']}`);
            this.loginCredential = O.some(reply);
        }).catch(error => {
            console.error('Error:', error);
            this.loginCredential = O.none;
        });

        console.log( `result: ${result}` );
    }
}

/*
bashness:
curl -X POST https://api.cert.tastyworks.com/sessions \
  -H "Content-Type: application/json" \
  -H "User-Agent: dude-bro" \
  -d "{ \"login\": \"tmcsandbox\", \"password\": \"$pass\", \"remember-me\": false } " | tee response

sessionTok="$(cat response | jq ".data.\"session-token\"" | sed 's/"//g')"
externalId="$(cat response | jq ".data.user.\"external-id\"" | sed 's/"//g')"

echo "sessionTok: $sessionTok" >  tokens
echo "externalId: $externalId" >> tokens
echo ""
*/