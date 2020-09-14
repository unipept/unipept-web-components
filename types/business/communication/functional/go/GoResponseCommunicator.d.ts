import { GoResponse } from "./GoResponse";
import { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
export default class GoResponseCommunicator implements FunctionalResponseCommunicator<GoCode, GoResponse> {
    private static goCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    static readonly GO_BATCH_SIZE: number;
    static readonly GO_ENDPOINT: string;
    process(codes: GoCode[]): Promise<void>;
    getResponse(code: GoCode): GoResponse | undefined;
    getResponseMap(): Map<GoCode, GoResponse>;
    private static doProcess;
}
