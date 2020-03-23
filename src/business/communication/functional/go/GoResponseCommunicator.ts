import { GoResponse } from "./GoResponse";
import { GoCode } from "./../../../ontology/functional/go/GoDefinition";
import NetworkUtils from "./../../NetworkUtils";
import NetworkConfiguration from "./../../NetworkConfiguration";
import { EcCode } from "./../../../ontology/functional/ec/EcDefinition";

export default class GoResponseCommunicator {
    private static goCodeToResponseMap = new Map<GoCode, GoResponse>();
    private static codesProcessed = new Set<GoCode>();
    private static inProgress: Promise<void>;

    public static readonly GO_BATCH_SIZE: number = 100;
    public static readonly GO_ENDPOINT: string = "/private_api/goterms";

    public static async process(codes: GoCode[]): Promise<void> {
        if (this.inProgress) {
            await this.inProgress;
        }

        this.inProgress = this.doProcess(codes);
        await this.inProgress;
        this.inProgress = undefined;
    }

    public static getResponse(code: GoCode): GoResponse | undefined {
        return this.goCodeToResponseMap.get(code);
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
