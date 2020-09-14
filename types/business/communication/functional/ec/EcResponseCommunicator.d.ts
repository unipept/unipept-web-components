import { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import { EcResponse } from "./EcResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
export default class EcResponseCommunicator implements FunctionalResponseCommunicator<EcCode, EcResponse> {
    private static ecCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    static readonly EC_BATCH_SIZE: number;
    static readonly EC_ENDPOINT: string;
    process(codes: EcCode[]): Promise<void>;
    getResponse(code: EcCode): EcResponse;
    getResponseMap(): Map<EcCode, EcResponse>;
    private static doProcess;
}
