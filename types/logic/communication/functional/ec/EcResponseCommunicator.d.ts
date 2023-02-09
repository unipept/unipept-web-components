import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import EcResponse from "./EcResponse";
export default class EcResponseCommunicator implements FunctionalResponseCommunicator<EcCode, EcResponse> {
    private static ecCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    static readonly EC_ENDPOINT: string;
    static apiBaseUrl: string;
    static batchSize: number;
    static setup(apiBaseUrl: string, batchSize: number): void;
    process(codes: EcCode[]): Promise<void>;
    getResponse(code: EcCode): EcResponse | undefined;
    private static doProcess;
}
