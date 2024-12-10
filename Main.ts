import { identity, pipe } from 'fp-ts/function'
import { GetTokens } from './Tasty/GetTokens'
import * as E from 'fp-ts/Either'
import * as T from 'fp-ts/TaskEither'
import * as F from './Tasty/TastyFunctions';

const util = require('util');

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

pipe(
    GetTokens(),
    T.map( tokens => {
        console.log( tokens );
        return tokens;
    }),
    T.map( str => {
        console.log(`api came back with: ${util.inspect(str, { showHidden: true, depth: null })}`);
        console.log("=======");
        console.log(JSON.stringify(str));
        console.log("=======");
    }),
)().then( result => pipe(
    result,
    E.match(
        err => { throw(err) },
        msg => { console.log(`final match: ${msg}`) }
    )
));