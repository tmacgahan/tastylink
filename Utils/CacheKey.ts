import fs from 'fs';

export class CacheKey {
    private readonly verb: string;
    private readonly symbol: string;
    private readonly timestamp: string;

    constructor(setVerb: string, setSymbol: string, setTimestamp: string) {
        this.verb = setVerb;
        this.symbol = setSymbol;
        this.timestamp = setTimestamp;
    }

    public path(): string {
        return `./cache/${this.verb}.${this.symbol}.${this.timestamp}.json`;
    }

    public exists(): boolean {
        return fs.existsSync(this.path());
    }

    public load(): string {
        return fs.readFileSync(this.path(), 'utf-8');
    }

    public write(data: string) {
        fs.writeFileSync(this.path(), data);
    }
}