//import { argv } from 'process';
//import { some } from 'fp-ts/lib/ReadonlyRecord';
import { TastyConfig } from './Tasty/TastyConfig'
import * as Option from 'fp-ts/Option'
import { identity, pipe } from 'fp-ts/function'

/*
let argstr: Array<string> = argv.slice(2).map(elt => {
    return elt.toString();
});
*/

// https://stackoverflow.com/questions/33858763/console-input-in-typescript
// Define the API URL

//let tastyConf = new TastyConfig();
//tastyConf.connect();

let result = pipe(
    3,
    (num) => { return num === 0 ? Option.none : Option.some(1/num); },
    Option.match(
        () => "undefined",
        (aa) => `${aa}`
    )
)

console.log(result);