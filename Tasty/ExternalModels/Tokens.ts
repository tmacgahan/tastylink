import { DxLoginReply } from "./DxLoginReply";
import { TastyLoginReply } from "./TastyLoginReply";
export interface Tokens {
    dxToken: DxLoginReply,
    tastyToken: TastyLoginReply
}