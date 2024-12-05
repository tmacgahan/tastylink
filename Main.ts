import { TastyConfig } from './Tasty/TastyConfig'
import { identity, pipe } from 'fp-ts/function'
import { GetTokens } from './Tasty/GetTokens'
import * as E from 'fp-ts/Either'

/*
let argstr: Array<string> = argv.slice(2).map(elt => {
    return elt.toString();
});
*/

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL


let result = GetTokens()().then( result => pipe(
    result,
    E.match(
        err => { throw(err) },
        toks => { console.log(JSON.stringify(toks)) }
    )
));
