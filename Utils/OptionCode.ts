export interface OptionCode {
    code: string,
    strike: number,
    side: string,
    day: string,
    month: string,
    year: string,
    symbol: string,
}

export function decode(code: string): OptionCode {
    return {
        code: code,
        strike: parseInt(code.slice(code.length - 8, code.length)) / 1000,
        side: code.slice(code.length - 9, code.length - 8),
        day: code.slice(code.length - 11, code.length - 9),
        month: code.slice(code.length - 13, code.length - 11),
        year: `20${code.slice(code.length - 15, code.length - 13)}`,
        symbol: code.slice(0, code.length - 15),
    }
}