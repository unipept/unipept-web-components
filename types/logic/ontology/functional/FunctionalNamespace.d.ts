import EcNamespace from "./ec/EcNamespace";
import { GoNamespace } from "./go";
import { InterproNamespace } from "./interpro";
declare type FunctionalNamespace = EcNamespace | GoNamespace | InterproNamespace;
export default FunctionalNamespace;
