import { Chain } from "./Chain";
import { CSV } from "./CSV";
import { Ledger } from "./Ledger";

export abstract class IMarketStrategy {
    protected ledger: Ledger = new Ledger()

    abstract MaintainPosition(date: string, chain: Chain): void

    public AccountValue(chain: Chain): bigint { return this.ledger.TotalPNL(chain) }
    public ToCSV(): CSV { return this.ledger.ToCSV() }
    public ResolveEOD(chain: Chain) { this.ledger.ResolveEOD(chain) }
}