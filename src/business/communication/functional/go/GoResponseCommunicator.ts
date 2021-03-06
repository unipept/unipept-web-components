import { GoResponse } from "./GoResponse";
import { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import NetworkUtils from "./../../NetworkUtils";
import NetworkConfiguration from "./../../NetworkConfiguration";
import { EcCode } from "./../../../ontology/functional/ec/EcDefinition";
import FunctionalResponseCommunicator from "./../../../communication/functional/FunctionalResponseCommunicator";

export default class GoResponseCommunicator implements FunctionalResponseCommunicator<GoCode, GoResponse> {
    private static goCodeToResponseMap = new Map<GoCode, GoResponse>();
    private static codesProcessed = new Set<GoCode>();
    private static inProgress: Promise<void>;

    public static readonly GO_BATCH_SIZE: number = 100;
    public static readonly GO_ENDPOINT: string = "/private_api/goterms";

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

        for (let i = 0; i < toProcess.length; i += this.GO_BATCH_SIZE) {
            const data = JSON.stringify({
                goterms: toProcess.slice(i, i + this.GO_BATCH_SIZE)
            });

            const res = await NetworkUtils.postJSON(NetworkConfiguration.BASE_URL + this.GO_ENDPOINT, data);

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
