import EcCode from "./ec/EcCode";
import { GoCode } from "./go";
import { InterproCode } from "./interpro";
declare type FunctionalCode = EcCode | GoCode | InterproCode;
export default FunctionalCode;
