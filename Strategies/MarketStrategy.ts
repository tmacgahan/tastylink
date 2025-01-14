import { Chain } from "./Chain";
import { CSV } from "./CSV";

export interface MarketStrategy {
    MaintainPosition(date: string, chain: Chain): void
    AccountValue(chain: Chain): bigint
    ToCSV(): CSV
}