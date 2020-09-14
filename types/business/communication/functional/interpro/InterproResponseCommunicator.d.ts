import { InterproCode } from "./../../../ontology/functional/interpro/InterproDefinition";
import InterproResponse from "./InterproResponse";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";
export default class InterproResponseCommunicator implements FunctionalResponseCommunicator<InterproCode, InterproResponse> {
    private static interproCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    static readonly INTERPRO_BATCH_SIZE: number;
    static readonly INTERPRO_ENDPOINT: string;
    process(codes: InterproCode[]): Promise<void>;
    getResponse(code: InterproCode): InterproResponse | undefined;
    getResponseMap(): Map<InterproCode, InterproResponse>;
    private static doProcess;
}
