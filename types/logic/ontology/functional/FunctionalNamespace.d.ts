import EcNamespace from "./ec/EcNamespace";
import GoNamespace from "./go/GoNamespace";
import InterproNamespace from "./interpro/InterproNamespace";
declare type FunctionalNamespace = EcNamespace | GoNamespace | InterproNamespace;
export default FunctionalNamespace;
