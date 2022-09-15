import EcCode from "./ec/EcCode";
import GoCode from "./go/GoCode";
import InterproCode from "./interpro/InterproCode";
declare type FunctionalCode = EcCode | GoCode | InterproCode;
export default FunctionalCode;
