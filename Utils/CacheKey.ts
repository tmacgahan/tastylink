import fs from 'fs';

export class CacheKey {
    private readonly verb: string;
    private readonly symbol: string;
    private readonly timestamp: string;
    private readonly params: string;

    constructor(setVerb: string, setSymbol: string, setTimestamp: string, ...params: string[]) {
        this.verb = setVerb;
        this.symbol = setSymbol;
        this.timestamp = setTimestamp;
        let setParams = "";
        for( var ii = 0; ii < params.length; ii++ ) {
            setParams = `${setParams}_${params[ii]}`
        }
        this.params = setParams;
    }

    public path(): string {
        return `./cache/${this.verb}.${this.symbol}.${this.timestamp}${this.params}.json`;
    }

    public exists(): boolean {
        return fs.existsSync(this.path());
    }

    public load<T>(): T {
        return JSON.parse(fs.readFileSync(this.path(), 'utf-8')) as T;
    }

    public write(data: string) {
        fs.writeFileSync(this.path(), data);
    }
}