import { GoNamespace } from "./go/GoNamespace";
import { EcNamespace } from "./ec/EcNamespace";
import { InterproNamespace } from "./interpro/InterproNamespace";

export type FunctionalNamespace = GoNamespace | EcNamespace | InterproNamespace;
