import EcNamespace from "./ec/EcNamespace";
import GoNamespace from "./go/GoNamespace";
import InterproNamespace from "./interpro/InterproNamespace";

type FunctionalNamespace = EcNamespace | GoNamespace | InterproNamespace;

export default FunctionalNamespace;
