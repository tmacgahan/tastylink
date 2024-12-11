import * as T from 'fp-ts/TaskEither';

export function GetExpirationDates( apiToken: string, symbol: string ): T.TaskEither<Error, unknown> {
    let apiUrl = `https://api.marketdata.app/v1/options/expirations/${symbol}?${new URLSearchParams({
        date: "2023-12-12",  // for historical lookups, parameterize
    })}`
    let requestData = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${apiToken}`,
        }
    }
    return T.tryCatch(
        () => fetch(apiUrl, requestData).then(resp => resp.json().then(json => json)),
        (reason) => new Error(String(reason)),
    );
}

export function GetStrikes( apiToken: string, symbol: string): T.TaskEither<Error, unknown> {
    let apiUrl = `https://api.marketdata.app/options/strikes/${symbol}?${new URLSearchParams({
        date: "2023-12-12",  // for historical lookups, parameterize
    })}`
    let requestData = {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${apiToken}`,
        }
    }
    return T.tryCatch(
        () => fetch(apiUrl, requestData).then(resp => resp.json().then(json => json)),
        (reason) => new Error(String(reason)),
    );
}