import { EcCode } from "@/logic/ontology";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import EcResponse from "./EcResponse";
export default class EcResponseCommunicator implements FunctionalResponseCommunicator<EcCode, EcResponse> {
    private static ecCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    private static readonly apiBaseUrl;
    static readonly EC_BATCH_SIZE: number;
    static readonly EC_ENDPOINT: string;
    process(codes: EcCode[]): Promise<void>;
    getResponse(code: EcCode): EcResponse | undefined;
    private static doProcess;
}
