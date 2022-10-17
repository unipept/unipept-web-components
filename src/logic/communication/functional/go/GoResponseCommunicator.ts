import EcCode from "../../../../logic/ontology/functional/ec/EcCode";
import GoCode from "../../../../logic/ontology/functional/go/GoCode";
import NetworkUtils from "../../NetworkUtils";
import FunctionalResponseCommunicator from "../FunctionalResponseCommunicator";
import GoResponse from "./GoResponse";

export default class GoResponseCommunicator implements FunctionalResponseCommunicator<GoCode, GoResponse> {
    private static goCodeToResponseMap = new Map<GoCode, GoResponse>();
    private static codesProcessed = new Set<GoCode>();
    private static inProgress: Promise<void> | undefined;

    public static readonly GO_ENDPOINT: string = "/private_api/goterms";

    public static apiBaseUrl: string = "http://api.unipept.ugent.be";
    public static batchSize: number = 100;

    public static setup(apiBaseUrl: string, batchSize: number) {
        this.apiBaseUrl = apiBaseUrl;
        this.batchSize = batchSize;
    }

    public async process(codes: GoCode[]): Promise<void> {
        while (GoResponseCommunicator.inProgress) {
            await GoResponseCommunicator.inProgress;
        }

        GoResponseCommunicator.inProgress = GoResponseCommunicator.doProcess(codes);

        try {
            await GoResponseCommunicator.inProgress;
        } finally {
            GoResponseCommunicator.inProgress = undefined;
        }
    }

    public getResponse(code: GoCode): GoResponse | undefined {
        return GoResponseCommunicator.goCodeToResponseMap.get(code);
    }

    public getResponseMap(): Map<GoCode, GoResponse> {
        return GoResponseCommunicator.goCodeToResponseMap;
    }

    private static async doProcess(codes: EcCode[]) {
        const toProcess = codes.filter(c => !this.codesProcessed.has(c));

        for (let i = 0; i < toProcess.length; i += this.batchSize) {
            const data = JSON.stringify({
                goterms: toProcess.slice(i, i + this.batchSize)
            });

            const res = await NetworkUtils.postJSON(this.apiBaseUrl + this.GO_ENDPOINT, data);

            for (const term of res) {
                if (!this.goCodeToResponseMap.has(term.code)) {
                    this.goCodeToResponseMap.set(term.code, term)
                }
            }
        }

        for (const processed of toProcess) {
            this.codesProcessed.add(processed);
        }
    }
}
