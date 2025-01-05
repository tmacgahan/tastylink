import { Chain } from "./Chain";

export interface MarketStrategy {
    MaintainPosition(date: string, chain: Chain): void
    AccountValue(chain: Chain): number
}