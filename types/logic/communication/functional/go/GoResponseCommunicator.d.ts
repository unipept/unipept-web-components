import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import GoResponse from "./GoResponse";
export default class GoResponseCommunicator implements FunctionalResponseCommunicator<GoCode, GoResponse> {
    private static goCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    static readonly GO_ENDPOINT: string;
    static apiBaseUrl: string;
    static batchSize: number;
    static setup(apiBaseUrl: string, batchSize: number): void;
    process(codes: GoCode[]): Promise<void>;
    getResponse(code: GoCode): GoResponse | undefined;
    getResponseMap(): Map<GoCode, GoResponse>;
    private static doProcess;
}
