import * as fs from 'fs';

export function LoadAPIToken(): string {
    return String(fs.readFileSync('secrets/marketdata.token'));
}