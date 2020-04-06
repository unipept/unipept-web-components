import OntologyProcessor from "./../../OntologyProcessor";
import EcDefinition, { EcCode } from "./EcDefinition";
import { CountTable } from "./../../../counts/CountTable";
import { Ontology } from "./../../Ontology";
import EcResponseCommunicator from "./../../../communication/functional/ec/EcResponseCommunicator";
import { convertEcNumberToEcNamespace } from "./EcNamespace";
import FunctionalOntologyProcessor from "./../FunctionalOntologyProcessor";
import { EcResponse } from "./../../../communication/functional/ec/EcResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";

export default class EcOntologyProcessor extends FunctionalOntologyProcessor<EcCode, EcDefinition, EcResponse> {
    protected getCommunicator(): FunctionalResponseCommunicator<EcCode, EcResponse> {
        return new EcResponseCommunicator();
    }

    protected responseToDefinition(response: EcResponse): EcDefinition {
        return new EcDefinition(response.code, response.name, convertEcNumberToEcNamespace(response.code));
    }
}
