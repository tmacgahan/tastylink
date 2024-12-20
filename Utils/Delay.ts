import * as T from 'fp-ts/TaskEither';

export function DelayTask(ms: number): T.TaskEither<Error, void> {
    return T.tryCatch(
         () => new Promise(resolve => setTimeout(resolve, ms)),
         (reason) => new Error(String(reason)),
    )
}

export function Delay(ms: number): void {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
        now = Date.now();
    }
}