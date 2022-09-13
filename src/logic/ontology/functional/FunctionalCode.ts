import EcCode from "./ec/EcCode";
import { GoCode } from "./go";
import { InterproCode } from "./interpro";

type FunctionalCode = EcCode | GoCode | InterproCode;

export default FunctionalCode;
