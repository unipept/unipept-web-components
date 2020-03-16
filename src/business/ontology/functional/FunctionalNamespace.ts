import { GoNamespace } from "./go/GoNamespace";
import { EcNamespace } from "./ec/EcNamespace";
import { InterproNamespace } from "./interpro/InterproNameSpace";

export type FunctionalNamespace = GoNamespace | EcNamespace | InterproNamespace;
