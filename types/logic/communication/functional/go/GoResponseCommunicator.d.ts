import { GoCode } from "@/logic/ontology";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import GoResponse from "./GoResponse";
export default class GoResponseCommunicator implements FunctionalResponseCommunicator<GoCode, GoResponse> {
    private static goCodeToResponseMap;
    private static codesProcessed;
    private static inProgress;
    private static readonly apiBaseUrl;
    static readonly GO_BATCH_SIZE: number;
    static readonly GO_ENDPOINT: string;
    process(codes: GoCode[]): Promise<void>;
    getResponse(code: GoCode): GoResponse | undefined;
    getResponseMap(): Map<GoCode, GoResponse>;
    private static doProcess;
}
